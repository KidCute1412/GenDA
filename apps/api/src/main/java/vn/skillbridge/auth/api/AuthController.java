package vn.skillbridge.auth.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;
import vn.skillbridge.auth.application.AuthResult;
import vn.skillbridge.auth.application.AuthService;
import vn.skillbridge.auth.application.AuthenticatedPrincipal;
import vn.skillbridge.auth.application.RegistrationCommand;
import vn.skillbridge.auth.application.RegistrationResult;
import vn.skillbridge.auth.domain.UserRole;
import vn.skillbridge.auth.infrastructure.CsrfProtection;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    private final AuthCookieWriter cookies;
    private final CsrfProtection csrf;

    public AuthController(AuthService authService, AuthCookieWriter cookies, CsrfProtection csrf) {
        this.authService = authService;
        this.cookies = cookies;
        this.csrf = csrf;
    }

    @GetMapping("/csrf")
    @Operation(summary = "Issue a CSRF token for cookie-authenticated mutations")
    public CsrfResponse csrf(HttpServletRequest request, HttpServletResponse response) {
        return new CsrfResponse(csrf.issue(request, response));
    }

    @PostMapping("/login")
    @Operation(summary = "Sign in and issue HttpOnly access and refresh cookies")
    public AuthUserResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResult result = authService.login(request.email(), request.password(), request.rememberDevice());
        cookies.write(response, result);
        return AuthUserResponse.from(result.user());
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a student or an SME account")
    public AuthUserResponse register(@Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {
        RegistrationResult result = authService.register(new RegistrationCommand(request.name(), request.email(),
                request.password(), UserRole.valueOf(request.role().name()), request.taxCode(),
                request.companyWebsite()));
        if (result.sessionIssued()) cookies.write(response, result.session());
        return AuthUserResponse.from(result.user());
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate the refresh token and issue a fresh access token")
    public AuthUserResponse refresh(
            @CookieValue(name = AuthCookieWriter.REFRESH_COOKIE, required = false) String refreshToken,
            HttpServletResponse response) {
        AuthResult result = authService.refresh(refreshToken);
        cookies.write(response, result);
        return AuthUserResponse.from(result.user());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Revoke the current refresh session and clear auth cookies")
    public void logout(
            @CookieValue(name = AuthCookieWriter.REFRESH_COOKIE, required = false) String refreshToken,
            HttpServletResponse response) {
        authService.logout(refreshToken);
        cookies.clear(response);
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "cookieAuth")
    @Operation(summary = "Return the authenticated user represented by the access cookie")
    public AuthUserResponse me(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return AuthUserResponse.from(principal);
    }
}
