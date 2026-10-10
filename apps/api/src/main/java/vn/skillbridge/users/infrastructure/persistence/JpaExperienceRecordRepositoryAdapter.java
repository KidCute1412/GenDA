package vn.skillbridge.users.infrastructure.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import vn.skillbridge.users.application.ExperienceRecordRepository;
import vn.skillbridge.users.domain.ExperienceRecord;
import vn.skillbridge.users.domain.ProjectLevel;

@Repository
class JpaExperienceRecordRepositoryAdapter implements ExperienceRecordRepository {
    private final SpringDataExperienceRecordRepository repository;

    JpaExperienceRecordRepositoryAdapter(SpringDataExperienceRecordRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<ExperienceRecord> findByContributorId(UUID contributorId) {
        return repository.findByContributorIdOrderByCompletedAtAsc(contributorId).stream()
                .map(entity -> new ExperienceRecord(entity.projectId, entity.projectTitle, entity.smeName,
                        ProjectLevel.valueOf(entity.complexity), entity.completedAt))
                .toList();
    }
}
