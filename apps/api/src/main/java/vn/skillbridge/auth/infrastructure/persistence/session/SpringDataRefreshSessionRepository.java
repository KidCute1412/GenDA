package vn.skillbridge.auth.infrastructure.persistence.session;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface SpringDataRefreshSessionRepository extends JpaRepository<RefreshSessionJpaEntity, UUID> {
}
