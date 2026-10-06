package vn.skillbridge.auth.application;

import java.util.Optional;
import java.util.UUID;
import vn.skillbridge.auth.domain.AuthUser;

public interface AuthAccountRepository {
    Optional<AuthUser> findByEmail(String normalizedEmail);
    Optional<AuthUser> findById(UUID id);
    void create(AuthUser user, String taxCode, String companyWebsite);
}
