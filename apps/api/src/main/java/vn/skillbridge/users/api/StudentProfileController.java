package vn.skillbridge.users.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.skillbridge.auth.application.session.AuthenticatedPrincipal;
import vn.skillbridge.users.api.dto.StudentProfileResponse;
import vn.skillbridge.users.api.dto.UpdateStudentProfileRequest;
import vn.skillbridge.users.application.StudentProfileService;
import vn.skillbridge.users.application.UpdateStudentProfileCommand;

@RestController
@RequestMapping("/api/v1/users/me/profile")
@SecurityRequirement(name = "cookieAuth")
public class StudentProfileController {
    private final StudentProfileService profiles;

    public StudentProfileController(StudentProfileService profiles) {
        this.profiles = profiles;
    }

    @GetMapping
    @Operation(summary = "View the authenticated student's profile")
    public StudentProfileResponse get(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return StudentProfileResponse.from(profiles.get(principal.id()));
    }

    @PutMapping
    @Operation(summary = "Replace the authenticated student's editable profile information")
    public StudentProfileResponse update(@AuthenticationPrincipal AuthenticatedPrincipal principal,
            @Valid @RequestBody UpdateStudentProfileRequest request) {
        var command = new UpdateStudentProfileCommand(request.displayName(), request.school(), request.major(),
                request.studyYear(), request.skillCodes());
        return StudentProfileResponse.from(profiles.update(principal.id(), command));
    }
}
