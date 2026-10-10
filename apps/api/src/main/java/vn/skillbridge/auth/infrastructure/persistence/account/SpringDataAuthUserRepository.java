package vn.skillbridge.auth.infrastructure.persistence.account;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface SpringDataAuthUserRepository extends JpaRepository<AuthUserJpaEntity, UUID> {
    Optional<AuthUserJpaEntity> findByEmail(String email);
}
