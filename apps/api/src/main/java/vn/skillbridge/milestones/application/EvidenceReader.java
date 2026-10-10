package vn.skillbridge.milestones.application;

import java.util.List;
import vn.skillbridge.milestones.domain.Attachment;
import vn.skillbridge.milestones.domain.ReviewReport;

public interface EvidenceReader {
    record Inspection(String mediaType, List<ReviewReport.Source> sources, List<String> warnings) {}
    Inspection inspect(Attachment attachment, byte[] content);
}
