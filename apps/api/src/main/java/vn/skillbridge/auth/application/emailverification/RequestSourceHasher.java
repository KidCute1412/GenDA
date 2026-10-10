package vn.skillbridge.auth.application.emailverification;

public interface RequestSourceHasher {
    String hash(String requestSource);
}
