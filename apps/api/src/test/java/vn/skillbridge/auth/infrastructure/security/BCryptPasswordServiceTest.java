package vn.skillbridge.auth.infrastructure.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import vn.skillbridge.auth.application.AuthException;

class BCryptPasswordServiceTest {
    private final BCryptPasswordService passwords = new BCryptPasswordService(new BCryptPasswordEncoder(4));

    @Test
    void hashesAndMatchesWithoutStoringTheRawPassword() {
        String hash = passwords.hash("Password@1");
        assertThat(hash).isNotEqualTo("Password@1");
        assertThat(passwords.matches("Password@1", hash)).isTrue();
        assertThat(passwords.matches("Wrong@123", hash)).isFalse();
    }

    @Test
    void rejectsOverlongUnicodeBeforeBCrypt() {
        String password = "á".repeat(37);
        assertThatThrownBy(() -> passwords.hash(password)).isInstanceOf(AuthException.class);
        assertThat(passwords.matches(password, passwords.hash("Password@1"))).isFalse();
        assertThat(passwords.matches("a".repeat(72), passwords.hash("a".repeat(72)))).isTrue();
    }
}
