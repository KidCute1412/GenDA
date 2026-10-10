package vn.skillbridge.users.domain;

import java.time.Instant;
import java.util.UUID;

/** Metadata of the contributor's current CV. READY means technically valid, never content-verified. */
public record ContributorCv(
        UUID userId,
        String fileName,
        int sizeBytes,
        int pageCount,
        String sha256,
        CvStatus status,
        Instant uploadedAt) {

    public boolean isReady() {
        return status == CvStatus.READY;
    }
}
