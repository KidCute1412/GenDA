package vn.skillbridge.users.api;

import java.util.UUID;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import vn.skillbridge.platform.api.dto.ApiError;
import vn.skillbridge.users.application.UsersException;
import vn.skillbridge.users.domain.ContributorRuleViolation;

@RestControllerAdvice(basePackageClasses = UsersExceptionHandler.class)
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class UsersExceptionHandler {
    @ExceptionHandler(UsersException.class)
    ResponseEntity<ApiError> users(UsersException exception) {
        HttpStatus status = switch (exception.code()) {
            case UsersException.CONTRIBUTOR_ROLE_REQUIRED -> HttpStatus.FORBIDDEN;
            case UsersException.EDUCATION_NOT_FOUND, UsersException.CV_NOT_FOUND -> HttpStatus.NOT_FOUND;
            case UsersException.EDUCATION_LIMIT_REACHED -> HttpStatus.CONFLICT;
            default -> HttpStatus.BAD_REQUEST;
        };
        return ResponseEntity.status(status).body(
                new ApiError(exception.code(), exception.getMessage(), UUID.randomUUID().toString()));
    }

    @ExceptionHandler(ContributorRuleViolation.class)
    ResponseEntity<ApiError> rule(ContributorRuleViolation exception) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(new ApiError(exception.code(),
                exception.getMessage(), UUID.randomUUID().toString(), exception.details()));
    }
}
