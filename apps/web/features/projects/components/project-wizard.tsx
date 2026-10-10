"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Alert } from "../../../components/ui/alert";
import { SelectField, TextAreaField, TextField } from "../../../components/ui/field";
import { Stepper, type Step } from "../../../components/ui/stepper";
import { CheckCircle, ICON_WEIGHT } from "../../../components/ui/icons";
import { SkillMultiSelect } from "./skill-multi-select";
import { BudgetInput } from "./budget-input";
import { MilestoneEditor } from "../../milestones/components/milestone-editor";
import { DraftSaveButton } from "./draft-save-button";
import { TODAY } from "../../../mocks/data";
import { useDemoPersistedState } from "../../../lib/hooks/use-demo-persisted-state";
import { getDemoSession } from "../../auth/services/demo-session";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import type { CreatedProject } from "./created-projects-panel";

/**
 * Màn hình 3 — Wizard Đăng Dự án (docs/design.md 7.3).
 *
 * Chia ba bước là hiện thực của Progressive Disclosure: đăng một dự án đòi hỏi
 * khai chừng mười trường, dồn hết vào một màn hình sẽ gây ngợp nhận thức đúng
 * lúc SME đang bận việc kinh doanh của họ.
 *
 * Yêu cầu tiếp cận bắt buộc (design.md 4.6b): sau khi chuyển bước, TIÊU ĐIỂM
 * được đưa về tiêu đề của bước mới. Nếu không, người dùng trình đọc màn hình
 * bấm "Tiếp tục" xong sẽ không biết màn hình vừa đổi, vì tiêu điểm vẫn nằm ở
 * cái nút cũ giờ đã mang nhãn khác.
 */
const STEP_TITLES = ["Mô tả bài toán", "Kỹ năng và ngân sách", "Mốc bàn giao và nghiệm thu"];

