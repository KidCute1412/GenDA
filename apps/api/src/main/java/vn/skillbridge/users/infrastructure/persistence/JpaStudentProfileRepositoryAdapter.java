package vn.skillbridge.users.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import vn.skillbridge.users.application.StudentProfileRepository;
import vn.skillbridge.users.domain.StudentProfile;
import vn.skillbridge.users.domain.StudyYear;

@Repository
class JpaStudentProfileRepositoryAdapter implements StudentProfileRepository {
    private final SpringDataStudentProfileRepository repository;

    JpaStudentProfileRepositoryAdapter(SpringDataStudentProfileRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<StudentProfile> findByUserId(UUID userId) {
        return repository.findById(userId).map(JpaStudentProfileRepositoryAdapter::toDomain);
    }

    @Override
    public void save(StudentProfile profile) {
        repository.save(new StudentProfileJpaEntity(profile.userId(), profile.school(), profile.major(),
                profile.studyYear().name(), profile.skillCodes(), profile.createdAt(), profile.updatedAt()));
    }

    private static StudentProfile toDomain(StudentProfileJpaEntity entity) {
        return new StudentProfile(entity.userId, entity.school, entity.major, StudyYear.valueOf(entity.studyYear),
                entity.skillCodes, entity.createdAt, entity.updatedAt);
    }
}
