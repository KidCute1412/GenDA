package vn.skillbridge.users.application;

import java.util.Optional;
import java.util.UUID;
import vn.skillbridge.users.domain.StudentProfile;

public interface StudentProfileRepository {
    Optional<StudentProfile> findByUserId(UUID userId);
    void save(StudentProfile profile);
}
