"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { CaretRight, ICON_WEIGHT, X } from "../../../components/ui/icons";
import type { DialogueLine } from "../types";
import { GenPortrait } from "./gen-portrait";

export type ScriptChoice = {
  label: string;
  href?: string;
  /** Nhãn phụ in kiểu mã máy bên phải lựa chọn, ví dụ "MỚI". */
  tag?: string;
  onSelect: () => void;
};

export type DialogueScript = {
  id: string;
  lines: DialogueLine[];
  choices: ScriptChoice[];
  reason?: string;
};

/** Bên gọi gắn `key={script.id}` để hội thoại mới chạy lại từ câu đầu. */
type Props = {
  script: DialogueScript;
  /** Người dùng tự mở thì đưa tiêu điểm vào hộp thoại; Gen tự bật thì không giành tiêu điểm. */
  takeFocus: boolean;
  onClose: () => void;
  /** Gọi một lần khi câu cuối đã hiện đủ: sinh viên đã nghe hết điều Gen nói. */
  onReachEnd?: () => void;
  footer?: ReactNode;
};

/** Nhịp chữ chạy. Đủ nhanh để không bắt người đọc chờ, đủ chậm để đọc ra là "đang nói". */
const CHAR_MS = 24;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Hộp thoại kiểu game: chân dung Gen đứng trên mép hộp, chữ chạy từng ký tự, bấm để hiện hết
 * câu hoặc sang câu sau, câu cuối mở ra các lựa chọn đánh số. Không chặn trang (không có lớp
 * phủ, không bẫy tiêu điểm) vì đây là lời nhắc, không phải câu hỏi bắt buộc trả lời.
 */
