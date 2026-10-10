package vn.skillbridge.auth.application.session;

import java.time.Instant;
import vn.skillbridge.auth.domain.account.AuthUser;

public record AuthResult(
        AuthUser user,
        String accessToken,
        String refreshToken,
        Instant refreshExpiresAt) {}
