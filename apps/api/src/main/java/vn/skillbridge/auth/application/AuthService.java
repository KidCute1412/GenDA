package vn.skillbridge.auth.application;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.auth.domain.AuthUser;
import vn.skillbridge.auth.domain.RegistrationIdentity;
import vn.skillbridge.auth.domain.UserRole;

@Service
public class AuthService {
    private final AuthAccountRepository accounts;
    private final RefreshSessionStore sessions;
    private final PasswordVerifier passwords;
    private final PasswordHasher passwordHasher;
    private final TokenService tokens;
    private final Clock clock;
    private final Duration accessTtl;
    private final Duration refreshTtl;
    private final Duration rememberedRefreshTtl;

    public AuthService(AuthAccountRepository accounts, RefreshSessionStore sessions, PasswordVerifier passwords,
            PasswordHasher passwordHasher, TokenService tokens, Clock clock, AuthSettings settings) {
        this.accounts = accounts;
        this.sessions = sessions;
        this.passwords = passwords;
        this.passwordHasher = passwordHasher;
        this.tokens = tokens;
        this.clock = clock;
        this.accessTtl = settings.accessTtl();
        this.refreshTtl = settings.refreshTtl();
        this.rememberedRefreshTtl = settings.rememberedRefreshTtl();
    }

    @Transactional
    public AuthResult login(String email, String password, boolean rememberDevice) {
        AuthUser user = accounts.findByEmail(email.trim().toLowerCase(Locale.ROOT))
                .filter(candidate -> passwords.matches(password, candidate.passwordHash()))
                .orElseThrow(AuthService::invalidCredentials);
        if (!user.canSignIn()) {
            String code = user.active() ? "SME_NOT_APPROVED" : "ACCOUNT_DISABLED";
            throw new AuthException(code, "Account is not allowed to sign in");
        }

        return issueSession(user, rememberDevice);
    }

    @Transactional
    public RegistrationResult register(RegistrationCommand command) {
        if (command.role() == null || command.role() == UserRole.ADMIN) {
            throw new AuthException("REGISTRATION_ROLE_INVALID", "Only STUDENT and SME accounts can register");
        }

        String email = command.email().trim().toLowerCase(Locale.ROOT);
        if (accounts.findByEmail(email).isPresent()) {
            throw new AuthException("EMAIL_ALREADY_REGISTERED", "An account already exists for this email");
        }

        RegistrationIdentity identity;
        try {
            identity = RegistrationIdentity.create(command.role(), command.taxCode(), command.companyWebsite());
        } catch (IllegalArgumentException exception) {
            throw new AuthException("SME_IDENTITY_REQUIRED",
                    "SME registration requires a valid Vietnamese tax code or company website");
        }

        AuthUser user = new AuthUser(UUID.randomUUID(), email, passwordHasher.hash(command.password()),
                command.name().trim(), command.role(), false,
                command.role() == UserRole.STUDENT ? "UNVERIFIED" : null,
                command.role() == UserRole.SME ? "PENDING" : null, true);
        accounts.create(user, identity.taxCode(), identity.companyWebsite());

        AuthResult session = command.role() == UserRole.STUDENT ? issueSession(user, false) : null;
        return new RegistrationResult(user, session);
    }

    @Transactional
    public AuthResult refresh(String rawRefreshToken) {
        TokenService.RefreshTokenClaims claims = parseRefresh(rawRefreshToken);
        Instant now = clock.instant();
        RefreshSession session = sessions.findById(claims.sessionId())
                .orElseThrow(AuthService::invalidRefresh);
        if (!session.userId().equals(claims.userId()) || !session.isUsableAt(now)
                || !session.tokenFingerprint().equals(tokens.fingerprint(rawRefreshToken))) {
            if (session.isUsableAt(now)) sessions.revoke(session.id(), now);
            throw invalidRefresh();
        }
        AuthUser user = accounts.findById(claims.userId()).filter(AuthUser::canSignIn)
                .orElseThrow(AuthService::invalidRefresh);
        Duration ttl = session.rememberDevice() ? rememberedRefreshTtl : refreshTtl;
        String nextRefreshToken = tokens.issueRefreshToken(user, session.id(), now, ttl);
        sessions.rotate(session.id(), tokens.fingerprint(nextRefreshToken), now.plus(ttl), now);
        return new AuthResult(user, tokens.issueAccessToken(user, now, accessTtl), nextRefreshToken, now.plus(ttl));
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) return;
        try {
            var claims = tokens.parseRefreshToken(rawRefreshToken);
            sessions.revoke(claims.sessionId(), clock.instant());
        } catch (RuntimeException ignored) {
            // Cookies are cleared even when a stale or malformed refresh token is presented.
        }
    }

    private TokenService.RefreshTokenClaims parseRefresh(String token) {
        if (token == null || token.isBlank()) throw invalidRefresh();
        try {
            return tokens.parseRefreshToken(token);
        } catch (RuntimeException exception) {
            throw invalidRefresh();
        }
    }

    private AuthResult issueSession(AuthUser user, boolean rememberDevice) {
        Instant now = clock.instant();
        Duration ttl = rememberDevice ? rememberedRefreshTtl : refreshTtl;
        UUID sessionId = UUID.randomUUID();
        String refreshToken = tokens.issueRefreshToken(user, sessionId, now, ttl);
        sessions.create(new RefreshSession(sessionId, user.id(), tokens.fingerprint(refreshToken), rememberDevice,
                now.plus(ttl), null, now, now));
        return new AuthResult(user, tokens.issueAccessToken(user, now, accessTtl), refreshToken, now.plus(ttl));
    }

    private static AuthException invalidCredentials() {
        return new AuthException("INVALID_CREDENTIALS", "Email or password is incorrect");
    }

    private static AuthException invalidRefresh() {
        return new AuthException("INVALID_REFRESH_TOKEN", "Refresh session is invalid or expired");
    }

    public record AuthSettings(Duration accessTtl, Duration refreshTtl, Duration rememberedRefreshTtl) {}
}
