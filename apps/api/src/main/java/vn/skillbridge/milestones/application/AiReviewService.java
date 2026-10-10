package vn.skillbridge.milestones.application;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.skillbridge.milestones.domain.*;

@Service
public class AiReviewService {
    private final AiReviewTransactions transactions;
    private final MilestoneRepository repository;
    private final ReviewModelService model;
    private final DeliverableStorage storage;
    private final EvidenceReader reader;
    public AiReviewService(AiReviewTransactions transactions,MilestoneRepository repository,ReviewModelService model,DeliverableStorage storage,EvidenceReader reader) {
        this.transactions=transactions;this.repository=repository;this.model=model;this.storage=storage;this.reader=reader;
    }
    public boolean available(){return model.available();}
    public AiReview run(UUID actor,UUID milestone,UUID revision) {
        var attempt=transactions.begin(actor,milestone,revision);
        if(!attempt.run()) return attempt.review();
        var sources=new ArrayList<ReviewReport.Source>();var warnings=new ArrayList<String>();
        try {
            sources.add(new ReviewReport.Source("handoff-note","Ghi chú bàn giao",null,attempt.handoff().note()));
            if(!attempt.handoff().links().isEmpty()) warnings.add("Liên kết chỉ là tham chiếu. AI chưa truy cập nội dung liên kết.");
            for(Attachment a:repository.attachments(revision)) {
                var result=reader.inspect(a,storage.download(a.objectKey()));sources.addAll(result.sources());warnings.addAll(result.warnings());
            }
            int remaining=60000;var bounded=new ArrayList<ReviewReport.Source>();
            for(var source:sources) {
                if(remaining==0){warnings.add("Đã bỏ qua phần vượt giới hạn: "+source.label());continue;}
                String text=source.text();if(text.length()>remaining){text=text.substring(0,remaining);warnings.add("Đã rút ngắn nguồn: "+source.label());}
                if(!text.isBlank()) bounded.add(new ReviewReport.Source(source.id(),source.label(),source.page(),text));remaining-=text.length();
            }
            sources=bounded;
            ReviewModelService.Result result;
            if(attempt.milestone().criteria().isEmpty()) result=new ReviewModelService.Result(new ReviewReport(List.of(),"Milestone chưa có tiêu chí đã chốt. SME cần làm rõ tiêu chí; AI không thể đánh giá."),0L,0L);
            else if(sources.isEmpty()) result=new ReviewModelService.Result(new ReviewReport(attempt.milestone().criteria().stream().map(c->
                new ReviewReport.Item(c.id(),ReviewReport.EvidenceStatus.CANNOT_ASSESS,List.of(),"Bạn có thể bổ sung bằng chứng đọc được cho tiêu chí này? ")).toList(),"Chưa có nội dung đọc được để phân tích."),0L,0L);
            else result=model.review(attempt.milestone().criteria(),sources,warnings);
            result.report().validate(attempt.milestone().criteria(),sources);
            return transactions.finish(attempt.review(),result,sources,warnings,null);
        }catch(RuntimeException e){
            String code=e instanceof MilestoneViolation v?v.code():"AI_UNAVAILABLE";
            org.slf4j.LoggerFactory.getLogger(AiReviewService.class).warn("AI review failed: {} {}",attempt.review().id(),code);
            return transactions.finish(attempt.review(),null,List.of(),warnings,code);
        }
    }
}
