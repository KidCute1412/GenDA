package vn.skillbridge.users.application;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.skillbridge.users.domain.ContributorCv;
import vn.skillbridge.users.domain.CvPolicy;
import vn.skillbridge.users.domain.CvRejectionReason;
import vn.skillbridge.users.domain.CvStatus;

/**
 * CV upload and retrieval (FR-USR-07..09). Validation is technical only: size, real PDF, readable and not
 * password-protected. A valid file becomes READY without any admin or AI review of its content; a rejected
 * file is reported with its reason and never replaces the current CV.
 */
@Service
public class CvService {
    private final CvRepository cvs;
    private final PdfInspector inspector;
    private final ContributorAccounts contributors;
    private final Clock clock;

    public CvService(CvRepository cvs, PdfInspector inspector, ContributorAccounts contributors, Clock clock) {
        this.cvs = cvs;
        this.inspector = inspector;
        this.contributors = contributors;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public Optional<ContributorCv> current(UUID userId) {
        contributors.require(userId);
        return cvs.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public boolean hasReadyCv(UUID userId) {
        return cvs.findByUserId(userId).map(ContributorCv::isReady).orElse(false);
    }

    @Transactional
    public ContributorCv upload(UUID userId, String originalFileName, String contentType, byte[] content) {
        contributors.require(userId);
        CvPolicy.screen(originalFileName, contentType, content).ifPresent(reason -> {
            throw CvPolicy.rejection(reason);
        });
        int pageCount = switch (inspector.inspect(content)) {
            case PdfInspector.Readable readable when readable.pageCount() > 0 -> readable.pageCount();
            case PdfInspector.PasswordProtected ignored -> throw CvPolicy.rejection(CvRejectionReason.PASSWORD_PROTECTED);
            default -> throw CvPolicy.rejection(CvRejectionReason.CORRUPTED);
        };

        var cv = new ContributorCv(userId, CvPolicy.safeFileName(originalFileName), content.length, pageCount,
                sha256(content), CvStatus.READY, clock.instant());
        cvs.save(cv, content);
        return cv;
    }

    @Transactional(readOnly = true)
    public CvFile file(UUID userId) {
        contributors.require(userId);
        ContributorCv cv = cvs.findByUserId(userId).orElseThrow(CvService::cvNotFound);
        byte[] content = cvs.findContent(userId).orElseThrow(CvService::cvNotFound);
        return new CvFile(cv.fileName(), content);
    }

    private static String sha256(byte[] content) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(content));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private static UsersException cvNotFound() {
        return new UsersException(UsersException.CV_NOT_FOUND, "No CV has been uploaded");
    }
}
