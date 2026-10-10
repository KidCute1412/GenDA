package vn.skillbridge.auth.infrastructure.persistence.account;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "app_users")
class AuthUserJpaEntity {
    @Id UUID id;
    @Column(nullable = false, unique = true, length = 254) String email;
    @Column(name = "password_hash", nullable = false, length = 100) String passwordHash;
    @Column(name = "display_name", nullable = false, length = 180) String displayName;
    @Column(nullable = false, length = 16) String role;
    @Column(name = "account_state", nullable = false, length = 32) String accountState;
    @Column(name = "sme_approval_status", length = 16) String smeApprovalStatus;
    @Column(name = "tax_code", length = 14) String taxCode;
    @Column(name = "company_website", length = 512) String companyWebsite;

    protected AuthUserJpaEntity() {}

    AuthUserJpaEntity(UUID id, String email, String passwordHash, String displayName, String role,
            String accountState, String smeApprovalStatus,
            String taxCode, String companyWebsite) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.displayName = displayName;
        this.role = role;
        this.accountState = accountState;
        this.smeApprovalStatus = smeApprovalStatus;
        this.taxCode = taxCode;
        this.companyWebsite = companyWebsite;
    }

    void updateDisplayName(String displayName) {
        this.displayName = displayName;
    }

}
