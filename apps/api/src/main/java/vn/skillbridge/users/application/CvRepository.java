package vn.skillbridge.users.application;

import java.util.Optional;
import java.util.UUID;
import vn.skillbridge.users.domain.ContributorCv;

/** CV metadata and bytes. Bytes are read only when the file itself is requested. */
public interface CvRepository {
    Optional<ContributorCv> findByUserId(UUID userId);
    Optional<byte[]> findContent(UUID userId);
    /** Replaces the contributor's current CV, metadata and bytes together. */
    void save(ContributorCv cv, byte[] content);
}
