package vn.skillbridge.platform.infrastructure.config;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import static org.assertj.core.api.Assertions.assertThat;

class TlsBootstrapTest {
    @TempDir
    Path temporaryDirectory;

    @Test
    void coldJvmGeneratesClientHelloWithoutOpeningASocket() throws Exception {
        Path transcript = temporaryDirectory.resolve("tls.log");
        Process process = new ProcessBuilder(
                Path.of(System.getProperty("java.home"), "bin", "java").toString(),
                "-Djavax.net.debug=ssl:handshake", "-cp", System.getProperty("java.class.path"),
                Probe.class.getName())
                .redirectErrorStream(true).redirectOutput(transcript.toFile()).start();
        try {
            assertThat(process.waitFor(30, TimeUnit.SECONDS)).isTrue();
            String output = java.nio.file.Files.readString(transcript, StandardCharsets.UTF_8);
            assertThat(process.exitValue()).withFailMessage(output).isZero();
            assertThat(output).contains("Produced ClientHello handshake message");
        } finally {
            process.destroyForcibly();
        }
    }

    public static class Probe {
        public static void main(String[] args) throws Exception {
            TlsBootstrap.initialize();
        }
    }
}
