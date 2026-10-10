package vn.skillbridge.milestones.application;

import java.time.Clock;
import java.util.List;
import java.util.UUID;
import java.util.ArrayList;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.auth.application.account.AccountProfileService;
import vn.skillbridge.milestones.domain.*;
import vn.skillbridge.projects.application.execution.ExecutionProject;
import vn.skillbridge.projects.application.execution.ProjectExecutionService;

@Service
public class MilestoneService {
    public record SubmissionView(Handoff handoff, List<Attachment> attachments, AiReview review) {}
    public record Workspace(ExecutionProject project, String viewerRole, List<Milestone> milestones,
            List<SubmissionView> submissions) {}
    public record Download(String name, String mediaType, byte[] content) {}
    private final MilestoneRepository repository;
    private final ProjectExecutionService projects;
    private final AccountProfileService accounts;
    private final Clock clock;

    public MilestoneService(MilestoneRepository repository, ProjectExecutionService projects,
            AccountProfileService accounts, Clock clock) {
        this.repository = repository; this.projects = projects; this.accounts = accounts; this.clock = clock;
    }

    @Transactional
    public void initialize(String projectId) {
        ExecutionProject project = projects.lock(projectId);
        if (!repository.milestones(projectId).isEmpty()) return;
        int first = project.plans().stream().mapToInt(ExecutionProject.Plan::order).min().orElseThrow();
        int last = project.plans().stream().mapToInt(ExecutionProject.Plan::order).max().orElseThrow();
        for (var plan : project.plans()) {
            UUID id = UUID.randomUUID();
            var rawCriteria = !plan.criteria().isEmpty()
                    ? plan.criteria()
                    : (plan.order() == last || project.plans().size() == 1 ? project.acceptanceCriteria() : List.<String>of());
            var criteria = new ArrayList<Milestone.Criterion>();
            for (int i = 0; i < rawCriteria.size(); i++)
                criteria.add(new Milestone.Criterion(id + ":" + i, rawCriteria.get(i)));
            repository.save(new Milestone(id, projectId, plan.id(), plan.order(), plan.title(), plan.budget(), plan.deadline(),
                    criteria, plan.order() == first ? Milestone.Status.IN_PROGRESS : Milestone.Status.PENDING,
                    Milestone.Funding.PENDING_FUNDING, 0));
        }
    }

    @Transactional(readOnly = true)
    public Workspace workspace(UUID actor, String projectId) {
        ExecutionProject project = authorize(actor, projectId, false);
        List<Milestone> milestones = repository.milestones(projectId);
        List<SubmissionView> submissions = milestones.stream().flatMap(m -> historyInternal(m.id()).stream()).toList();
        return new Workspace(project, actor.equals(project.ownerId()) ? "SME" : "CONTRIBUTOR", milestones, submissions);
    }

    @Transactional(readOnly = true)
    public List<SubmissionView> history(UUID actor, UUID milestone) {
        access(actor, milestone, false); return historyInternal(milestone);
    }
    private List<SubmissionView> historyInternal(UUID milestone) {
        return repository.handoffs(milestone).stream().map(h -> new SubmissionView(h, repository.attachments(h.id()),
                repository.review(h.id()).orElse(null))).toList();
    }

    @Transactional
    public Handoff submit(UUID actor, UUID milestoneId, int expectedRevision, String note, List<String> links, List<UUID> files) {
        Milestone m = access(actor, milestoneId, true);
        ExecutionProject project = authorize(actor, m.projectId(), true);
        contributor(actor, project);
        if (!"IN_PROGRESS".equals(project.status())) throw conflict();
        if (note == null || note.length() > 10000 || links == null || links.size() > 5 || files == null || files.size() > 5
                || files.stream().distinct().count() != files.size()) throw new MilestoneViolation("INVALID_HANDOFF", "Invalid handoff");
        for (String link : links) {
            try {
                var uri = java.net.URI.create(link);
                if (link.length() > 2000 || !("https".equals(uri.getScheme()) || "http".equals(uri.getScheme())) || uri.getHost() == null || uri.getUserInfo() != null)
                    throw new IllegalArgumentException();
            } catch (IllegalArgumentException e) { throw new MilestoneViolation("INVALID_LINK", "Links must be HTTP or HTTPS URLs"); }
        }
        if (note.isBlank() && links.isEmpty() && files.isEmpty()) throw new MilestoneViolation("EVIDENCE_REQUIRED", "Add a note, link or file");
        Milestone submitted = m.submit(expectedRevision);
        UUID handoffId = UUID.randomUUID();
        for (UUID file : files) {
            Attachment attachment = repository.attachment(file).orElseThrow(MilestoneService::missing);
            if (!attachment.milestoneId().equals(milestoneId) || !attachment.ownerId().equals(actor) || attachment.handoffId() != null
                    || attachment.uploadedAt().isBefore(clock.instant().minusSeconds(86400))) throw missing();
            repository.save(attachment.attach(handoffId));
        }
        Handoff handoff = new Handoff(handoffId, milestoneId, submitted.revision(), actor, note, links, clock.instant(), null, null, null, null);
        // Save the revision before its attachment foreign keys are flushed.
        repository.save(handoff);
        repository.save(submitted);
        repository.audit(milestoneId, actor, "SUBMITTED", null, clock.instant());
        return handoff;
    }

