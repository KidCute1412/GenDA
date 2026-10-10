package vn.skillbridge.users.infrastructure.persistence;

import java.util.Collection;
import java.util.List;
import org.springframework.stereotype.Repository;
import vn.skillbridge.users.application.SkillCatalog;
import vn.skillbridge.users.domain.Skill;

@Repository
class JpaSkillCatalog implements SkillCatalog {
    private final SkillJpaRepository repository;

    JpaSkillCatalog(SkillJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Skill> findAll() {
        return repository.findAllByOrderByDisplayOrderAsc().stream().map(this::toDomain).toList();
    }

    @Override
    public List<Skill> findByCodes(Collection<String> codes) {
        if (codes.isEmpty()) return List.of();
        return repository.findByCodeInOrderByDisplayOrderAsc(codes).stream().map(this::toDomain).toList();
    }

    private Skill toDomain(SkillJpaEntity entity) {
        return new Skill(entity.id(), entity.code(), entity.name(), entity.displayOrder());
    }
}
