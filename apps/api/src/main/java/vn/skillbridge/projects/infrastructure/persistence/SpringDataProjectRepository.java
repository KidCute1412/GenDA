package vn.skillbridge.projects.infrastructure.persistence;

import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface SpringDataProjectRepository extends JpaRepository<ProjectJpaEntity, UUID> {
    @Query(value = """
            SELECT p.*
            FROM projects p
            WHERE p.status = 'PUBLISHED'
              AND (:query = '' OR lower(p.title) LIKE lower(concat('%', :query, '%'))
                   OR lower(p.sme_name) LIKE lower(concat('%', :query, '%'))
                   OR lower(p.summary) LIKE lower(concat('%', :query, '%'))
                   OR EXISTS (
                       SELECT 1 FROM project_skills pqs
                       JOIN skills sqs ON sqs.code = pqs.skill_code
                       WHERE pqs.project_id = p.id
                         AND lower(sqs.name) LIKE lower(concat('%', :query, '%'))
                   ))
              AND (:minBudget IS NULL OR p.budget >= :minBudget)
              AND (:maxBudget IS NULL OR p.budget <= :maxBudget)
              AND (:skillCount = 0 OR (
                    SELECT count(DISTINCT ps.skill_code)
                    FROM project_skills ps
                    WHERE ps.project_id = p.id
                      AND ps.skill_code = ANY(string_to_array(:skillCodes, ','))
                  ) = :skillCount)
            ORDER BY p.deadline ASC, p.created_at DESC
            """,
            countQuery = """
            SELECT count(*)
            FROM projects p
            WHERE p.status = 'PUBLISHED'
              AND (:query = '' OR lower(p.title) LIKE lower(concat('%', :query, '%'))
                   OR lower(p.sme_name) LIKE lower(concat('%', :query, '%'))
                   OR lower(p.summary) LIKE lower(concat('%', :query, '%'))
                   OR EXISTS (
                       SELECT 1 FROM project_skills pqs
                       JOIN skills sqs ON sqs.code = pqs.skill_code
                       WHERE pqs.project_id = p.id
                         AND lower(sqs.name) LIKE lower(concat('%', :query, '%'))
                   ))
              AND (:minBudget IS NULL OR p.budget >= :minBudget)
              AND (:maxBudget IS NULL OR p.budget <= :maxBudget)
              AND (:skillCount = 0 OR (
                    SELECT count(DISTINCT ps.skill_code)
                    FROM project_skills ps
                    WHERE ps.project_id = p.id
                      AND ps.skill_code = ANY(string_to_array(:skillCodes, ','))
                  ) = :skillCount)
            """,
            nativeQuery = true)
    Page<ProjectJpaEntity> searchPublished(
            @Param("query") String query,
            @Param("skillCodes") String skillCodes,
            @Param("skillCount") int skillCount,
            @Param("minBudget") Long minBudget,
            @Param("maxBudget") Long maxBudget,
            Pageable pageable);

    Optional<ProjectJpaEntity> findByPublicIdAndStatus(String publicId, String status);

    Optional<ProjectJpaEntity> findByPublicId(String publicId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM ProjectJpaEntity p WHERE p.publicId = :publicId")
    Optional<ProjectJpaEntity> findForUpdateByPublicId(@Param("publicId") String publicId);

    @Lock(LockModeType.PESSIMISTIC_READ)
    @Query("SELECT p FROM ProjectJpaEntity p WHERE p.publicId = :publicId")
    Optional<ProjectJpaEntity> findForShareByPublicId(@Param("publicId") String publicId);

    List<ProjectJpaEntity> findAllByPublicIdIn(Collection<String> publicIds);

    List<ProjectJpaEntity> findByOwnerIdOrderByUpdatedAtDesc(UUID ownerId);

    List<ProjectJpaEntity> findByStatusOrderBySubmittedAtAsc(String status);

    List<ProjectIdentity> findByPublicIdIn(Collection<String> publicIds);

    interface ProjectIdentity {
        UUID getId();
        String getPublicId();
    }
}
