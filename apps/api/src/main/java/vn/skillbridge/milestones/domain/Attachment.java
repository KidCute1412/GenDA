package vn.skillbridge.milestones.domain;

import java.time.Instant;
import java.util.UUID;

public record Attachment(UUID id, UUID milestoneId, UUID handoffId, UUID ownerId, String name,
        String mediaType, long size, String objectKey, Instant uploadedAt) {
    public Attachment attach(UUID revision) { return new Attachment(id, milestoneId, revision, ownerId, name, mediaType, size, objectKey, uploadedAt); }
}
