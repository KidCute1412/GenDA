package vn.skillbridge.auth.application.session;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.auth.application.AuthException;
import vn.skillbridge.auth.application.account.AuthUserRepository;
import vn.skillbridge.auth.domain.account.AuthUser;
import vn.skillbridge.auth.domain.session.RefreshSession;

@Service
public class SessionService {
    private final AuthUserRepository accounts;
    private final RefreshSessionRepository sessions;
    private final TokenService tokens;
    private final Clock clock;
    private final AuthSettings settings;

    public SessionService(AuthUserRepository accounts, RefreshSessionRepository sessions, TokenService tokens,
            Clock clock, AuthSettings settings) {
        this.accounts = accounts;
        this.sessions = sessions;
        this.tokens = tokens;
        this.clock = clock;
        this.settings = settings;
    }

    @Transactional
    public AuthResult refresh(String rawRefreshToken) {
        TokenService.RefreshTokenClaims claims = parseRefresh(rawRefreshToken);
        Instant now = clock.instant();
        RefreshSession session = sessions.findById(claims.sessionId()).orElseThrow(SessionService::invalidRefresh);
        if (!session.userId().equals(claims.userId()) || !session.isUsableAt(now)
                || !session.tokenFingerprint().equals(tokens.fingerprint(rawRefreshToken))) {
            if (session.isUsableAt(now)) sessions.revoke(session.id(), now);
            throw invalidRefresh();
        }
        AuthUser user = accounts.findById(claims.userId()).filter(AuthUser::canSignIn)
                .orElseThrow(SessionService::invalidRefresh);
        Duration ttl = session.rememberDevice() ? settings.rememberedRefreshTtl() : settings.refreshTtl();
        String nextRefreshToken = tokens.issueRefreshToken(user, session.id(), now, ttl);
        sessions.rotate(session.id(), tokens.fingerprint(nextRefreshToken), now.plus(ttl), now);
        return new AuthResult(user, tokens.issueAccessToken(user, now, settings.accessTtl()), nextRefreshToken,
                now.plus(ttl));
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) return;
        TokenService.RefreshTokenClaims claims;
        try {
            claims = tokens.parseRefreshToken(rawRefreshToken);
        } catch (RuntimeException ignored) {
            // Cookies are cleared even when a stale or malformed refresh token is presented.
            return;
        }
        sessions.revoke(claims.sessionId(), clock.instant());
    }

    private TokenService.RefreshTokenClaims parseRefresh(String token) {
        if (token == null || token.isBlank()) throw invalidRefresh();
        try {
            return tokens.parseRefreshToken(token);
        } catch (RuntimeException exception) {
            throw invalidRefresh();
        }
    }

    private static AuthException invalidRefresh() {
        return new AuthException("INVALID_REFRESH_TOKEN", "Refresh session is invalid or expired");
    }
}
