package vn.skillbridge.milestones.api;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.nio.charset.StandardCharsets;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import vn.skillbridge.platform.api.dto.ApiError;
import vn.skillbridge.auth.application.session.AuthenticatedPrincipal;
import vn.skillbridge.milestones.application.*;
import vn.skillbridge.milestones.api.dto.MilestoneResponses.*;
import vn.skillbridge.milestones.api.dto.MilestoneRequests.*;

@RestController @RequestMapping("/api/v1")
@SecurityRequirement(name="cookieAuth")
@ApiResponses({
    @ApiResponse(responseCode="401",description="Authentication required",content=@Content(schema=@Schema(implementation=ApiError.class))),
    @ApiResponse(responseCode="403",description="Role or CSRF rejected",content=@Content(schema=@Schema(implementation=ApiError.class))),
    @ApiResponse(responseCode="404",description="Resource missing or belongs to another assignment",content=@Content(schema=@Schema(implementation=ApiError.class))),
    @ApiResponse(responseCode="409",description="Stale revision or invalid transition",content=@Content(schema=@Schema(implementation=ApiError.class))),
    @ApiResponse(responseCode="422",description="Invalid evidence or missing reason",content=@Content(schema=@Schema(implementation=ApiError.class))),
    @ApiResponse(responseCode="429",description="AI rate limit reached",content=@Content(schema=@Schema(implementation=ApiError.class))),
    @ApiResponse(responseCode="503",description="AI or storage unavailable; normal workflow remains available",content=@Content(schema=@Schema(implementation=ApiError.class)))
})
public class MilestoneController {
    private final MilestoneService milestones;
    private final AttachmentService attachments;
    private final AiReviewService ai;
    private final AiReviewTransactions reviews;
    public MilestoneController(MilestoneService milestones,AttachmentService attachments,AiReviewService ai,AiReviewTransactions reviews){this.milestones=milestones;this.attachments=attachments;this.ai=ai;this.reviews=reviews;}
    @GetMapping("/projects/{projectId}/workspace") @Operation(summary="Read the shared workspace for the assigned contributor or owning SME")
    @ApiResponse(responseCode="200",description="Shared workspace",useReturnTypeSchema=true)
    public WorkspaceResponse workspace(@AuthenticationPrincipal AuthenticatedPrincipal actor,@PathVariable String projectId){return WorkspaceResponse.from(milestones.workspace(actor.id(),projectId),ai.available(),attachments.available());}
    @PostMapping(value="/milestones/{milestoneId}/attachments",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    @ApiResponse(responseCode="200",description="Uploaded attachment metadata",useReturnTypeSchema=true)
    public HandoffAttachmentResponse upload(@AuthenticationPrincipal AuthenticatedPrincipal actor,@PathVariable UUID milestoneId,@RequestPart("file") MultipartFile file)throws IOException{return HandoffAttachmentResponse.from(attachments.upload(actor.id(),milestoneId,file.getOriginalFilename(),file.getBytes()));}
    @GetMapping("/attachments/{attachmentId}/download")
    @ApiResponse(responseCode="200",description="Private attachment",content=@Content(mediaType="application/octet-stream",schema=@Schema(type="string",format="binary")))
    public ResponseEntity<byte[]> download(@AuthenticationPrincipal AuthenticatedPrincipal actor,@PathVariable UUID attachmentId){var file=attachments.download(actor.id(),attachmentId);return ResponseEntity.ok().contentType(MediaType.parseMediaType(file.mediaType())).header(HttpHeaders.CONTENT_DISPOSITION,ContentDisposition.attachment().filename(file.name(),StandardCharsets.UTF_8).build().toString()).header("X-Content-Type-Options","nosniff").cacheControl(CacheControl.noStore()).body(file.content());}
    @PostMapping("/milestones/{milestoneId}/submissions") @ResponseStatus(HttpStatus.NO_CONTENT)
    @ApiResponse(responseCode="204",description="Revision submitted",content=@Content)
    public void submit(@AuthenticationPrincipal AuthenticatedPrincipal actor,@PathVariable UUID milestoneId,@Valid @RequestBody SubmitHandoffRequest request){milestones.submit(actor.id(),milestoneId,request.expectedRevision(),request.note(),request.links(),request.attachmentIds());}
    @GetMapping("/milestones/{milestoneId}/submissions")
    @ApiResponse(responseCode="200",description="Revision history",useReturnTypeSchema=true)
    public List<HandoffResponse> history(@AuthenticationPrincipal AuthenticatedPrincipal actor,@PathVariable UUID milestoneId){return milestones.history(actor.id(),milestoneId).stream().map(HandoffResponse::from).toList();}
    @PostMapping("/milestones/{milestoneId}/submissions/{revisionId}/decision") @ResponseStatus(HttpStatus.NO_CONTENT)
    @ApiResponse(responseCode="204",description="Human decision recorded",content=@Content)
    public void decide(@AuthenticationPrincipal AuthenticatedPrincipal actor,@PathVariable UUID milestoneId,@PathVariable UUID revisionId,@Valid @RequestBody HandoffDecisionRequest request){milestones.decide(actor.id(),milestoneId,revisionId,request.decision()==Decision.ACCEPTED,request.reason());}
    @PostMapping("/milestones/{milestoneId}/funding") @ResponseStatus(HttpStatus.NO_CONTENT)
    @ApiResponse(responseCode="204",description="Simulated funding recorded",content=@Content)
    public void funding(@AuthenticationPrincipal AuthenticatedPrincipal actor,@PathVariable UUID milestoneId,@Valid @RequestBody MilestoneFundingRequest request){milestones.funding(actor.id(),milestoneId,request.target(),request.reason(),false);}
    @PostMapping("/milestones/{milestoneId}/submissions/{revisionId}/ai-review")
    @ApiResponse(responseCode="200",description="AI review attempt",useReturnTypeSchema=true)
    public AiReviewResponse analyze(@AuthenticationPrincipal AuthenticatedPrincipal actor,@PathVariable UUID milestoneId,@PathVariable UUID revisionId){return AiReviewResponse.from(ai.run(actor.id(),milestoneId,revisionId));}
    @GetMapping("/milestones/{milestoneId}/submissions/{revisionId}/ai-review")
    @ApiResponse(responseCode="200",description="AI review attempt",useReturnTypeSchema=true)
    @ApiResponse(responseCode="204",description="No attempt yet",content=@Content)
    public ResponseEntity<AiReviewResponse> analysis(@AuthenticationPrincipal AuthenticatedPrincipal actor,@PathVariable UUID milestoneId,@PathVariable UUID revisionId){var result=reviews.get(actor.id(),milestoneId,revisionId);return result==null?ResponseEntity.noContent().build():ResponseEntity.ok(AiReviewResponse.from(result));}
    @PutMapping("/ai-reviews/{reviewId}/feedback") @ResponseStatus(HttpStatus.NO_CONTENT)
    @ApiResponse(responseCode="204",description="Feedback recorded",content=@Content)
    public void feedback(@AuthenticationPrincipal AuthenticatedPrincipal actor,@PathVariable UUID reviewId,@Valid @RequestBody AiFeedbackRequest request){reviews.feedback(actor.id(),reviewId,request.helpful());}
}