export function GenDialogue({ script, takeFocus, onClose, onReachEnd, footer }: Props) {
  const ids = useId();
  // Câu đang nói và số ký tự đã hiện đổi CÙNG lúc, để câu mới không nháy lại chữ của câu cũ
  const [cursor, setCursor] = useState({ line: 0, typed: 0 });
  const { line: lineIndex, typed } = cursor;
  const rootRef = useRef<HTMLElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const firstChoiceRef = useRef<HTMLElement | null>(null);
  const reachedEnd = useRef(false);
  /**
   * Tiêu điểm có đang ở trong hộp thoại không. Không hỏi `document.activeElement` lúc lựa chọn
   * hiện ra được, vì nút "Tiếp" đang giữ tiêu điểm vừa bị gỡ khỏi trang ngay trước đó.
   */
  const focusWithin = useRef(false);

  const line = script.lines[lineIndex] ?? script.lines[0];
  const chars = Array.from(line.text);
  const done = typed >= chars.length;
  const isLast = lineIndex >= script.lines.length - 1;

  // Chữ chạy từng ký tự; người dùng giảm chuyển động thì hiện ngay cả câu
  useEffect(() => {
    const total = Array.from(script.lines[lineIndex]?.text ?? "").length;
    if (prefersReducedMotion()) { setCursor({ line: lineIndex, typed: total }); return; }
    const timer = window.setInterval(() => {
      setCursor((current) => {
        if (current.line !== lineIndex || current.typed >= total) { window.clearInterval(timer); return current; }
        return { line: lineIndex, typed: current.typed + 1 };
      });
    }, CHAR_MS);
    return () => window.clearInterval(timer);
  }, [script.lines, lineIndex]);

  useEffect(() => {
    if (done && isLast && !reachedEnd.current) {
      reachedEnd.current = true;
      onReachEnd?.();
    }
  }, [done, isLast, onReachEnd]);

  useEffect(() => {
    if (takeFocus) nextRef.current?.focus({ preventScroll: true });
  }, [takeFocus]);

  // Lựa chọn vừa hiện: chuyển tiêu điểm vào lựa chọn đầu nếu người dùng đang thao tác trong hộp thoại
  useEffect(() => {
    if (done && isLast && focusWithin.current) firstChoiceRef.current?.focus({ preventScroll: true });
  }, [done, isLast]);

  // Bấm lúc chữ đang chạy thì hiện hết câu ngay (design.md 4.12e: hoạt ảnh không bao giờ chặn thao tác)
  const advance = useCallback(() => {
    if (!done) setCursor({ line: lineIndex, typed: chars.length });
    else if (!isLast) setCursor({ line: lineIndex + 1, typed: 0 });
  }, [chars.length, done, isLast, lineIndex]);

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
    const choiceNumber = Number(event.key);
    if (done && isLast && choiceNumber >= 1 && choiceNumber <= script.choices.length) {
      event.preventDefault();
      const choice = script.choices[choiceNumber - 1];
      const target = rootRef.current?.querySelector<HTMLElement>(`[data-choice="${choiceNumber}"]`);
      if (choice.href && target) target.click(); else choice.onSelect();
    }
  }

  const position = `${String(lineIndex + 1).padStart(2, "0")}/${String(script.lines.length).padStart(2, "0")}`;

  return (
    <section
      ref={rootRef}
      className="gen-dialog"
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${ids}-name`}
      onKeyDown={onKeyDown}
      onFocus={() => { focusWithin.current = true; }}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) focusWithin.current = false; }}
    >
      <div className="gen-dialog__stage" aria-hidden="true">
        <GenPortrait className="gen-dialog__portrait" expression={line.expression} talking={!done} blinkKey={`${script.id}-${lineIndex}`} />
      </div>

      <div className="gen-dialog__box">
        <header className="gen-dialog__bar">
          <span className="gen-dialog__name" id={`${ids}-name`}>Gen</span>
          <span className="gen-dialog__role" aria-hidden="true">{"// TRỢ LÝ TÌM VIỆC"}</span>
          <span className="gen-dialog__counter" aria-hidden="true">{position}</span>
          <button type="button" className="gen-dialog__close" onClick={onClose} aria-label="Đóng hội thoại với Gen">
            <X size={18} weight={ICON_WEIGHT} aria-hidden="true" />
          </button>
        </header>

        {/* Bấm vào vùng chữ để đi nhanh, giống hộp thoại trong game; bàn phím dùng nút Tiếp bên dưới */}
        <div className="gen-dialog__text" onClick={advance} aria-hidden="true">
          {chars.slice(0, typed).join("")}
          <span className="gen-dialog__ghost">{chars.slice(typed).join("")}</span>
        </div>
        <p className="visually-hidden" aria-live="polite">{line.text}</p>

        {done && isLast ? (
          <ol className="gen-dialog__choices">
            {script.choices.map((choice, index) => {
              const content = (
                <>
                  <span className="gen-choice__key" aria-hidden="true">{index + 1}</span>
                  <span className="gen-choice__label">{choice.label}</span>
                  {choice.tag ? <span className="gen-choice__tag">{choice.tag}</span> : null}
                </>
              );
              const ref = index === 0 ? (node: HTMLElement | null) => { firstChoiceRef.current = node; } : undefined;
              return (
                <li key={choice.label}>
                  {choice.href ? (
                    <Link ref={ref} href={choice.href} className="gen-choice" data-choice={index + 1} onClick={choice.onSelect}>{content}</Link>
                  ) : (
                    <button ref={ref} type="button" className="gen-choice" data-choice={index + 1} onClick={choice.onSelect}>{content}</button>
                  )}
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="gen-dialog__advance">
            <button ref={nextRef} type="button" className="gen-dialog__next" onClick={advance}>
              {done ? "Tiếp" : "Hiện hết"}
              <CaretRight size={14} weight={ICON_WEIGHT} aria-hidden="true" />
            </button>
          </div>
        )}

        {script.reason && done && isLast ? (
          <details className="gen-dialog__why">
            <summary>Vì sao Gen nói vậy?</summary>
            <p>{script.reason}</p>
          </details>
        ) : null}
        {footer && done && isLast ? footer : null}
      </div>
    </section>
  );
}
