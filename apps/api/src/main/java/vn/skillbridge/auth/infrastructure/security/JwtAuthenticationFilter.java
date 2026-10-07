package vn.skillbridge.auth.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import vn.skillbridge.auth.application.session.AuthenticatedPrincipal;
import vn.skillbridge.auth.application.session.TokenService;

@Component
class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final String ACCESS_COOKIE = "genda_access";
    private final TokenService tokens;

    JwtAuthenticationFilter(TokenService tokens) {
        this.tokens = tokens;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String rawToken = cookie(request, ACCESS_COOKIE);
        if (rawToken != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                var claims = tokens.parseAccessToken(rawToken);
                var principal = new AuthenticatedPrincipal(claims.userId(), claims.email(), claims.displayName(),
                        claims.role(), claims.accountState(), claims.emailVerified(),
                        claims.smeApprovalStatus());
                var authentication = new UsernamePasswordAuthenticationToken(principal, null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + claims.role())));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (RuntimeException ignored) {
                // Expired or malformed access cookies are treated as unauthenticated; refresh is explicit.
            }
        }
        chain.doFilter(request, response);
    }

    private static String cookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) if (name.equals(cookie.getName())) return cookie.getValue();
        return null;
    }
}
