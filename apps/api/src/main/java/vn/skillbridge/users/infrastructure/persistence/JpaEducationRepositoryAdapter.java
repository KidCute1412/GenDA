package vn.skillbridge.users.infrastructure.persistence;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import vn.skillbridge.users.application.EducationRepository;
import vn.skillbridge.users.domain.Education;
import vn.skillbridge.users.domain.EducationLevel;
import vn.skillbridge.users.domain.EducationStatus;

@Repository
class JpaEducationRepositoryAdapter implements EducationRepository {
    private final SpringDataEducationRepository repository;

    JpaEducationRepositoryAdapter(SpringDataEducationRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Education> findByUserId(UUID userId) {
        return repository.findNewestFirst(userId).stream().map(JpaEducationRepositoryAdapter::toDomain).toList();
    }

    @Override
    public Optional<Education> findOwned(UUID userId, UUID educationId) {
        return repository.findByIdAndUserId(educationId, userId).map(JpaEducationRepositoryAdapter::toDomain);
    }

    @Override
    public int countByUserId(UUID userId) {
        return repository.countByUserId(userId);
    }

    @Override
    public void save(Education education) {
        EducationJpaEntity entity = repository.findById(education.id())
                .orElseGet(() -> new EducationJpaEntity(education.id(), education.userId()));
        entity.institution = education.institution();
        entity.fieldOfStudy = education.fieldOfStudy();
        entity.educationLevel = education.level().name();
        entity.degreeName = education.degreeName();
        entity.startMonth = firstDay(education.startMonth());
        entity.endMonth = firstDay(education.endMonth());
        entity.status = education.status().name();
        entity.description = education.description();
        entity.createdAt = education.createdAt();
        entity.updatedAt = education.updatedAt();
        repository.save(entity);
    }

    @Override
    public void delete(Education education) {
        repository.deleteById(education.id());
    }

    private static LocalDate firstDay(YearMonth month) {
        return month == null ? null : month.atDay(1);
    }

    private static YearMonth month(LocalDate date) {
        return date == null ? null : YearMonth.from(date);
    }

    private static Education toDomain(EducationJpaEntity entity) {
        return new Education(entity.id, entity.userId, entity.institution, entity.fieldOfStudy,
                EducationLevel.valueOf(entity.educationLevel), entity.degreeName, month(entity.startMonth),
                month(entity.endMonth), EducationStatus.valueOf(entity.status), entity.description,
                entity.createdAt, entity.updatedAt);
    }
}
