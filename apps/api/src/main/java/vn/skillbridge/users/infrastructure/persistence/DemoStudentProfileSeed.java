package vn.skillbridge.users.infrastructure.persistence;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Profile("demo")
@Order(30)
class DemoStudentProfileSeed implements ApplicationRunner {
    private static final UUID STUDENT_ID = UUID.fromString("40000000-0000-0000-0000-000000000001");
    private final SpringDataStudentProfileRepository profiles;

    DemoStudentProfileSeed(SpringDataStudentProfileRepository profiles) {
        this.profiles = profiles;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (profiles.existsById(STUDENT_ID)) return;
        Instant seededAt = Instant.parse("2026-09-01T08:00:00Z");
        profiles.save(new StudentProfileJpaEntity(STUDENT_ID, "ĐH Khoa học Tự nhiên, ĐHQG-HCM",
                "Công nghệ Thông tin", "YEAR_3", List.of("react", "nextjs", "typescript", "figma"),
                seededAt, seededAt));
    }
}
