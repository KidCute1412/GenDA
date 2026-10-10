package vn.skillbridge.users.application;

import java.util.Collection;
import java.util.List;
import vn.skillbridge.users.domain.Skill;

public interface SkillRepository {
    List<Skill> findAll();
    List<Skill> findByCodes(Collection<String> codes);
}
