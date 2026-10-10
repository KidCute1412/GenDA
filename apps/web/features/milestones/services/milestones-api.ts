import type { components } from "@genda/api-client";
import { getAuthMutationHeaders } from "../../auth/services/auth-api";
import { sessionApi, withSession, withSessionNoContent } from "../../auth/services/session-request";

export type Workspace = components["schemas"]["WorkspaceResponse"];
export type ExecutionMilestone = components["schemas"]["ExecutionMilestoneResponse"];
export type Handoff = components["schemas"]["HandoffResponse"];
export type Attachment = components["schemas"]["HandoffAttachmentResponse"];
export type AiReview = components["schemas"]["AiReviewResponse"];
type SubmitInput = components["schemas"]["SubmitHandoffRequest"];
type FundingInput = components["schemas"]["MilestoneFundingRequest"];
type DecisionInput = components["schemas"]["HandoffDecisionRequest"];

export function getWorkspace(projectId: string) {
  return withSession(() => sessionApi.GET("/api/v1/projects/{projectId}/workspace", { params: { path: { projectId } } }), "Không thể tải workspace.");
}
export function uploadAttachment(milestoneId: string, file: File) {
  return withSession(async () => sessionApi.POST("/api/v1/milestones/{milestoneId}/attachments", {
    params: { path: { milestoneId } }, headers: await getAuthMutationHeaders(), body: { file: file as unknown as string },
    bodySerializer: () => { const form = new FormData(); form.append("file", file, file.name); return form; }
  }), "Không thể tải tệp lên.");
}
export function submitHandoff(milestoneId: string, body: SubmitInput) {
  return withSessionNoContent(async () => sessionApi.POST("/api/v1/milestones/{milestoneId}/submissions", {
    params: { path: { milestoneId } }, headers: await getAuthMutationHeaders(), body
  }), "Không thể nộp bàn giao.");
}
export function decideHandoff(milestoneId: string, revisionId: string, body: DecisionInput) {
  return withSessionNoContent(async () => sessionApi.POST("/api/v1/milestones/{milestoneId}/submissions/{revisionId}/decision", {
    params: { path: { milestoneId, revisionId } }, headers: await getAuthMutationHeaders(), body
  }), "Không thể ghi quyết định nghiệm thu.");
}
export function markFunding(milestoneId: string, body: FundingInput) {
  return withSessionNoContent(async () => sessionApi.POST("/api/v1/milestones/{milestoneId}/funding", {
    params: { path: { milestoneId } }, headers: await getAuthMutationHeaders(), body
  }), "Không thể cập nhật quỹ mô phỏng.");
}
export function analyzeHandoff(milestoneId: string, revisionId: string) {
  return withSession(async () => sessionApi.POST("/api/v1/milestones/{milestoneId}/submissions/{revisionId}/ai-review", {
    params: { path: { milestoneId, revisionId } }, headers: await getAuthMutationHeaders()
  }), "AI chưa thể phân tích. Bạn vẫn có thể nghiệm thu bình thường.");
}
export function giveAiFeedback(reviewId: string, helpful: boolean) {
  return withSessionNoContent(async () => sessionApi.PUT("/api/v1/ai-reviews/{reviewId}/feedback", {
    params: { path: { reviewId } }, headers: await getAuthMutationHeaders(), body: { helpful }
  }), "Không thể lưu phản hồi.");
}
export async function downloadAttachment(attachment: Attachment) {
  const blob = await withSession(() => sessionApi.GET("/api/v1/attachments/{attachmentId}/download", {
    params: { path: { attachmentId: attachment.id } }, parseAs: "blob"
  }) as Promise<{ data?: Blob; error?: unknown; response: Response }>, "Không thể tải tệp bàn giao.");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = attachment.name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
