"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { TextAreaField } from "../../../components/ui/field";

/** Mock UI for FR-REV-01..03. Persistence and the once-only constraint belong to reviews use case. */
export function ReviewForm({ studentName, portfolioSlug }: { studentName: string; portfolioSlug: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Alert variant="success" title="Đã gửi đánh giá và tạo portfolio xác thực" live="polite">
        Đánh giá của bạn đã được khóa. Hệ thống đã tạo mục portfolio xác thực cho {studentName}. <Link href={`/portfolio/${portfolioSlug}`}>Mở portfolio công khai</Link>
      </Alert>
    );
  }

  return (
    <form
      className="stack stack--sm"
      onSubmit={(event) => {
        event.preventDefault();
        if (rating === 0 || comment.trim().length < 10) return;
        setSubmitted(true);
      }}
    >
      <h3 style={{ margin: 0 }}>ĐÁNH GIÁ SINH VIÊN</h3>
      <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
        <legend className="field__label">Điểm đánh giá *</legend>
        <div className="cluster" role="radiogroup" aria-label="Điểm đánh giá từ một đến năm sao">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="chip" style={{ cursor: "pointer" }}>
              <input type="radio" name="rating" value={value} checked={rating === value} onChange={() => setRating(value)} />
              {value} SAO
            </label>
          ))}
        </div>
      </fieldset>
      <TextAreaField
        id="sme-review"
        label="Nhận xét"
        required
        rows={4}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        hint="Đánh giá chỉ gửi một lần và không thể sửa sau đó."
      />
      <Button type="submit" disabled={rating === 0 || comment.trim().length < 10}>
        GỬI ĐÁNH GIÁ VÀ TẠO PORTFOLIO
      </Button>
    </form>
  );
}
