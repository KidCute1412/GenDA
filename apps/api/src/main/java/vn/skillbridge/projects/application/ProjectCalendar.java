package vn.skillbridge.projects.application;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import org.springframework.stereotype.Component;

/** Deadlines are calendar dates in Vietnam, so "today" is evaluated there rather than in UTC. */
@Component
public class ProjectCalendar {
    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    private final Clock clock;

    public ProjectCalendar(Clock clock) {
        this.clock = clock;
    }

    public Instant now() {
        return clock.instant();
    }

    public LocalDate today() {
        return LocalDate.ofInstant(clock.instant(), VIETNAM);
    }
}
