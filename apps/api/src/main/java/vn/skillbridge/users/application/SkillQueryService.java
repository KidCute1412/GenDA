package vn.skillbridge.users.application;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SkillQueryService {
    private final SkillCatalog catalog;

    public SkillQueryService(SkillCatalog catalog) {
        this.catalog = catalog;
    }

    public List<SkillSummary> listSkills() {
        return catalog.findAll().stream()
                .map(skill -> new SkillSummary(skill.code(), skill.name()))
                .toList();
    }

    public Map<String, SkillSummary> findByCodes(Collection<String> codes) {
        return catalog.findByCodes(codes).stream()
                .map(skill -> new SkillSummary(skill.code(), skill.name()))
                .collect(Collectors.toMap(
                        SkillSummary::code,
                        Function.identity(),
                        (left, right) -> left,
                        LinkedHashMap::new));
    }
}
