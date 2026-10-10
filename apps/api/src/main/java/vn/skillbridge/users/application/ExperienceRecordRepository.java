package vn.skillbridge.users.application;

import java.util.List;
import java.util.UUID;
import vn.skillbridge.users.domain.ExperienceRecord;

/**
 * Completed-project ledger. Rows are written only by the project-completion use case once a project is
 * COMPLETED with an accepted application and all milestones accepted; nothing writes XP directly.
 */
public interface ExperienceRecordRepository {
    List<ExperienceRecord> findByContributorId(UUID contributorId);
}