    @Transactional
    public void decide(UUID actor, UUID milestoneId, UUID revisionId, boolean accepted, String reason) {
        Milestone m = access(actor, milestoneId, true);
        ExecutionProject project = authorize(actor, m.projectId(), true);
        if (!actor.equals(project.ownerId())) throw forbidden();
        if (!"IN_PROGRESS".equals(project.status())) throw conflict();
        Handoff handoff = repository.handoff(revisionId).filter(h -> h.milestoneId().equals(milestoneId)).orElseThrow(MilestoneService::missing);
        if (reason != null && reason.length() > 2000) throw new MilestoneViolation("INVALID_REASON", "Reason is too long");
        repository.save(m.decide(handoff.revision(), accepted, reason));
        repository.save(handoff.decide(accepted, reason, actor, clock.instant()));
        repository.audit(milestoneId, actor, accepted ? "ACCEPTED" : "CHANGES_REQUESTED", reason, clock.instant());
        if (accepted) {
            var remaining = repository.milestones(m.projectId()).stream().filter(x -> !x.id().equals(m.id()) && x.status() != Milestone.Status.ACCEPTED).toList();
            if (remaining.isEmpty()) projects.complete(m.projectId());
            else repository.save(remaining.getFirst().start());
        }
    }

    @Transactional
    public void funding(UUID actor, UUID id, Milestone.Funding target, String reason, boolean admin) {
        Milestone m = repository.milestone(id).orElseThrow(MilestoneService::missing);
        projects.lock(m.projectId());
        m = repository.milestone(id).orElseThrow(MilestoneService::missing);
        if (admin) {
            if (!accounts.isActiveAdmin(actor)) throw forbidden();
            if (reason == null || reason.isBlank() || reason.length() > 2000) throw new MilestoneViolation("REASON_REQUIRED", "Admin support needs a reason");
        } else if (!actor.equals(authorize(actor, m.projectId(), false).ownerId())) throw forbidden();
        repository.save(m.fund(target));
        repository.audit(id, actor, target.name(), reason, clock.instant());
    }

    @Transactional(readOnly = true)
    public Milestone access(UUID actor, UUID milestoneId, boolean lock) {
        Milestone m = repository.milestone(milestoneId).orElseThrow(MilestoneService::missing);
        authorize(actor, m.projectId(), lock);
        return lock ? repository.milestone(milestoneId).orElseThrow(MilestoneService::missing) : m;
    }
    @Transactional(readOnly = true)
    public ExecutionProject authorize(UUID actor, String projectId, boolean lock) {
        if (!accounts.standing(actor).active()) throw forbidden();
        ExecutionProject project = lock ? projects.lock(projectId) : projects.find(projectId);
        if (project.contributorId() == null || (!actor.equals(project.ownerId()) && !actor.equals(project.contributorId()))) throw missing();
        String role = accounts.get(actor).role();
        if ((actor.equals(project.ownerId()) && !"SME".equals(role))
                || (actor.equals(project.contributorId()) && !"CONTRIBUTOR".equals(role))) throw forbidden();
        return project;
    }
    public static void contributor(UUID actor, ExecutionProject project) { if (!actor.equals(project.contributorId())) throw forbidden(); }
    @Transactional
    public void lockForMaintenance(UUID milestoneId) {
        projects.lock(repository.milestone(milestoneId).orElseThrow(MilestoneService::missing).projectId());
    }
    public static MilestoneViolation missing() { return new MilestoneViolation("MILESTONE_NOT_FOUND", "Workspace resource was not found"); }
    public static MilestoneViolation forbidden() { return new MilestoneViolation("ACCESS_DENIED", "This action is not allowed"); }
    public static MilestoneViolation conflict() { return new MilestoneViolation("MILESTONE_CONFLICT", "Reload the workspace before this action"); }
}
