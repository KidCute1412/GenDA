package vn.skillbridge.users.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.skillbridge.auth.application.session.AuthenticatedPrincipal;
import vn.skillbridge.users.api.dto.EducationRequest;
import vn.skillbridge.users.api.dto.EducationResponse;
import vn.skillbridge.users.application.EducationService;

@RestController
@RequestMapping("/api/v1/users/me/education")
@SecurityRequirement(name = "cookieAuth")
public class EducationController {
    private final EducationService education;

    public EducationController(EducationService education) {
        this.education = education;
    }

    @GetMapping
    @Operation(summary = "List the contributor's self-declared education, newest period first")
    public List<EducationResponse> list(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return education.list(principal.id()).stream().map(EducationResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add an education entry")
    public EducationResponse add(@AuthenticationPrincipal AuthenticatedPrincipal principal,
            @Valid @RequestBody EducationRequest request) {
        return EducationResponse.from(education.add(principal.id(), request.toDetails()));
    }

    @PutMapping("/{educationId}")
    @Operation(summary = "Replace one of the contributor's education entries")
    public EducationResponse update(@AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable UUID educationId, @Valid @RequestBody EducationRequest request) {
        return EducationResponse.from(education.update(principal.id(), educationId, request.toDetails()));
    }

    @DeleteMapping("/{educationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete one of the contributor's education entries")
    public void delete(@AuthenticationPrincipal AuthenticatedPrincipal principal, @PathVariable UUID educationId) {
        education.delete(principal.id(), educationId);
    }
}
