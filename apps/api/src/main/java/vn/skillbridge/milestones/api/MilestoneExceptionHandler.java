package vn.skillbridge.milestones.api;

import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.bind.annotation.*;
import vn.skillbridge.milestones.domain.MilestoneViolation;
import vn.skillbridge.platform.api.dto.ApiError;

@RestControllerAdvice @Order(Ordered.HIGHEST_PRECEDENCE)
public class MilestoneExceptionHandler {
    @ExceptionHandler(MilestoneViolation.class)
    public ResponseEntity<ApiError> error(MilestoneViolation e){
        int status=switch(e.code()){case "MILESTONE_NOT_FOUND"->404;case "ACCESS_DENIED"->403;case "MILESTONE_CONFLICT"->409;case "AI_RATE_LIMIT"->429;default->e.code().startsWith("AI_")||e.code().startsWith("STORAGE_")?503:422;};
        return ResponseEntity.status(status).body(new ApiError(e.code(),e.getMessage(),UUID.randomUUID().toString()));
    }
}
