package vn.skillbridge.milestones.application;

import java.time.Clock;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.milestones.domain.*;

@Service
public class AttachmentService {
    private final MilestoneService milestones;
    private final MilestoneRepository repository;
    private final DeliverableStorage storage;
    private final EvidenceReader reader;
    private final Clock clock;
    public AttachmentService(MilestoneService milestones, MilestoneRepository repository, DeliverableStorage storage, EvidenceReader reader, Clock clock) {
        this.milestones = milestones; this.repository = repository; this.storage = storage; this.reader = reader; this.clock = clock;
    }
    public boolean available() { return storage.available(); }
    public Attachment upload(UUID actor, UUID milestoneId, String name, byte[] content) {
        Milestone m = milestones.access(actor, milestoneId, false);
        MilestoneService.contributor(actor, milestones.authorize(actor, m.projectId(), false));
        if (m.status() != Milestone.Status.IN_PROGRESS && m.status() != Milestone.Status.CHANGES_REQUESTED) throw MilestoneService.conflict();
        if (content.length == 0 || content.length > 5 * 1024 * 1024) throw new MilestoneViolation("FILE_SIZE", "Files must be between 1 byte and 5 MB");
        String safeName = name == null ? "" : name.replaceAll("[\\\\/\\p{Cntrl}]", "_");
        if (safeName.isBlank() || safeName.length() > 180) throw new MilestoneViolation("FILE_NAME", "Invalid file name");
        UUID id = UUID.randomUUID();
        Attachment provisional = new Attachment(id, milestoneId, null, actor, safeName, "", content.length,
                m.projectId() + "/" + milestoneId + "/" + id, clock.instant());
        var inspection = reader.inspect(provisional, content);
        Attachment attachment = new Attachment(id, milestoneId, null, actor, safeName, inspection.mediaType(), content.length, provisional.objectKey(), provisional.uploadedAt());
        storage.upload(attachment.objectKey(), content, attachment.mediaType());
        try { repository.save(attachment); }
        catch (RuntimeException e) { try { storage.delete(attachment.objectKey()); } catch (RuntimeException cleanup) { e.addSuppressed(cleanup); } throw e; }
        return attachment;
    }
    public MilestoneService.Download download(UUID actor, UUID id) {
        Attachment a = repository.attachment(id).orElseThrow(MilestoneService::missing);
        milestones.access(actor, a.milestoneId(), false);
        if (a.handoffId() == null && !actor.equals(a.ownerId())) throw MilestoneService.missing();
        return new MilestoneService.Download(a.name(), a.mediaType(), storage.download(a.objectKey()));
    }
    public java.util.List<Attachment> expired() { return repository.expiredAttachments(clock.instant().minusSeconds(86400)); }
    @Transactional
    public void cleanup(Attachment candidate) {
        // Share the project lock with submit so cleanup cannot delete evidence being attached.
        milestones.lockForMaintenance(candidate.milestoneId());
        Attachment current = repository.attachment(candidate.id()).orElse(null);
        if (current != null && current.handoffId() == null && current.uploadedAt().isBefore(clock.instant().minusSeconds(86400))) {
            storage.delete(current.objectKey()); repository.deleteAttachment(current.id());
        }
    }
}
