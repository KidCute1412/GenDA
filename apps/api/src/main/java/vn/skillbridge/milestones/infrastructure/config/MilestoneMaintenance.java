package vn.skillbridge.milestones.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import vn.skillbridge.milestones.application.AttachmentService;

@Configuration @EnableScheduling
public class MilestoneMaintenance {
    private final AttachmentService attachments;
    public MilestoneMaintenance(AttachmentService attachments){this.attachments=attachments;}
    @Scheduled(fixedDelay=3600000,initialDelay=60000)
    public void cleanup(){
        for(var attachment:attachments.expired()) {
            try { attachments.cleanup(attachment); }
            catch(RuntimeException e) { org.slf4j.LoggerFactory.getLogger(MilestoneMaintenance.class).warn("Attachment cleanup failed: {}",attachment.id()); }
        }
    }
}
