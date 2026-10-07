package vn.skillbridge.auth.application.session;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.skillbridge.auth.domain.account.AuthUser;
import vn.skillbridge.auth.domain.session.RefreshSession;

@Component
public class SessionIssuer {
    private final RefreshSessionRepository sessions;
    private final TokenService tokens;
    private final Clock clock;
    private final AuthSettings settings;

    public SessionIssuer(RefreshSessionRepository sessions, TokenService tokens, Clock clock, AuthSettings settings) {
        this.sessions = sessions;
        this.tokens = tokens;
        this.clock = clock;
        this.settings = settings;
    }

    public AuthResult issue(AuthUser user, boolean rememberDevice) {
        Instant now = clock.instant();
        Duration ttl = rememberDevice ? settings.rememberedRefreshTtl() : settings.refreshTtl();
        UUID sessionId = UUID.randomUUID();
        String refreshToken = tokens.issueRefreshToken(user, sessionId, now, ttl);
        sessions.create(new RefreshSession(sessionId, user.id(), tokens.fingerprint(refreshToken), rememberDevice,
                now.plus(ttl), null, now, now));
        return new AuthResult(user, tokens.issueAccessToken(user, now, settings.accessTtl()), refreshToken,
                now.plus(ttl));
    }
}
