package vn.skillbridge.applications.api;

import java.util.UUID;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import vn.skillbridge.applications.application.ApplicationException;
import vn.skillbridge.applications.domain.ApplicationRuleViolation;
import vn.skillbridge.platform.api.dto.ApiError;

@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE + 2)
public class ApplicationExceptionHandler {
    @ExceptionHandler(ApplicationException.class)
    ResponseEntity<ApiError> application(ApplicationException exception) {
        HttpStatus status = switch (exception.code()) {
            case ApplicationException.NOT_FOUND, ApplicationException.CV_NOT_AVAILABLE -> HttpStatus.NOT_FOUND;
            case ApplicationException.CONTRIBUTOR_ROLE_REQUIRED, ApplicationException.SME_NOT_APPROVED ->
                    HttpStatus.FORBIDDEN;
            case ApplicationException.PROJECT_NOT_OPEN, ApplicationException.ALREADY_APPLIED -> HttpStatus.CONFLICT;
            case ApplicationException.NOT_ELIGIBLE -> HttpStatus.UNPROCESSABLE_ENTITY;
            default -> HttpStatus.BAD_REQUEST;
        };
        return ResponseEntity.status(status).body(new ApiError(exception.code(), exception.getMessage(),
                UUID.randomUUID().toString(), exception.details()));
    }

    @ExceptionHandler(ApplicationRuleViolation.class)
    ResponseEntity<ApiError> rule(ApplicationRuleViolation exception) {
        HttpStatus status = ApplicationRuleViolation.INVALID_TRANSITION.equals(exception.code())
                ? HttpStatus.CONFLICT : HttpStatus.UNPROCESSABLE_ENTITY;
        return ResponseEntity.status(status).body(new ApiError(exception.code(), exception.getMessage(),
                UUID.randomUUID().toString(), exception.details()));
    }
}
