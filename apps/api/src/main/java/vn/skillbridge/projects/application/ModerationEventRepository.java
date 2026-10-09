package vn.skillbridge.projects.application;

import java.util.Collection;
import java.util.Map;
import vn.skillbridge.projects.domain.ModerationEvent;

public interface ModerationEventRepository {
    void append(ModerationEvent event);

    /** The most recent event of each project, keyed by project id; projects without events are absent. */
    Map<String, ModerationEvent> findLatestByProjectIds(Collection<String> projectIds);
}
