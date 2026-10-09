package vn.skillbridge.users.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import vn.skillbridge.auth.application.session.AuthenticatedPrincipal;
import vn.skillbridge.platform.api.ApiExceptionHandler.ApiError;
import vn.skillbridge.users.api.dto.CvResponse;
import vn.skillbridge.users.application.CvFile;
import vn.skillbridge.users.application.CvService;
import vn.skillbridge.users.application.UsersException;

/** The contributor's private CV. Only the owner reads it here; SMEs get access per application later. */
@RestController
@RequestMapping("/api/v1/users/me/cv")
@SecurityRequirement(name = "cookieAuth")
public class CvController {
    private final CvService cvs;

    public CvController(CvService cvs) {
        this.cvs = cvs;
    }

    @GetMapping
    @Operation(summary = "Current CV metadata")
    @ApiResponse(responseCode = "200", description = "The current CV")
    @ApiResponse(responseCode = "404", description = "No CV uploaded yet",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    public CvResponse current(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return cvs.current(principal.id()).map(CvResponse::from).orElseThrow(() ->
                new UsersException(UsersException.CV_NOT_FOUND, "No CV has been uploaded"));
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload or replace the CV (PDF, at most 2 MB)",
            description = "A technically rejected file returns 422 CV_REJECTED_TECHNICAL with details.reason and "
                    + "leaves the current CV unchanged.")
    @ApiResponse(responseCode = "200", description = "The new READY CV")
    @ApiResponse(responseCode = "422", description = "Rejected by technical validation",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    public CvResponse upload(@AuthenticationPrincipal AuthenticatedPrincipal principal,
            @RequestPart("file") MultipartFile file) throws IOException {
        return CvResponse.from(cvs.upload(principal.id(), file.getOriginalFilename(), file.getContentType(),
                file.getBytes()));
    }

    @GetMapping(value = "/file", produces = MediaType.APPLICATION_PDF_VALUE)
    @Operation(summary = "Download the contributor's own CV")
    public ResponseEntity<byte[]> file(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        CvFile file = cvs.file(principal.id());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline()
                        .filename(file.fileName(), StandardCharsets.UTF_8).build().toString())
                .header("X-Content-Type-Options", "nosniff")
                .cacheControl(CacheControl.noStore().cachePrivate())
                .body(file.content());
    }
}
