package vn.skillbridge.milestones.infrastructure.pdf;

import static org.assertj.core.api.Assertions.*;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.UUID;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.encryption.*;
import org.junit.jupiter.api.Test;
import vn.skillbridge.milestones.domain.*;

class DeliverableEvidenceReaderTest {
    private final DeliverableEvidenceReader reader=new DeliverableEvidenceReader();
    private Attachment file(String name){return new Attachment(UUID.randomUUID(),UUID.randomUUID(),null,UUID.randomUUID(),name,"",1,"key",Instant.now());}
    @Test void validatesUtf8AndLimitsText(){
        assertThat(reader.inspect(file("proof.txt"),"Evidence".getBytes(StandardCharsets.UTF_8)).sources().getFirst().text()).isEqualTo("Evidence");
        assertThatThrownBy(()->reader.inspect(file("proof.txt"),new byte[]{(byte)0xff})).isInstanceOf(MilestoneViolation.class);
        assertThatThrownBy(()->reader.inspect(file("proof.txt"),new byte[]{0})).isInstanceOf(MilestoneViolation.class);
        assertThat(reader.inspect(file("proof.txt"),"x".repeat(60001).getBytes(StandardCharsets.UTF_8)).warnings()).isNotEmpty();
        assertThatThrownBy(()->reader.inspect(file("proof.zip"),new byte[]{1})).isInstanceOf(MilestoneViolation.class);
    }
    @Test void extractsRealPdfWithPageSourcesAndExplainsScans()throws Exception{
        try(var pdf=new PDDocument();var out=new ByteArrayOutputStream()){
            var page=new PDPage();pdf.addPage(page);
            try(var content=new PDPageContentStream(pdf,page)){content.beginText();content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA),12);content.newLineAtOffset(20,700);content.showText("Form has name and phone");content.endText();}
            pdf.save(out);var result=reader.inspect(file("proof.pdf"),out.toByteArray());
            assertThat(result.sources().getFirst().page()).isEqualTo(1);assertThat(result.sources().getFirst().text()).contains("Form has name and phone");
        }
        try(var pdf=new PDDocument();var out=new ByteArrayOutputStream()){pdf.addPage(new PDPage());pdf.save(out);assertThat(reader.inspect(file("scan.pdf"),out.toByteArray()).warnings()).isNotEmpty();}
        assertThatThrownBy(()->reader.inspect(file("fake.pdf"),"text".getBytes(StandardCharsets.UTF_8))).isInstanceOf(MilestoneViolation.class);
    }
    @Test void rejectsEncryptedPdf()throws Exception{
        try(var pdf=new PDDocument();var out=new ByteArrayOutputStream()){
            pdf.addPage(new PDPage());pdf.protect(new StandardProtectionPolicy("owner","secret",new AccessPermission()));pdf.save(out);
            assertThatThrownBy(()->reader.inspect(file("locked.pdf"),out.toByteArray())).isInstanceOf(MilestoneViolation.class);
        }
    }
}
