package vn.skillbridge.milestones.infrastructure.storage;

import java.util.Map;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import vn.skillbridge.milestones.application.DeliverableStorage;
import vn.skillbridge.milestones.domain.MilestoneViolation;
import vn.skillbridge.milestones.infrastructure.http.RemoteRequest;

@Component
public class SupabaseDeliverableStorage implements DeliverableStorage {
    private final String url,key,bucket;
    public SupabaseDeliverableStorage(@Value("\u0024{app.milestones.storage-url:}") String url,
            @Value("\u0024{app.milestones.storage-key:}") String key,@Value("\u0024{app.milestones.bucket:milestone-deliverables}") String bucket) {
        this.url=url.replaceAll("/+$","");this.key=key;this.bucket=bucket;
        if(!bucket.matches("[A-Za-z0-9_-]+"))throw new IllegalArgumentException("Invalid deliverables bucket");
    }
    public boolean available(){return !url.isBlank()&&!key.isBlank();}
    private String endpoint(String object){
        if(!available())throw new MilestoneViolation("STORAGE_NOT_CONFIGURED","File storage is not configured; note and links remain available");
        if(!object.matches("[A-Za-z0-9_:/-]+"))throw new IllegalArgumentException("Invalid object key");
        return url+"/storage/v1/object/"+bucket+"/"+object;
    }
    private Map<String,String> headers(String type){return Map.of("Authorization","Bearer "+key,"apikey",key,"Content-Type",type);}
    public void upload(String object,byte[] content,String type){RemoteRequest.send(endpoint(object),"POST",headers(type),content,65536,"STORAGE");}
    public byte[] download(String object){return RemoteRequest.send(endpoint(object),"GET",headers("application/octet-stream"),null,5*1024*1024,"STORAGE");}
    public void delete(String object){RemoteRequest.send(endpoint(object),"DELETE",headers("application/json"),null,65536,"STORAGE");}
}
