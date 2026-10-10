package vn.skillbridge.applications.infrastructure.persistence;

import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface SpringDataApplicationRepository extends JpaRepository<ApplicationJpaEntity, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM ApplicationJpaEntity a WHERE a.id = :id")
    Optional<ApplicationJpaEntity> findForUpdateById(@Param("id") UUID id);

    List<ApplicationJpaEntity> findByContributorIdOrderBySubmittedAtDesc(UUID contributorId);

    List<ApplicationJpaEntity> findByProjectIdOrderBySubmittedAtAsc(String projectId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM ApplicationJpaEntity a WHERE a.projectId = :projectId ORDER BY a.submittedAt")
    List<ApplicationJpaEntity> findForUpdateByProjectId(@Param("projectId") String projectId);

    boolean existsByProjectIdAndContributorIdAndStatusIn(String projectId, UUID contributorId,
            Collection<String> statuses);

    @Query("""
            SELECT a.projectId AS projectId,
                   SUM(CASE WHEN a.status IN ('SUBMITTED', 'SHORTLISTED') THEN 1 ELSE 0 END) AS open,
                   SUM(CASE WHEN a.status <> 'WITHDRAWN' THEN 1 ELSE 0 END) AS total
            FROM ApplicationJpaEntity a
            WHERE a.projectId IN :projectIds
            GROUP BY a.projectId
            """)
    List<ProjectCounts> countByProjectIds(@Param("projectIds") Collection<String> projectIds);

    interface ProjectCounts {
        String getProjectId();
        Long getOpen();
        Long getTotal();
    }
}
