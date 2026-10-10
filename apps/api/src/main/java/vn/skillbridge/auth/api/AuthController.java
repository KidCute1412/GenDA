package vn.skillbridge.auth.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletRequest;
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
import vn.skillbridge.auth.application.account.AuthRateLimitService;
import vn.skillbridge.auth.application.account.RegistrationCommand;
import vn.skillbridge.auth.application.account.RegistrationService;
import vn.skillbridge.auth.application.session.AuthResult;
import vn.skillbridge.auth.application.session.AuthenticatedPrincipal;
import vn.skillbridge.auth.application.session.CsrfTokenService;
import vn.skillbridge.auth.application.session.SessionService;
import vn.skillbridge.auth.domain.account.AuthUser;
import vn.skillbridge.auth.domain.account.UserRole;
import vn.skillbridge.platform.api.dto.ApiError;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final LoginService loginService;
    private final RegistrationService registrationService;
    private final SessionService sessionService;
    private final AuthCookieWriter cookies;
    private final CsrfTokenService csrf;
    private final AuthRateLimitService rateLimits;

    public AuthController(LoginService loginService, RegistrationService registrationService,
            SessionService sessionService, AuthCookieWriter cookies, CsrfTokenService csrf,
            AuthRateLimitService rateLimits) {
        this.loginService = loginService;
        this.registrationService = registrationService;
        this.sessionService = sessionService;
        this.cookies = cookies;
        this.csrf = csrf;
        this.rateLimits = rateLimits;
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
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authenticated account"),
            @ApiResponse(responseCode = "429", description = "AUTH_RATE_LIMITED",
                    headers = @Header(name = "Retry-After", description = "Seconds until retry", schema = @Schema(type = "integer")),
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public AuthUserResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response,
            HttpServletRequest servletRequest) {
        rateLimits.login(request.email(), servletRequest.getRemoteAddr());
        AuthResult result = loginService.login(request.email(), request.password(), request.rememberDevice());
        cookies.write(response, result);
        return AuthUserResponse.from(result.user());
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register an active contributor or SME account")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Account created; sign in to start a session"),
            @ApiResponse(responseCode = "429", description = "AUTH_RATE_LIMITED",
                    headers = @Header(name = "Retry-After", description = "Seconds until retry", schema = @Schema(type = "integer")),
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public AuthUserResponse register(@Valid @RequestBody RegisterRequest request, HttpServletRequest servletRequest) {
        rateLimits.register(servletRequest.getRemoteAddr());
        AuthUser result = registrationService.register(new RegistrationCommand(request.name(), request.email(),
                request.password(), UserRole.valueOf(request.role().name()), request.taxCode(),
                request.companyWebsite()));
        return AuthUserResponse.from(result);
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
