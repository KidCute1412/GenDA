package vn.skillbridge.milestones.infrastructure.persistence;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;
@Entity @Table(name="milestones")
class MilestoneJpaEntity {
 @Id UUID id;
 @Column(name="project_id",nullable=false,length=100) String projectId;
 @Column(name="plan_id",nullable=false,length=100) String planId;
 @Column(nullable=false) int position;
 @Column(nullable=false,length=180) String title;
 @Column(nullable=false) long budget;
 @Column(nullable=false) LocalDate deadline;
 @Column(nullable=false,columnDefinition="text") String criteria;
 @Column(nullable=false,length=32) String status;
 @Column(nullable=false,length=32) String funding;
 @Column(nullable=false) int revision;
}
