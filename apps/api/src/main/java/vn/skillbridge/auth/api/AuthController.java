package vn.skillbridge.auth.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
import vn.skillbridge.auth.api.dto.AuthUserResponse;
import vn.skillbridge.auth.api.dto.CsrfResponse;
import vn.skillbridge.auth.api.dto.LoginRequest;
import vn.skillbridge.auth.api.dto.RegisterRequest;
import vn.skillbridge.auth.application.account.LoginService;
import vn.skillbridge.auth.application.account.RegistrationCommand;
import vn.skillbridge.auth.application.account.RegistrationResult;
import vn.skillbridge.auth.application.account.RegistrationService;
import vn.skillbridge.auth.application.session.AuthResult;
import vn.skillbridge.auth.application.session.AuthenticatedPrincipal;
import vn.skillbridge.auth.application.session.CsrfTokenService;
import vn.skillbridge.auth.application.session.SessionService;
import vn.skillbridge.auth.domain.account.UserRole;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final LoginService loginService;
    private final RegistrationService registrationService;
    private final SessionService sessionService;
    private final AuthCookieWriter cookies;
    private final CsrfTokenService csrf;

    public AuthController(LoginService loginService, RegistrationService registrationService,
            SessionService sessionService, AuthCookieWriter cookies, CsrfTokenService csrf) {
        this.loginService = loginService;
        this.registrationService = registrationService;
        this.sessionService = sessionService;
        this.cookies = cookies;
        this.csrf = csrf;
    }

    @GetMapping("/csrf")
    @Operation(summary = "Issue a CSRF token for cookie-authenticated mutations")
    public CsrfResponse csrf(
            @CookieValue(name = AuthCookieWriter.CSRF_COOKIE, required = false) String currentToken,
            HttpServletResponse response) {
        String token = csrf.issue(currentToken);
        cookies.writeCsrf(response, token);
        return new CsrfResponse(token);
    }

    @PostMapping("/login")
    @Operation(summary = "Sign in and issue HttpOnly access and refresh cookies")
    public AuthUserResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResult result = loginService.login(request.email(), request.password(), request.rememberDevice());
        cookies.write(response, result);
        return AuthUserResponse.from(result.user());
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a student or an SME account")
    public AuthUserResponse register(@Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {
        RegistrationResult result = registrationService.register(new RegistrationCommand(request.name(), request.email(),
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
        AuthResult result = sessionService.refresh(refreshToken);
        cookies.write(response, result);
        return AuthUserResponse.from(result.user());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Revoke the current refresh session and clear auth cookies")
    public void logout(
            @CookieValue(name = AuthCookieWriter.REFRESH_COOKIE, required = false) String refreshToken,
            HttpServletResponse response) {
        sessionService.logout(refreshToken);
        cookies.clear(response);
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "cookieAuth")
    @Operation(summary = "Return the authenticated user represented by the access cookie")
    public AuthUserResponse me(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return AuthUserResponse.from(principal);
    }
}
