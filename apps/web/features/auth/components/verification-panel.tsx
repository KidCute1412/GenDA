"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Dropzone } from "../../../components/ui/dropzone";
import { TextField } from "../../../components/ui/field";
import { Alert } from "../../../components/ui/alert";
import { useDemoPersistedState } from "../../../lib/hooks/use-demo-persisted-state";

/**
 * Hai phương thức nộp minh chứng sinh viên (docs/design.md 7.2, FR-USR-02).
 *
 * Dùng tab thay vì hiện cả hai cùng lúc: người dùng chỉ cần MỘT trong hai cách,
 * hiện cả hai sẽ khiến họ tưởng phải làm đủ. Đây là Progressive Disclosure ở
 * quy mô nhỏ.
 *
 * Tab dựng theo mẫu WAI-ARIA: role="tablist" / "tab" / "tabpanel", điều khiển
 * được bằng phím mũi tên trái phải, và chỉ tab đang chọn nằm trong luồng Tab.
 */
const TABS = [
  { id: "email", label: "Email trường" },
  { id: "card", label: "Ảnh thẻ sinh viên" }
];

export function VerificationPanel() {
  const [active, setActive] = useState("email");
  const [submitted, setSubmitted] = useDemoPersistedState("student-verification:submitted", false);

  function onKeyDown(event: React.KeyboardEvent) {
    const index = TABS.findIndex((tab) => tab.id === active);
    if (event.key === "ArrowRight") setActive(TABS[(index + 1) % TABS.length].id);
    if (event.key === "ArrowLeft") setActive(TABS[(index - 1 + TABS.length) % TABS.length].id);
  }

  return (
    <div>
      {submitted ? <Alert variant="success" title="Đã gửi minh chứng" live="polite">Hồ sơ của bạn đang chờ quản trị viên xét duyệt. Chúng tôi sẽ gửi email khi có kết quả.</Alert> : null}
      <div className="tabs" role="tablist" aria-label="Cách nộp minh chứng" onKeyDown={onKeyDown}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            className="tab"
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "email" ? (
        <div role="tabpanel" id="panel-email" aria-labelledby="tab-email">
          <TextField
            id="school-email"
            label="Email do trường cấp"
            type="email"
            required
            placeholder="mssv@hcmus.edu.vn"
            hint="Chúng tôi gửi mã xác minh tới hộp thư này. Chỉ chấp nhận tên miền của các trường tại TP.HCM."
          />
          <Button type="button" onClick={() => setSubmitted(true)}>Gửi mã xác minh</Button>
        </div>
      ) : (
        <div role="tabpanel" id="panel-card" aria-labelledby="tab-card">
          <p className="text-muted" style={{ marginBottom: "var(--space-3)" }}>
            Chụp rõ mặt trước thẻ, thấy được họ tên, mã số sinh viên và hạn sử dụng.
          </p>
          <Dropzone
            id="student-card"
            accept="image/jpeg,image/png"
            hint="Ảnh JPG hoặc PNG, tối đa 5MB."
          />
          <p className="field__hint" style={{ marginBottom: "var(--space-5)" }}>
            Ảnh thẻ chỉ dùng để xác minh và không hiển thị công khai ở bất kỳ đâu.
          </p>
          <Button type="button" onClick={() => setSubmitted(true)}>Gửi minh chứng</Button>
        </div>
      )}
    </div>
  );
}
