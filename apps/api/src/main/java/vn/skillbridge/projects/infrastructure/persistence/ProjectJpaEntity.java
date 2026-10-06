package vn.skillbridge.projects.infrastructure.persistence;

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

    @Column(nullable = false, length = 180)
    private String title;

    @Column(name = "sme_name", nullable = false, length = 180)
    private String smeName;

    @Column(name = "sme_industry", nullable = false, length = 120)
    private String smeIndustry;

    @Column(name = "sme_size", nullable = false, length = 80)
    private String smeSize;

    @Column(name = "sme_contact", nullable = false, length = 180)
    private String smeContact;

    @Column(nullable = false)
    private long budget;

    @Column(nullable = false)
    private LocalDate deadline;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(nullable = false, length = 500)
    private String summary;

    @Column(nullable = false, columnDefinition = "text")
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

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    @OrderBy("position ASC")
    private List<ProjectMilestoneJpaEntity> milestones = new ArrayList<>();

    protected ProjectJpaEntity() {}

    String publicId() { return publicId; }
    String title() { return title; }
    String smeName() { return smeName; }
    String smeIndustry() { return smeIndustry; }
    String smeSize() { return smeSize; }
    String smeContact() { return smeContact; }
    long budget() { return budget; }
    LocalDate deadline() { return deadline; }
    String summary() { return summary; }
    String problem() { return problem; }
    List<String> skillCodes() { return skillCodes; }
    List<String> acceptanceCriteria() { return acceptanceCriteria; }
    List<ProjectMilestoneJpaEntity> milestones() { return milestones; }
}
