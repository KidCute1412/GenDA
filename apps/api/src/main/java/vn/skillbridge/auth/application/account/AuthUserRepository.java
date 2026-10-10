package vn.skillbridge.auth.application.account;

import java.util.Optional;
import java.util.UUID;
import vn.skillbridge.auth.domain.account.AuthUser;

public interface AuthUserRepository {
    Optional<AuthUser> findByEmail(String normalizedEmail);
    Optional<AuthUser> findById(UUID id);
    void create(AuthUser user, String taxCode, String companyWebsite);
}
