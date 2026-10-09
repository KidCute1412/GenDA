package vn.skillbridge.projects.infrastructure.persistence;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "projects")
class ProjectJpaEntity {
    @Id
    private UUID id;

    @Column(name = "public_id", nullable = false, unique = true, length = 100)
    private String publicId;

    @Column(name = "owner_id")
    private UUID ownerId;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(name = "sme_name", nullable = false, length = 180)
    private String smeName;

    @Column(name = "sme_industry", length = 120)
    private String smeIndustry;

    @Column(name = "sme_size", length = 80)
    private String smeSize;

    @Column(name = "sme_contact", nullable = false, length = 180)
    private String smeContact;

    @Column(length = 16)
    private String complexity;

    private Long budget;

    private LocalDate deadline;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(length = 500)
    private String summary;

    @Column(columnDefinition = "text")
    private String problem;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "project_skills", joinColumns = @JoinColumn(name = "project_id"))
    @OrderColumn(name = "position")
    @Column(name = "skill_code", nullable = false, length = 64)
    private List<String> skillCodes = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "project_acceptance_criteria", joinColumns = @JoinColumn(name = "project_id"))
    @OrderColumn(name = "position")
    @Column(name = "criterion", nullable = false, length = 500)
    private List<String> acceptanceCriteria = new ArrayList<>();

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<ProjectMilestoneJpaEntity> milestones = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "assigned_contributor_id")
    private UUID assignedContributorId;

    @Column(name = "started_at")
    private Instant startedAt;

    protected ProjectJpaEntity() {}

    ProjectJpaEntity(UUID id, String publicId, UUID ownerId, Instant createdAt) {
        this.id = id;
        this.publicId = publicId;
        this.ownerId = ownerId;
        this.createdAt = createdAt;
    }

    void applyScalars(String title, String smeName, String smeIndustry, String smeSize, String smeContact,
            String complexity, Long budget, LocalDate deadline, String status, String summary, String problem,
            Instant updatedAt, Instant submittedAt, Instant publishedAt) {
        this.title = title;
        this.smeName = smeName;
        this.smeIndustry = smeIndustry;
        this.smeSize = smeSize;
        this.smeContact = smeContact;
        this.complexity = complexity;
        this.budget = budget;
        this.deadline = deadline;
        this.status = status;
        this.summary = summary;
        this.problem = problem;
        this.updatedAt = updatedAt;
        this.submittedAt = submittedAt;
        this.publishedAt = publishedAt;
    }

    void assign(UUID contributorId, Instant startedAt) {
        this.assignedContributorId = contributorId;
        this.startedAt = startedAt;
    }

    UUID id() { return id; }
    String publicId() { return publicId; }
    UUID ownerId() { return ownerId; }
    String title() { return title; }
    String smeName() { return smeName; }
    String smeIndustry() { return smeIndustry; }
    String smeSize() { return smeSize; }
    String smeContact() { return smeContact; }
    String complexity() { return complexity; }
    Long budget() { return budget; }
    LocalDate deadline() { return deadline; }
    String status() { return status; }
    String summary() { return summary; }
    String problem() { return problem; }
    List<String> skillCodes() { return skillCodes; }
    List<String> acceptanceCriteria() { return acceptanceCriteria; }
    List<ProjectMilestoneJpaEntity> milestones() { return milestones; }
    Instant createdAt() { return createdAt; }
    Instant updatedAt() { return updatedAt; }
    Instant submittedAt() { return submittedAt; }
    Instant publishedAt() { return publishedAt; }
    UUID assignedContributorId() { return assignedContributorId; }
    Instant startedAt() { return startedAt; }
}
