package vn.skillbridge.auth.infrastructure.email;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import vn.skillbridge.auth.application.emailverification.EmailSender;
import vn.skillbridge.auth.infrastructure.config.EmailVerificationProperties;

@Component
class SmtpEmailSender implements EmailSender {
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm 'UTC'")
            .withZone(ZoneOffset.UTC);
    private final JavaMailSender mailSender;
    private final EmailVerificationProperties properties;

    SmtpEmailSender(JavaMailSender mailSender, EmailVerificationProperties properties) {
        this.mailSender = mailSender;
        this.properties = properties;
    }

    @Override
    public void sendVerificationCode(String email, String code, Instant expiresAt) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(properties.from());
        message.setTo(email);
        message.setSubject("Mã xác minh email GenDA");
        message.setText("Mã xác minh GenDA của bạn là: " + code + "\n\nMã hết hạn lúc "
                + TIME_FORMAT.format(expiresAt) + ". Không chia sẻ mã này với người khác.");
        mailSender.send(message);
    }
}
