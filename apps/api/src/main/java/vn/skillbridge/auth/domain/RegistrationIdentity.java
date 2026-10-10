package vn.skillbridge.auth.domain;

import java.net.URI;

public record RegistrationIdentity(String taxCode, String companyWebsite) {
    public static RegistrationIdentity create(UserRole role, String rawTaxCode, String rawCompanyWebsite) {
        if (role != UserRole.SME) return new RegistrationIdentity(null, null);

        String taxCode = normalizeTaxCode(rawTaxCode);
        if (!taxCode.isBlank()) {
            if (!taxCode.matches("^[0-9]{10}(-[0-9]{3})?$")) {
                throw new IllegalArgumentException("Invalid Vietnamese tax code");
            }
            return new RegistrationIdentity(taxCode, null);
        }

        String website = normalizeWebsite(rawCompanyWebsite);
        if (!isValidWebsite(website)) {
            throw new IllegalArgumentException("SME tax code or company website is required");
        }
        return new RegistrationIdentity(null, website);
    }

    private static String normalizeTaxCode(String value) {
        if (value == null) return "";
        String digits = value.replaceAll("[\\s.-]", "");
        if (digits.matches("^[0-9]{13}$")) return digits.substring(0, 10) + "-" + digits.substring(10);
        return digits;
    }

    private static String normalizeWebsite(String value) {
        if (value == null || value.isBlank()) return "";
        String trimmed = value.trim();
        return trimmed.matches("(?i)^https?://.*") ? trimmed : "https://" + trimmed;
    }

    private static boolean isValidWebsite(String value) {
        try {
            URI uri = URI.create(value);
            String host = uri.getHost();
            return ("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme()))
                    && host != null && host.contains(".") && !host.startsWith(".") && !host.endsWith(".");
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }
}

