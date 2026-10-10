package vn.skillbridge.milestones.domain;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;

public record ReviewReport(List<Item> items, String overallNote, String summary, List<String> findings, List<String> limitations) {
    public enum EvidenceStatus { EVIDENCE_FOUND, NOT_SHOWN, CANNOT_ASSESS }
    public record Quote(String source, String quote) {}
    public record Item(String criterionId, EvidenceStatus status, List<Quote> evidence, String question,
            String analysis, String gap, String nextStep) {
        public Item(String criterionId, EvidenceStatus status, List<Quote> evidence, String question) {
            this(criterionId,status,evidence,question,null,null,null);
        }
    }
    public ReviewReport(List<Item> items, String overallNote) { this(items,overallNote,null,null,null); }
    public record Source(String id, String label, Integer page, String text) {}
    public void validate(List<Milestone.Criterion> criteria, List<Source> sources) {
        Set<String> remaining = new HashSet<>(criteria.stream().map(Milestone.Criterion::id).toList());
        Map<String, String> text = sources.stream().collect(java.util.stream.Collectors.toMap(Source::id, Source::text));
        if (items == null || items.size() != criteria.size() || blankOrLong(overallNote,2000) || blankOrLong(summary,1200)
                || findings == null || findings.size() > 5 || findings.stream().anyMatch(x -> blankOrLong(x,300))
                || limitations == null || limitations.size() > 5 || limitations.stream().anyMatch(x -> blankOrLong(x,300))) invalid();
        for (Item item : items) {
            if (item == null || !remaining.remove(item.criterionId()) || item.status() == null || item.evidence() == null
                    || item.evidence().size() > 3 || (item.question() != null && item.question().length() > 1000)) invalid();
            if (item.status() == EvidenceStatus.EVIDENCE_FOUND && item.evidence().isEmpty()) invalid();
            if (blankOrLong(item.analysis(),1200) || blankOrLong(item.gap(),800) || blankOrLong(item.nextStep(),800)) invalid();
            for (Quote quote : item.evidence()) {
                if (quote == null || quote.quote() == null || quote.quote().isBlank() || quote.quote().length() > 500
                        || !text.containsKey(quote.source()) || !text.get(quote.source()).contains(quote.quote())) invalid();
            }
        }
    }
    private static boolean blankOrLong(String value,int max) { return value == null || value.isBlank() || value.length() > max; }
    private static void invalid() { throw new MilestoneViolation("AI_INVALID_OUTPUT", "AI returned an invalid review; please try again"); }
}
