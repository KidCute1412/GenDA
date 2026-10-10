package vn.skillbridge.applications.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.skillbridge.applications.api.dto.ApplicantResponse;
import vn.skillbridge.applications.api.dto.ApplicationCountResponse;
import vn.skillbridge.applications.api.dto.ProjectApplicantsResponse;
import vn.skillbridge.applications.application.ApplicantReviewService;
import vn.skillbridge.auth.application.session.AuthenticatedPrincipal;
import vn.skillbridge.users.application.CvFile;

@RestController
@RequestMapping("/api/v1/sme")
@SecurityRequirement(name = "cookieAuth")
public class SmeApplicationController {
    private final ApplicantReviewService review;

    public SmeApplicationController(ApplicantReviewService review) {
        this.review = review;
    }

    @GetMapping("/projects/{projectId}/applications")
    @Operation(summary = "Applicants of an owned project, best skill match first")
    public ProjectApplicantsResponse applicants(@AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable String projectId) {
        return ProjectApplicantsResponse.from(review.applicants(principal.id(), projectId));
    }

    @GetMapping("/applications/counts")
    @Operation(summary = "Open and total application counts for owned projects")
    public List<ApplicationCountResponse> counts(@AuthenticationPrincipal AuthenticatedPrincipal principal,
            @RequestParam List<String> projectId) {
        return review.counts(principal.id(), projectId).entrySet().stream()
                .map(entry -> new ApplicationCountResponse(entry.getKey(), entry.getValue().open(),
                        entry.getValue().total()))
                .toList();
    }

    @PostMapping("/applications/{applicationId}/shortlist")
    @Operation(summary = "Move a submitted application to the shortlist")
    public ApplicantResponse shortlist(@AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable UUID applicationId) {
        return ApplicantResponse.from(review.shortlist(principal.id(), applicationId));
    }

    @PostMapping("/applications/{applicationId}/accept")
    @Operation(summary = "Accept one applicant",
            description = "Starts the project with this contributor and rejects every other open application in "
                    + "the same transaction. The response reveals the accepted contributor's contact email.")
    public ApplicantResponse accept(@AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable UUID applicationId) {
        return ApplicantResponse.from(review.accept(principal.id(), applicationId));
    }

    @GetMapping(value = "/applications/{applicationId}/cv", produces = MediaType.APPLICATION_PDF_VALUE)
    @Operation(summary = "The applicant's current READY CV")
    public ResponseEntity<byte[]> cv(@AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable UUID applicationId) {
        CvFile file = review.cv(principal.id(), applicationId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline()
                        .filename(file.fileName(), StandardCharsets.UTF_8).build().toString())
                .header("X-Content-Type-Options", "nosniff")
                .cacheControl(CacheControl.noStore().cachePrivate())
                .body(file.content());
    }
}
