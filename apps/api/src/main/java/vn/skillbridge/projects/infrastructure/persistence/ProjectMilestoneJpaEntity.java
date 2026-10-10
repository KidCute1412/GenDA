package vn.skillbridge.projects.infrastructure.persistence;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "project_milestone_plans")
class ProjectMilestoneJpaEntity {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private ProjectJpaEntity project;

    @Column(name = "public_id", nullable = false, length = 100)
    private String publicId;

    @Column(name = "position", nullable = false)
    private int position;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false)
    private long budget;

    @Column(nullable = false)
    private LocalDate deadline;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "project_milestone_plan_criteria", joinColumns = @JoinColumn(name = "milestone_plan_id"))
    @OrderColumn(name = "position")
    @Column(name = "criterion", nullable = false, length = 500)
    private List<String> criteria = new ArrayList<>();

    protected ProjectMilestoneJpaEntity() {}

    String publicId() { return publicId; }
    int position() { return position; }
    String title() { return title; }
    long budget() { return budget; }
    LocalDate deadline() { return deadline; }
    List<String> criteria() { return criteria; }
}
