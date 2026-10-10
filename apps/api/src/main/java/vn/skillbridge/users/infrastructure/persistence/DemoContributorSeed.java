package vn.skillbridge.users.infrastructure.persistence;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import javax.sql.DataSource;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

/**
 * Three demo contributors, one per tier: Lê Tuấn Lộc (SILVER), Trần Minh Anh (BRONZE, no CV yet, so the
 * readiness checklist has something to show) and Phạm Gia Huy (GOLD). Their completed-project history comes
 * from {@code db/demo/contributor-history.sql}.
 */
@Component
@Profile("demo")
@Order(30)
class DemoContributorSeed implements ApplicationRunner {
    private static final UUID LOC = UUID.fromString("40000000-0000-0000-0000-000000000001");
    private static final UUID MINH_ANH = UUID.fromString("40000000-0000-0000-0000-000000000004");
    private static final UUID GIA_HUY = UUID.fromString("40000000-0000-0000-0000-000000000005");
    private static final Instant SEEDED_AT = Instant.parse("2026-09-01T08:00:00Z");

    private final SpringDataContributorProfileRepository profiles;
    private final SpringDataEducationRepository education;
    private final SpringDataCvRepository cvs;
    private final SpringDataCvFileRepository cvFiles;
    private final DataSource dataSource;

    DemoContributorSeed(SpringDataContributorProfileRepository profiles, SpringDataEducationRepository education,
            SpringDataCvRepository cvs, SpringDataCvFileRepository cvFiles, DataSource dataSource) {
        this.profiles = profiles;
        this.education = education;
        this.cvs = cvs;
        this.cvFiles = cvFiles;
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) {
        profile(LOC, "STUDENT", "Phát triển web front-end", List.of("react", "nextjs", "typescript", "figma"));
        profile(MINH_ANH, "STUDENT", "Thiết kế đồ họa và nội dung", List.of("figma", "graphic-design", "copywriting"));
        profile(GIA_HUY, "RECENT_GRADUATE", "Phát triển ứng dụng web", List.of("react", "typescript", "nextjs", "seo"));

        educationEntry(LOC, "ĐH Khoa học Tự nhiên, ĐHQG-HCM", "Công nghệ Thông tin", "BACHELOR", null,
                "2023-09-01", "2027-06-01", "CURRENTLY_STUDYING");
        educationEntry(MINH_ANH, "ĐH Kinh tế TP.HCM", "Marketing", "BACHELOR", null,
                "2024-09-01", "2028-06-01", "CURRENTLY_STUDYING");
        educationEntry(GIA_HUY, "ĐH Bách khoa, ĐHQG-HCM", "Khoa học Máy tính", "BACHELOR", "Kỹ sư Khoa học Máy tính",
                "2021-09-01", "2025-08-01", "GRADUATED");

        cv(LOC, "CV_LeTuanLoc.pdf", "Le Tuan Loc", "Front-end developer (student)");
        cv(GIA_HUY, "CV_PhamGiaHuy.pdf", "Pham Gia Huy", "Web application developer");

        new ResourceDatabasePopulator(new ClassPathResource("db/demo/contributor-history.sql")).execute(dataSource);
    }

    private void profile(UUID userId, String background, String specialization, List<String> skills) {
        if (profiles.existsById(userId)) return;
        profiles.save(new ContributorProfileJpaEntity(userId, background, specialization, skills, SEEDED_AT, SEEDED_AT));
    }

    private void educationEntry(UUID userId, String institution, String field, String level, String degree,
            String start, String end, String status) {
        if (education.countByUserId(userId) > 0) return;
        var entity = new EducationJpaEntity(UUID.nameUUIDFromBytes((userId + "-education").getBytes()), userId);
        entity.institution = institution;
        entity.fieldOfStudy = field;
        entity.educationLevel = level;
        entity.degreeName = degree;
        entity.startMonth = LocalDate.parse(start);
        entity.endMonth = LocalDate.parse(end);
        entity.status = status;
        entity.createdAt = SEEDED_AT;
        entity.updatedAt = SEEDED_AT;
        education.save(entity);
    }

    private void cv(UUID userId, String fileName, String name, String headline) {
        if (cvs.existsById(userId)) return;
        byte[] content = samplePdf(name, headline);
        var entity = new CvJpaEntity(userId);
        entity.fileName = fileName;
        entity.sizeBytes = content.length;
        entity.pageCount = 1;
        entity.sha256 = sha256(content);
        entity.status = "READY";
        entity.uploadedAt = SEEDED_AT;
        cvs.saveAndFlush(entity);
        cvFiles.save(new CvFileJpaEntity(userId, content));
    }

    /** A one-page placeholder CV. Standard fonts have no Vietnamese glyphs, so the text is unaccented. */
    private static byte[] samplePdf(String name, String headline) {
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            document.addPage(page);
            try (PDPageContentStream text = new PDPageContentStream(document, page)) {
                text.beginText();
                text.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 22);
                text.newLineAtOffset(72, 700);
                text.showText(name);
                text.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 13);
                text.newLineAtOffset(0, -28);
                text.showText(headline);
                text.newLineAtOffset(0, -22);
                text.showText("Sample CV generated for the GenDA demo.");
                text.endText();
            }
            document.save(out);
            return out.toByteArray();
        } catch (IOException exception) {
            throw new UncheckedIOException(exception);
        }
    }

    private static String sha256(byte[] content) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(content));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(exception);
        }
    }
}
