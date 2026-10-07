package vn.skillbridge.projects.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface SpringDataPublishedProjectRepository extends JpaRepository<PublishedProjectJpaEntity, UUID> {
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
    Page<PublishedProjectJpaEntity> searchPublished(
            @Param("query") String query,
            @Param("skillCodes") String skillCodes,
            @Param("skillCount") int skillCount,
            @Param("minBudget") Long minBudget,
            @Param("maxBudget") Long maxBudget,
            Pageable pageable);

    Optional<PublishedProjectJpaEntity> findByPublicIdAndStatus(String publicId, String status);
}
