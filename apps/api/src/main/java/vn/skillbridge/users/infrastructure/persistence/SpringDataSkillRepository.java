package vn.skillbridge.users.infrastructure.persistence;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface SpringDataSkillRepository extends JpaRepository<SkillJpaEntity, UUID> {
    List<SkillJpaEntity> findAllByOrderByDisplayOrderAsc();
    List<SkillJpaEntity> findByCodeInOrderByDisplayOrderAsc(Collection<String> codes);
}
