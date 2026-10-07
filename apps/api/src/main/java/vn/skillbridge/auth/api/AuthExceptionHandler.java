package vn.skillbridge.auth.api;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import vn.skillbridge.auth.application.AuthException;
import vn.skillbridge.platform.api.ApiExceptionHandler.ApiError;

@RestControllerAdvice(assignableTypes = AuthController.class)
public class AuthExceptionHandler {
    @ExceptionHandler(AuthException.class)
    ResponseEntity<ApiError> auth(AuthException exception) {
        HttpStatus status = switch (exception.code()) {
            case "INVALID_CREDENTIALS", "INVALID_REFRESH_TOKEN" -> HttpStatus.UNAUTHORIZED;
            case "EMAIL_ALREADY_REGISTERED" -> HttpStatus.CONFLICT;
            case "REGISTRATION_ROLE_INVALID", "SME_IDENTITY_REQUIRED" -> HttpStatus.BAD_REQUEST;
            case "OTP_INVALID" -> HttpStatus.UNPROCESSABLE_ENTITY;
            case "OTP_EXPIRED", "OTP_ATTEMPTS_EXCEEDED" -> HttpStatus.GONE;
            case "OTP_RESEND_TOO_SOON", "OTP_RATE_LIMITED" -> HttpStatus.TOO_MANY_REQUESTS;
            case "EMAIL_DELIVERY_FAILED" -> HttpStatus.SERVICE_UNAVAILABLE;
            default -> HttpStatus.FORBIDDEN;
        };
        return ResponseEntity.status(status).body(
                new ApiError(exception.code(), exception.getMessage(), UUID.randomUUID().toString()));
    }
}
