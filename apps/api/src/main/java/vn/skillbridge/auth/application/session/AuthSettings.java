package vn.skillbridge.auth.application.session;

import java.time.Duration;

public record AuthSettings(Duration accessTtl, Duration refreshTtl, Duration rememberedRefreshTtl) {
}
