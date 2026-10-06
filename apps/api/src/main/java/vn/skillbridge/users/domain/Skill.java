package vn.skillbridge.users.domain;

import java.util.UUID;

public record Skill(UUID id, String code, String name, int displayOrder) {}
