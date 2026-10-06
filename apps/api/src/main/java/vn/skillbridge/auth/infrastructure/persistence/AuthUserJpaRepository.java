package vn.skillbridge.auth.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface AuthUserJpaRepository extends JpaRepository<AuthUserJpaEntity, UUID> {
    Optional<AuthUserJpaEntity> findByEmail(String email);
}
