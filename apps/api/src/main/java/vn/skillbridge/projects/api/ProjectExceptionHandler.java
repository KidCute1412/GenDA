package vn.skillbridge.projects.api;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import vn.skillbridge.platform.api.dto.ApiError;
import vn.skillbridge.projects.application.InvalidProjectFilterException;
import vn.skillbridge.projects.application.ProjectException;
import vn.skillbridge.projects.application.ProjectNotFoundException;
import vn.skillbridge.projects.domain.ProjectRuleViolation;

/** Maps project failures for every entrypoint that invokes a projects use case, including admin moderation. */
@RestControllerAdvice
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

    @ExceptionHandler(ProjectException.class)
    ResponseEntity<ApiError> project(ProjectException exception) {
        HttpStatus status = switch (exception.code()) {
            case ProjectException.NOT_FOUND -> HttpStatus.NOT_FOUND;
            case ProjectException.SME_NOT_APPROVED, ProjectException.ADMIN_ROLE_REQUIRED -> HttpStatus.FORBIDDEN;
            default -> HttpStatus.BAD_REQUEST;
        };
        return ResponseEntity.status(status).body(
                new ApiError(exception.code(), exception.getMessage(), UUID.randomUUID().toString()));
    }

    @ExceptionHandler(ProjectRuleViolation.class)
    ResponseEntity<ApiError> rule(ProjectRuleViolation exception) {
        HttpStatus status = switch (exception.code()) {
            case ProjectRuleViolation.INVALID_TRANSITION -> HttpStatus.CONFLICT;
            case ProjectRuleViolation.NOT_READY, ProjectRuleViolation.BUDGET_OUTSIDE_LEVEL_RANGE ->
                    HttpStatus.UNPROCESSABLE_ENTITY;
            default -> HttpStatus.BAD_REQUEST;
        };
        return ResponseEntity.status(status).body(new ApiError(exception.code(), exception.getMessage(),
                UUID.randomUUID().toString(), exception.details()));
    }
}
