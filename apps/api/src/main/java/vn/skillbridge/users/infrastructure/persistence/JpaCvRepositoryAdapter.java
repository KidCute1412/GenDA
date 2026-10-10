package vn.skillbridge.users.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import vn.skillbridge.users.application.CvRepository;
import vn.skillbridge.users.domain.ContributorCv;
import vn.skillbridge.users.domain.CvStatus;

@Repository
class JpaCvRepositoryAdapter implements CvRepository {
    private final SpringDataCvRepository metadata;
    private final SpringDataCvFileRepository files;

    JpaCvRepositoryAdapter(SpringDataCvRepository metadata, SpringDataCvFileRepository files) {
        this.metadata = metadata;
        this.files = files;
    }

    @Override
    public Optional<ContributorCv> findByUserId(UUID userId) {
        return metadata.findById(userId).map(entity -> new ContributorCv(entity.userId, entity.fileName,
                entity.sizeBytes, entity.pageCount, entity.sha256, CvStatus.valueOf(entity.status),
                entity.uploadedAt));
    }

    @Override
    public Optional<byte[]> findContent(UUID userId) {
        return files.findById(userId).map(file -> file.content);
    }

    @Override
    public void save(ContributorCv cv, byte[] content) {
        CvJpaEntity entity = metadata.findById(cv.userId()).orElseGet(() -> new CvJpaEntity(cv.userId()));
        entity.fileName = cv.fileName();
        entity.sizeBytes = cv.sizeBytes();
        entity.pageCount = cv.pageCount();
        entity.sha256 = cv.sha256();
        entity.status = cv.status().name();
        entity.uploadedAt = cv.uploadedAt();
        metadata.saveAndFlush(entity);

        CvFileJpaEntity file = files.findById(cv.userId()).orElseGet(() -> new CvFileJpaEntity(cv.userId(), content));
        file.content = content;
        files.save(file);
    }
}
