package vn.skillbridge.milestones.application;

import java.util.List;
import vn.skillbridge.milestones.domain.Milestone;
import vn.skillbridge.milestones.domain.ReviewReport;

public interface ReviewModelService {
    record Result(ReviewReport report, Long inputTokens, Long outputTokens) {}
    boolean available();
    String model();
    Result review(List<Milestone.Criterion> criteria, List<ReviewReport.Source> sources, List<String> warnings);
}
