"use client";

import { useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";

const STAGES = ["PENDING_FUNDING", "FUNDED", "RELEASED"] as const;
const LABELS: Record<(typeof STAGES)[number], string> = {
  PENDING_FUNDING: "Chưa ghi nhận quỹ",
  FUNDED: "Đã ghi nhận quỹ",
  RELEASED: "Đã ghi nhận giải ngân"
};

/** Mock UI mirrors the production permission split: SME funds, Admin releases. */
export function EscrowActions({
  initialStage,
  canConfirmFunding,
  canConfirmRelease
}: {
  initialStage: (typeof STAGES)[number];
  canConfirmFunding: boolean;
  canConfirmRelease: boolean;
}) {
  const [stage, setStage] = useState(initialStage);
  const index = STAGES.indexOf(stage);
  const nextAction = stage === "PENDING_FUNDING"
    ? "SME: XÁC NHẬN ĐÃ GHI NHẬN QUỸ"
    : stage === "FUNDED"
      ? "ADMIN: XÁC NHẬN ĐÃ GHI NHẬN GIẢI NGÂN"
      : null;
  const canAdvance = stage === "PENDING_FUNDING" ? canConfirmFunding : stage === "FUNDED" ? canConfirmRelease : false;
  const permissionMessage = stage === "PENDING_FUNDING"
    ? "Chỉ doanh nghiệp sở hữu dự án được xác nhận đã ghi nhận quỹ."
    : "Chỉ quản trị viên được xác nhận đã ghi nhận giải ngân.";

  return (
    <div className="stack stack--sm">
      <ol className="stack stack--sm" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {STAGES.map((item, itemIndex) => (
          <li key={item} className="cluster" style={{ gap: "var(--space-3)" }}>
            <span className="stepper__marker" aria-hidden="true" style={itemIndex <= index ? { backgroundColor: "var(--color-action-primary)", borderColor: "var(--color-action-primary)", color: "var(--color-text-on-accent)" } : undefined}>{itemIndex + 1}</span>
            <span className={itemIndex === index ? undefined : "text-muted"} style={itemIndex === index ? { color: "var(--color-text-heading)", fontWeight: "var(--weight-semibold)" } : undefined}>{LABELS[item]}</span>
          </li>
        ))}
      </ol>
      <Alert variant="warning" title="Đây là ghi nhận mô phỏng">
        GenDA không giữ hay chuyển tiền. Mỗi bước chỉ là xác nhận thủ công có audit; không tự đổi khi nghiệm thu milestone.
      </Alert>
      {nextAction && canAdvance ? <Button type="button" variant="outline" onClick={() => setStage(STAGES[index + 1])}>{nextAction}</Button> : null}
      {nextAction && !canAdvance ? <Alert variant="info">{permissionMessage}</Alert> : null}
      {!nextAction ? <p className="text-muted">Đã ghi nhận đủ trạng thái quỹ mô phỏng.</p> : null}
    </div>
  );
}
