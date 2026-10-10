package vn.skillbridge.users.api;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import vn.skillbridge.platform.api.dto.ApiError;
import vn.skillbridge.users.application.UsersException;

@RestControllerAdvice(assignableTypes = StudentProfileController.class)
public class UsersExceptionHandler {
    @ExceptionHandler(UsersException.class)
    ResponseEntity<ApiError> users(UsersException exception) {
        HttpStatus status = switch (exception.code()) {
            case "CONTRIBUTOR_ROLE_REQUIRED" -> HttpStatus.FORBIDDEN;
            default -> HttpStatus.BAD_REQUEST;
        };
        return ResponseEntity.status(status).body(
                new ApiError(exception.code(), exception.getMessage(), UUID.randomUUID().toString()));
    }
}
