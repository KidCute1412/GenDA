package vn.skillbridge;

import java.security.GeneralSecurityException;
import javax.net.ssl.SSLException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import vn.skillbridge.platform.infrastructure.config.TlsBootstrap;

@SpringBootApplication
public class SkillBridgeApplication {
    public static void main(String[] args) throws GeneralSecurityException, SSLException {
        TlsBootstrap.initialize();
        SpringApplication.run(SkillBridgeApplication.class, args);
    }
}
