package vn.skillbridge.users.application;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.users.domain.ExperiencePolicy;
import vn.skillbridge.users.domain.ExperienceStanding;

/** XP and tier, derived from the completed-project ledger at read time (FR-APP-08, FR-APP-12). */
@Service
public class ExperienceService {
    private final ExperienceRecordRepository records;
    private final ExperiencePolicy policy;
    private final ContributorAccounts contributors;

    public ExperienceService(ExperienceRecordRepository records, ExperiencePolicy policy,
            ContributorAccounts contributors) {
        this.records = records;
        this.policy = policy;
        this.contributors = contributors;
    }

    @Transactional(readOnly = true)
    public ExperienceStanding standing(UUID userId) {
        contributors.require(userId);
        return policy.evaluate(records.findByContributorId(userId));
    }
}
