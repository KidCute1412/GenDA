package vn.skillbridge.projects.api;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import vn.skillbridge.platform.api.ApiExceptionHandler.ApiError;
import vn.skillbridge.projects.application.InvalidProjectFilterException;
import vn.skillbridge.projects.application.ProjectNotFoundException;

@RestControllerAdvice(assignableTypes = ProjectController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ProjectExceptionHandler {
    @ExceptionHandler(ProjectNotFoundException.class)
    ResponseEntity<ApiError> projectNotFound(ProjectNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ApiError("PROJECT_NOT_FOUND", "Published project was not found", UUID.randomUUID().toString()));
    }

    @ExceptionHandler(InvalidProjectFilterException.class)
    ResponseEntity<ApiError> invalidProjectFilter(InvalidProjectFilterException exception) {
        return ResponseEntity.badRequest().body(
                new ApiError("INVALID_PROJECT_FILTER", exception.getMessage(), UUID.randomUUID().toString()));
    }
}
