package vn.skillbridge.auth.application.session;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import vn.skillbridge.auth.domain.account.AuthUser;

public interface TokenService {
    String issueAccessToken(AuthUser user, Instant now, Duration ttl);
    String issueRefreshToken(AuthUser user, UUID sessionId, Instant now, Duration ttl);
    RefreshTokenClaims parseRefreshToken(String token);
    AccessTokenClaims parseAccessToken(String token);
    String fingerprint(String token);

    record RefreshTokenClaims(UUID userId, UUID sessionId) {}
    record AccessTokenClaims(UUID userId, String email, String displayName, String role, boolean emailVerified,
            String studentVerificationStatus, String smeApprovalStatus) {}
}
