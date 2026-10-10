package vn.skillbridge.users.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import vn.skillbridge.users.domain.ContributorCv;
import vn.skillbridge.users.domain.CvStatus;

public record CvResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String fileName,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int sizeBytes,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int pageCount,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED,
                description = "READY means technically valid; the content is not verified by GenDA") CvStatus status,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) Instant uploadedAt) {

    public static CvResponse from(ContributorCv cv) {
        return new CvResponse(cv.fileName(), cv.sizeBytes(), cv.pageCount(), cv.status(), cv.uploadedAt());
    }
}
