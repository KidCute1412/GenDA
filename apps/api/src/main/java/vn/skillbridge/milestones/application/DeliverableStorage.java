package vn.skillbridge.milestones.application;

public interface DeliverableStorage {
    boolean available();
    void upload(String key, byte[] content, String mediaType);
    byte[] download(String key);
    void delete(String key);
}
