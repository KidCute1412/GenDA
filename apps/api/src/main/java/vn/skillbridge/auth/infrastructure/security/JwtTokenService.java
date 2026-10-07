package vn.skillbridge.auth.infrastructure.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.HexFormat;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Component;
import vn.skillbridge.auth.application.session.TokenService;
import vn.skillbridge.auth.domain.account.AuthUser;
import vn.skillbridge.auth.infrastructure.config.AuthProperties;

@Component
public class JwtTokenService implements TokenService {
    private final SecretKey key;
    private final String issuer;

    public JwtTokenService(AuthProperties properties) {
        byte[] secret = properties.jwtSecret().getBytes(StandardCharsets.UTF_8);
        if (secret.length < 32) throw new IllegalStateException("AUTH_JWT_SECRET must contain at least 32 bytes");
        this.key = Keys.hmacShaKeyFor(secret);
        this.issuer = properties.issuer();
    }

    @Override
    public String issueAccessToken(AuthUser user, Instant now, Duration ttl) {
        return Jwts.builder()
                .issuer(issuer).subject(user.id().toString()).issuedAt(Date.from(now)).expiration(Date.from(now.plus(ttl)))
                .id(UUID.randomUUID().toString()).claim("typ", "access").claim("email", user.email())
                .claim("name", user.displayName()).claim("role", user.role().name())
                .claim("emailVerified", user.emailVerified())
                .claim("studentVerificationStatus", user.studentVerificationStatus())
                .claim("smeApprovalStatus", user.smeApprovalStatus()).signWith(key).compact();
    }

    @Override
    public String issueRefreshToken(AuthUser user, UUID sessionId, Instant now, Duration ttl) {
        return Jwts.builder()
                .issuer(issuer).subject(user.id().toString()).issuedAt(Date.from(now)).expiration(Date.from(now.plus(ttl)))
                .id(sessionId.toString()).claim("typ", "refresh").signWith(key).compact();
    }

    @Override
    public RefreshTokenClaims parseRefreshToken(String token) {
        Claims claims = parse(token, "refresh");
        return new RefreshTokenClaims(UUID.fromString(claims.getSubject()), UUID.fromString(claims.getId()));
    }

    @Override
    public AccessTokenClaims parseAccessToken(String token) {
        Claims claims = parse(token, "access");
        return new AccessTokenClaims(UUID.fromString(claims.getSubject()), claims.get("email", String.class),
                claims.get("name", String.class), claims.get("role", String.class),
                Boolean.TRUE.equals(claims.get("emailVerified", Boolean.class)),
                claims.get("studentVerificationStatus", String.class), claims.get("smeApprovalStatus", String.class));
    }

    @Override
    public String fingerprint(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    private Claims parse(String token, String expectedType) {
        Claims claims = Jwts.parser().verifyWith(key).requireIssuer(issuer).build()
                .parseSignedClaims(token).getPayload();
        if (!expectedType.equals(claims.get("typ", String.class))) {
            throw new IllegalArgumentException("Unexpected JWT type");
        }
        return claims;
    }
}
