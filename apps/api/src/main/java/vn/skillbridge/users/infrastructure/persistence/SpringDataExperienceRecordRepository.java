package vn.skillbridge.users.infrastructure.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface SpringDataExperienceRecordRepository
        extends JpaRepository<ExperienceRecordJpaEntity, ExperienceRecordJpaEntity.Key> {
    List<ExperienceRecordJpaEntity> findByContributorIdOrderByCompletedAtAsc(UUID contributorId);
}
