package vn.skillbridge.users.infrastructure.persistence;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface SpringDataCvRepository extends JpaRepository<CvJpaEntity, UUID> {
}
