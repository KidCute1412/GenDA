package vn.skillbridge.users.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface SpringDataEducationRepository extends JpaRepository<EducationJpaEntity, UUID> {
    @Query("""
            SELECT e FROM EducationJpaEntity e
            WHERE e.userId = :userId
            ORDER BY e.startMonth DESC NULLS LAST, e.createdAt DESC
            """)
    List<EducationJpaEntity> findNewestFirst(UUID userId);

    Optional<EducationJpaEntity> findByIdAndUserId(UUID id, UUID userId);

    int countByUserId(UUID userId);
}
