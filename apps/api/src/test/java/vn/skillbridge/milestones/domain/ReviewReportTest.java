package vn.skillbridge.milestones.domain;

import static org.assertj.core.api.Assertions.*;
import java.util.List;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

class ReviewReportTest {
    private final List<Milestone.Criterion> criteria=List.of(new Milestone.Criterion("c1","Form"));
    private final List<ReviewReport.Source> sources=List.of(new ReviewReport.Source("note","Note",null,"Form has name and phone"));
    private ReviewReport report(String id,String source,String quote){return new ReviewReport(List.of(new ReviewReport.Item(id,ReviewReport.EvidenceStatus.EVIDENCE_FOUND,List.of(new ReviewReport.Quote(source,quote)),null,
        "Có nội dung phù hợp trong nguồn.","Chưa xác minh được sản phẩm chạy thật.","SME kiểm tra trực tiếp hành vi.")),"Advisory only","Đối chiếu tham khảo.",List.of(),List.of("Chỉ dựa trên văn bản được cung cấp."));}
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
    @Test void detailedReportRequiresBoundedCompleteSections(){
        var item=new ReviewReport.Item("c1",ReviewReport.EvidenceStatus.EVIDENCE_FOUND,List.of(new ReviewReport.Quote("note","name and phone")),null,
            "Nguồn có thông tin tên và điện thoại.","Chưa thấy xác nhận form gửi dữ liệu thành công.","SME kiểm tra luồng gửi form.");
        var detailed=new ReviewReport(List.of(item),"Tham khảo.","Có bằng chứng cho một phần tiêu chí.",List.of("Có thông tin liên hệ."),List.of("Chưa kiểm tra sản phẩm chạy thật."));
        detailed.validate(criteria,sources);
        assertThatThrownBy(()->new ReviewReport(List.of(item),"Tham khảo.","",List.of(),List.of()).validate(criteria,sources)).isInstanceOf(MilestoneViolation.class);
        var noNextStep=new ReviewReport.Item("c1",ReviewReport.EvidenceStatus.EVIDENCE_FOUND,item.evidence(),null,item.analysis(),item.gap()," ");
        assertThatThrownBy(()->new ReviewReport(List.of(noNextStep),"Tham khảo.","Tóm tắt.",List.of(),List.of()).validate(criteria,sources)).isInstanceOf(MilestoneViolation.class);
    }
    @Test void legacyPersistedReportStillDeserializes(){
        var old="{\"items\":[{\"criterionId\":\"c1\",\"status\":\"EVIDENCE_FOUND\",\"evidence\":[{\"source\":\"note\",\"quote\":\"name\"}],\"question\":null}],\"overallNote\":\"Old report\"}";
        var parsed=new JsonMapper().readValue(old,ReviewReport.class);
        assertThat(parsed.summary()).isNull();
        assertThat(parsed.items().getFirst().analysis()).isNull();
    }
}
