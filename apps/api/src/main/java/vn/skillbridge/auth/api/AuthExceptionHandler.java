package vn.skillbridge.auth.api;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import vn.skillbridge.auth.application.AuthException;
import vn.skillbridge.platform.api.dto.ApiError;

@RestControllerAdvice(assignableTypes = AuthController.class)
public class AuthExceptionHandler {
    @ExceptionHandler(AuthException.class)
    ResponseEntity<ApiError> auth(AuthException exception) {
        HttpStatus status = switch (exception.code()) {
            case "INVALID_CREDENTIALS", "INVALID_REFRESH_TOKEN" -> HttpStatus.UNAUTHORIZED;
            case "EMAIL_ALREADY_REGISTERED" -> HttpStatus.CONFLICT;
            case "REGISTRATION_ROLE_INVALID", "SME_IDENTITY_REQUIRED", "PASSWORD_INVALID" -> HttpStatus.BAD_REQUEST;
            case "AUTH_RATE_LIMITED" -> HttpStatus.TOO_MANY_REQUESTS;
            default -> HttpStatus.FORBIDDEN;
        };
        var response = ResponseEntity.status(status);
        if (exception.retryAfter() != null) response.header("Retry-After", exception.retryAfter().toString());
        return response.body(
                new ApiError(exception.code(), exception.getMessage(), UUID.randomUUID().toString()));
    }
}
