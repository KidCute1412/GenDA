package vn.skillbridge.milestones.domain;

public class MilestoneViolation extends RuntimeException {
    private final String code;
    public MilestoneViolation(String code, String message) { super(message); this.code = code; }
    public String code() { return code; }
}
