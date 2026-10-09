package vn.skillbridge.projects.domain;

import java.time.Instant;
import java.util.UUID;

/** The contributor whose application was accepted, and when the project started. */
public record ProjectAssignment(UUID contributorId, Instant startedAt) {
}