/** Hạn chót bắt buộc là ngày tương lai (BR-11) — chặn ngay ở thuộc tính `min`. */
function tomorrow(): string {
  const date = new Date(`${TODAY}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function ProjectWizard() {
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState(2_000_000);
  const [submitted, setSubmitted] = useState(false);
  const [, setCreatedProjects] = useDemoPersistedState<CreatedProject[]>("projects:created", []);
  const { session, hydrated } = useDemoSession();
  const hasVerifiedEmail = session?.emailVerified === true;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  // Bỏ qua lần chạy đầu: không cướp tiêu điểm của người dùng khi trang vừa tải.
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const steps: Step[] = STEP_TITLES.map((label, index) => ({
    label,
    state: index < step ? "completed" : index === step ? "current" : "upcoming"
  }));

  if (submitted) {
    // Trạng thái Thành công (design.md 8.4): xác nhận rõ ràng + bước kế tiếp.
    return (
      <div className="card stack">
        <h2 className="cluster">
          <CheckCircle
            weight={ICON_WEIGHT}
            aria-hidden="true"
            style={{ color: "var(--color-status-verified)" }}
          />
          Đã gửi dự án đi duyệt
        </h2>
        <p>
          Đội vận hành GenDA sẽ xem trong vòng 4 giờ làm việc. Duyệt xong, dự án hiện ra cho sinh viên ứng
          tuyển và bạn nhận được email báo.
        </p>
        <Alert variant="info">
          Trong lúc chờ, bạn vẫn sửa được nội dung dự án. Mỗi lần sửa thì dự án quay lại hàng đợi duyệt.
        </Alert>
        <div className="cluster">
          <Link href="/sme/projects" className="btn btn--primary">
            Về danh sách dự án của tôi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {hydrated && session?.role !== "SME" ? (
        <Alert variant="warning" title="Chỉ doanh nghiệp được đăng dự án">
          Hãy đăng nhập bằng tài khoản doanh nghiệp để tạo và gửi dự án đi duyệt.
        </Alert>
      ) : null}
      {!hasVerifiedEmail ? (
        <Alert variant="warning" title="Cần xác minh email trước khi gửi dự án">
          Bạn vẫn có thể điền nội dung để chuẩn bị, nhưng chỉ gửi duyệt được sau khi mở liên kết xác minh email. <Link href="/verify-email?token=genda-demo-valid-2026&next=%2Fsme%2Fprojects%2Fnew%3FemailVerified%3D1">Xác minh email</Link>
        </Alert>
      ) : null}
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const currentSession = getDemoSession();
        if (!hasVerifiedEmail || currentSession?.role !== "SME") return;
        const form = event.currentTarget;
        const title = form.querySelector<HTMLInputElement>("#project-title")?.value.trim() ?? "Dự án chưa đặt tên";
        const deadline = form.querySelector<HTMLInputElement>("#project-deadline")?.value ?? "";
        const projectBudget = Number(form.querySelector<HTMLInputElement>('input[name="budget"]')?.value ?? budget);
        setCreatedProjects((current) => [
          ...current,
          {
            id: `p-${Date.now()}`,
            title,
            budget: projectBudget,
            deadline,
            createdAt: new Date().toLocaleDateString("vi-VN"),
            ownerEmail: currentSession.email,
            status: "PENDING_REVIEW"
          }
        ]);
        setSubmitted(true);
      }}
    >
      <Stepper steps={steps} ariaLabel="Tiến độ đăng dự án" />

      <div className="card" style={{ marginTop: "var(--space-8)" }}>
        {/* h2 chứ không phải h1: h1 của trang là "Đăng dự án mới" ở page.tsx.
            tabIndex -1 để nhận được tiêu điểm bằng mã mà không chen vào thứ tự Tab. */}
        <h2 ref={headingRef} tabIndex={-1}>
          Bước {step + 1}: {STEP_TITLES[step]}
        </h2>

        {/* Cả ba bước LUÔN nằm trong cây DOM, chỉ ẩn/hiện bằng thuộc tính `hidden`.
            Đây không phải tối ưu vặt mà là sửa một lỗi mất dữ liệu: nếu render
            theo điều kiện (`step === 0 ? ... : null`), React tháo hẳn các ô nhập
            của bước cũ khỏi cây, nên toàn bộ nội dung SME vừa gõ biến mất khi họ
            bấm "Quay lại". Đó cũng là vi phạm WCAG 2.2 A (3.3.7 Redundant Entry),
            vốn cấm bắt người dùng nhập lại thứ họ đã cung cấp trong cùng quy trình.

            `hidden` cũng gỡ luôn phần tử khỏi cây trợ năng, nên trình đọc màn hình
            không đọc nhầm các bước chưa tới. */}
        <div style={{ marginTop: "var(--space-6)" }} ref={stepsRef}>
          <div hidden={step !== 0}>
            <TextField
              id="project-title"
              label="Bạn cần làm gì"
              required={step === 0}
              placeholder="Ví dụ: Landing page giới thiệu thực đơn mùa mới"
              hint="Viết như bạn đang nhờ một người quen, càng cụ thể càng dễ tìm đúng người."
            />

            <SelectField id="project-industry" label="Lĩnh vực của bạn" required={step === 0}>
              <option value="">Chọn một lĩnh vực</option>
              <option>F&B</option>
              <option>Bán lẻ</option>
              <option>Thương mại điện tử</option>
              <option>Dịch vụ</option>
              <option>Sản xuất</option>
              <option>Khác</option>
            </SelectField>

            <TextAreaField
              id="project-problem"
              label="Mô tả chi tiết yêu cầu"
              required={step === 0}
              rows={8}
              placeholder="Tình hình hiện tại của bạn, bạn muốn đạt được gì, và bạn đã có sẵn những gì (nội dung, ảnh, tài khoản...)."
              hint="Nói rõ thứ bạn đã có sẵn sẽ giúp sinh viên ước lượng đúng khối lượng việc."
            />
          </div>

          <div hidden={step !== 1}>
              <fieldset style={{ border: 0, margin: "0 0 var(--space-field-group)", padding: 0 }}>
                <legend className="field__label" style={{ marginBottom: "var(--space-field-label)" }}>
                  Kỹ năng cần có
                </legend>
                <p className="text-muted" style={{ marginBottom: "var(--space-3)" }}>
                  Chọn từ danh mục chuẩn của hệ thống. Kỹ năng bạn chọn ở đây quyết định dự án được gợi ý
                  cho những bạn sinh viên nào.
                </p>
                <SkillMultiSelect name="skills" max={5} />
              </fieldset>

              <BudgetInput defaultValue={budget} />

              <div className="field">
                <label className="field__label" htmlFor="project-deadline">
                  Hạn hoàn thành toàn dự án
                  <span className="field__required" aria-hidden="true">
                    *
                  </span>
                  <span className="visually-hidden">(bắt buộc)</span>
                </label>
                <input
                  id="project-deadline"
                  className="input"
                  type="date"
                  required={step === 1}
                  min={tomorrow()}
                  aria-describedby="project-deadline-hint"
                />
                <p className="field__hint" id="project-deadline-hint">
                  Chỉ chọn được ngày trong tương lai. Đa số dự án trong khoảng này làm xong trong 2 đến 4
                  tuần.
                </p>
              </div>
          </div>

          <div hidden={step !== 2}>
              <TextAreaField
                id="project-acceptance"
                label="Thế nào là làm xong"
                required={step === 2}
                rows={5}
                placeholder="Ví dụ: chạy tốt trên Chrome và Safari; có mã nguồn kèm hướng dẫn; tôi tự sửa được tên món và giá."
                hint="Đây là thứ bạn sẽ dựa vào để nghiệm thu. Viết càng rõ thì càng ít phải sửa qua lại."
              />

              <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                <legend className="field__label" style={{ marginBottom: "var(--space-field-label)" }}>
                  Chia tiền theo mốc bàn giao
                </legend>
                <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>
                  Sinh viên đọc được phần này trước khi ứng tuyển, nên nó cũng là cam kết của bạn về nhịp
                  thanh toán.
                </p>
                <MilestoneEditor projectBudget={budget} />
              </fieldset>
          </div>
        </div>

        <div
          className="cluster cluster--between"
          style={{ marginTop: "var(--space-8)", paddingTop: "var(--space-6)", borderTop: "1px solid var(--color-border-subtle)" }}
        >
          <Button
            type="button"
            variant="ghost"
            disabled={step === 0}
            onClick={() => setStep((current) => Math.max(0, current - 1))}
          >
            Quay lại
          </Button>

          {step < 2 ? (
            <Button
              type="button"
              onClick={() => {
                const form = stepsRef.current?.closest("form");

                // Kiểm tra hợp lệ TRƯỚC khi sang bước kế. Chỉ bước đang hiện mới
                // mang thuộc tính `required`, nên reportValidity() chỉ soi đúng
                // những trường người dùng đang nhìn thấy — không bao giờ báo lỗi
                // vào một ô đang bị ẩn mà họ không thể sửa.
                if (form && !form.reportValidity()) return;

                // Bước 2 quyết định ngân sách, mà bước 3 cần con số đó để đối
                // chiếu tổng các mốc. Đọc lại từ form ngay trước khi chuyển bước.
                const budgetField = form?.querySelector<HTMLInputElement>('input[name="budget"]');
                if (budgetField) setBudget(Number(budgetField.value));

                setStep((current) => current + 1);
              }}
            >
              Tiếp tục
            </Button>
          ) : (
            <span className="cluster">
              <DraftSaveButton />
              <Button type="submit" disabled={!hasVerifiedEmail || (hydrated && session?.role !== "SME")}>Gửi duyệt</Button>
            </span>
          )}
        </div>
      </div>
    </form>
    </>
  );
}
