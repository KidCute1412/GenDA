package vn.skillbridge.auth.application;

import java.time.Instant;
import vn.skillbridge.auth.domain.AuthUser;

public record AuthResult(
        AuthUser user,
        String accessToken,
        String refreshToken,
        Instant refreshExpiresAt) {}
