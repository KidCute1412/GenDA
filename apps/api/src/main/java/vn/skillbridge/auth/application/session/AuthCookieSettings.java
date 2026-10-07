package vn.skillbridge.auth.application.session;

import java.time.Duration;

public record AuthCookieSettings(Duration accessTtl, boolean secure, String sameSite) {
}
