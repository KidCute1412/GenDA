package vn.skillbridge.platform.infrastructure.config;

import java.security.GeneralSecurityException;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLEngine;
import javax.net.ssl.SSLException;

public final class TlsBootstrap {
    private TlsBootstrap() {}

    public static void initialize() throws GeneralSecurityException, SSLException {
        // Initialize JSSE and ClientHello keys before the pooler's 2.5-second TLS deadline starts.
        SSLEngine engine = SSLContext.getDefault().createSSLEngine();
        engine.setUseClientMode(true);
        engine.beginHandshake();
    }
}
