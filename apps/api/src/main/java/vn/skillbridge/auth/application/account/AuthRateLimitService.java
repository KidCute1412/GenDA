package vn.skillbridge.auth.application.account;

import java.time.Clock;
import java.time.Instant;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Service;
import vn.skillbridge.auth.application.AuthException;

@Service
public class AuthRateLimitService {
    private static final int MAX_BUCKETS = 10_000;
    private final Map<String, Bucket> buckets = new HashMap<>();
    private final Clock clock;

    public AuthRateLimitService(Clock clock) { this.clock = clock; }

    public synchronized void login(String email, String source) {
        Instant now = clock.instant();
        String account = "login:email:" + email.trim().toLowerCase(Locale.ROOT);
        String address = "login:source:" + source;
        check(account, 10, now);
        check(address, 30, now);
        increment(account, 900, now);
        increment(address, 900, now);
    }

    public synchronized void register(String source) {
        Instant now = clock.instant();
        String key = "register:source:" + source;
        check(key, 5, now);
        increment(key, 3600, now);
    }

    private void check(String key, int limit, Instant now) {
        Bucket bucket = buckets.get(key);
        if (bucket != null && now.isBefore(bucket.expiresAt()) && bucket.count() >= limit) {
            throw limited(Math.max(1, bucket.expiresAt().getEpochSecond() - now.getEpochSecond()));
        }
        if (buckets.size() >= MAX_BUCKETS - 1) {
            buckets.entrySet().removeIf(entry -> !now.isBefore(entry.getValue().expiresAt()));
            if (buckets.size() >= MAX_BUCKETS - 1 && bucket == null) throw limited(60);
        }
    }

    private void increment(String key, long seconds, Instant now) {
        Bucket bucket = buckets.get(key);
        buckets.put(key, bucket == null || !now.isBefore(bucket.expiresAt())
                ? new Bucket(1, now.plusSeconds(seconds)) : new Bucket(bucket.count() + 1, bucket.expiresAt()));
    }

    private static AuthException limited(long seconds) {
        return new AuthException("AUTH_RATE_LIMITED", "Too many attempts. Try again later", seconds);
    }

    // shortcut: counters reset on restart and are per process; use a shared store before adding API replicas.
    private record Bucket(int count, Instant expiresAt) {}
}
