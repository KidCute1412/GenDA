package vn.skillbridge.auth.infrastructure.persistence.account;

import java.util.List;
import java.util.UUID;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("demo")
@Order(20)
class DemoAuthSeed implements ApplicationRunner {
    private static final String DEMO_PASSWORD = "Demo@12345";
    private final SpringDataAuthUserRepository users;
    private final PasswordEncoder passwordEncoder;

    DemoAuthSeed(SpringDataAuthUserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        List<AuthUserJpaEntity> seeds = List.of(
                new AuthUserJpaEntity(UUID.fromString("40000000-0000-0000-0000-000000000001"),
                        "letuanloc.2203@hcmus.edu.vn", passwordEncoder.encode(DEMO_PASSWORD), "Lê Tuấn Lộc",
                        "CONTRIBUTOR", "ACTIVE", true, null, null, null),
                new AuthUserJpaEntity(UUID.fromString("40000000-0000-0000-0000-000000000002"),
                        "contact@coffeelab.vn", passwordEncoder.encode(DEMO_PASSWORD), "The Coffee Lab",
                        "SME", "ACTIVE", true, "APPROVED", "0316789012", null),
                new AuthUserJpaEntity(UUID.fromString("40000000-0000-0000-0000-000000000003"),
                        "admin@genda.vn", passwordEncoder.encode(DEMO_PASSWORD), "Đỗ Minh Triết",
                        "ADMIN", "ACTIVE", true, null, null, null),
                // One contributor per tier besides Lộc (SILVER): BRONZE and GOLD.
                new AuthUserJpaEntity(UUID.fromString("40000000-0000-0000-0000-000000000004"),
                        "tranminhanh@demo.genda.vn", passwordEncoder.encode(DEMO_PASSWORD), "Trần Minh Anh",
                        "CONTRIBUTOR", "ACTIVE", true, null, null, null),
                new AuthUserJpaEntity(UUID.fromString("40000000-0000-0000-0000-000000000005"),
                        "phamgiahuy@demo.genda.vn", passwordEncoder.encode(DEMO_PASSWORD), "Phạm Gia Huy",
                        "CONTRIBUTOR", "ACTIVE", true, null, null, null));
        seeds.stream().filter(seed -> !users.existsById(seed.id)).forEach(users::save);
    }
}
