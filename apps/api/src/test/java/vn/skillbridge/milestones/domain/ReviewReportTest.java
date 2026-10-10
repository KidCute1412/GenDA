package vn.skillbridge.milestones.domain;

import static org.assertj.core.api.Assertions.*;
import java.util.List;
import org.junit.jupiter.api.Test;

class ReviewReportTest {
    private final List<Milestone.Criterion> criteria=List.of(new Milestone.Criterion("c1","Form"));
    private final List<ReviewReport.Source> sources=List.of(new ReviewReport.Source("note","Note",null,"Form has name and phone"));
    private ReviewReport report(String id,String source,String quote){return new ReviewReport(List.of(new ReviewReport.Item(id,ReviewReport.EvidenceStatus.EVIDENCE_FOUND,List.of(new ReviewReport.Quote(source,quote)),null)),"Advisory only");}
    @Test void acceptsOnlyVerifiableQuotesAndExistingCriterionIds(){
        report("c1","note","name and phone").validate(criteria,sources);
        assertThatThrownBy(()->report("c1","note","Invented").validate(criteria,sources)).isInstanceOf(MilestoneViolation.class);
        assertThatThrownBy(()->report("c2","note","name").validate(criteria,sources)).isInstanceOf(MilestoneViolation.class);
        assertThatThrownBy(()->report("c1","other","name").validate(criteria,sources)).isInstanceOf(MilestoneViolation.class);
    }
    @Test void rejectsMissingDuplicateAndUnsupportedStatuses(){
        assertThatThrownBy(()->new ReviewReport(List.of(),"None").validate(criteria,sources)).isInstanceOf(MilestoneViolation.class);
        var item=report("c1","note","name").items().getFirst();
        assertThatThrownBy(()->new ReviewReport(List.of(item,item),"None").validate(criteria,sources)).isInstanceOf(MilestoneViolation.class);
        assertThatThrownBy(()->new ReviewReport(List.of(new ReviewReport.Item("c1",null,List.of(),null)),"None").validate(criteria,sources)).isInstanceOf(MilestoneViolation.class);
    }
}
