package vn.skillbridge.milestones.domain;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;

public record ReviewReport(List<Item> items, String overallNote) {
    public enum EvidenceStatus { EVIDENCE_FOUND, NOT_SHOWN, CANNOT_ASSESS }
    public record Quote(String source, String quote) {}
    public record Item(String criterionId, EvidenceStatus status, List<Quote> evidence, String question) {}
    public record Source(String id, String label, Integer page, String text) {}
    public void validate(List<Milestone.Criterion> criteria, List<Source> sources) {
        Set<String> remaining = new HashSet<>(criteria.stream().map(Milestone.Criterion::id).toList());
        Map<String, String> text = sources.stream().collect(java.util.stream.Collectors.toMap(Source::id, Source::text));
        if (items == null || items.size() != criteria.size() || overallNote == null || overallNote.length() > 2000) invalid();
        for (Item item : items) {
            if (item == null || !remaining.remove(item.criterionId()) || item.status() == null || item.evidence() == null
                    || item.evidence().size() > 3 || (item.question() != null && item.question().length() > 1000)) invalid();
            if (item.status() == EvidenceStatus.EVIDENCE_FOUND && item.evidence().isEmpty()) invalid();
            for (Quote quote : item.evidence()) {
                if (quote == null || quote.quote() == null || quote.quote().isBlank() || quote.quote().length() > 500
                        || !text.containsKey(quote.source()) || !text.get(quote.source()).contains(quote.quote())) invalid();
            }
        }
    }
    private static void invalid() { throw new MilestoneViolation("AI_INVALID_OUTPUT", "AI returned an invalid review; please try again"); }
}
