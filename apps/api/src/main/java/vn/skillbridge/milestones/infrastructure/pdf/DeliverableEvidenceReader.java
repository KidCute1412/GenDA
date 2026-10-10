package vn.skillbridge.milestones.infrastructure.pdf;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.nio.charset.CodingErrorAction;
import java.util.ArrayList;
import java.util.List;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;
import vn.skillbridge.milestones.application.EvidenceReader;
import vn.skillbridge.milestones.domain.*;

@Component
public class DeliverableEvidenceReader implements EvidenceReader {
    public Inspection inspect(Attachment attachment,byte[] bytes) {
        String name=attachment.name().toLowerCase(java.util.Locale.ROOT);
        try {
            if(name.endsWith(".pdf")) {
                if(bytes.length<5||!new String(bytes,0,5,StandardCharsets.US_ASCII).equals("%PDF-"))throw invalid();
                try(var pdf=Loader.loadPDF(bytes)) {
                    if(pdf.isEncrypted()||pdf.getNumberOfPages()>100)throw invalid();
                    var stripper=new PDFTextStripper();var sources=new ArrayList<ReviewReport.Source>();int total=0;
                    for(int page=1;page<=pdf.getNumberOfPages()&&total<60000;page++) {
                        stripper.setStartPage(page);stripper.setEndPage(page);String text=stripper.getText(pdf);
                        if(text.length()>60000-total)text=text.substring(0,60000-total);
                        total+=text.length();if(!text.isBlank())sources.add(new ReviewReport.Source(attachment.id()+":"+page,attachment.name(),page,text));
                    }
                    var warnings=new ArrayList<String>();
                    if(sources.isEmpty())warnings.add("AI không đọc được văn bản trong "+attachment.name()+". Chưa hỗ trợ OCR.");
                    if(total>=60000)warnings.add("Nội dung file đã được giới hạn: "+attachment.name());
                    return new Inspection("application/pdf",sources,warnings);
                }
            }
            if(name.endsWith(".txt")) {
                String text=StandardCharsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPORT).onUnmappableCharacter(CodingErrorAction.REPORT).decode(ByteBuffer.wrap(bytes)).toString();
                if(text.chars().anyMatch(c->c<32&&c!='\n'&&c!='\r'&&c!='\t'))throw invalid();
                boolean truncated=text.length()>60000;
                return new Inspection("text/plain",List.of(new ReviewReport.Source(attachment.id().toString(),attachment.name(),null,text.substring(0,Math.min(text.length(),60000)))),
                    truncated?List.of("Nội dung file đã được giới hạn: "+attachment.name()):List.of());
            }
            throw invalid();
        }catch(MilestoneViolation e){throw e;}catch(Exception e){throw invalid();}
    }
    private static MilestoneViolation invalid(){return new MilestoneViolation("FILE_UNREADABLE","Use a readable PDF without a password (up to 100 pages) or UTF-8 TXT");}
}
