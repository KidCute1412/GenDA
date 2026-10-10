"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ô Google reCAPTCHA v2 ("Tôi không phải người máy") cho đăng nhập / đăng ký.
 *
 * - Site key lấy từ NEXT_PUBLIC_RECAPTCHA_SITE_KEY. Khi chạy dev mà chưa cấu hình, dùng
 *   khóa THỬ NGHIỆM chính thức của Google (luôn qua, widget có dòng cảnh báo) để không
 *   chặn việc phát triển. Ở production bắt buộc phải có khóa thật.
 * - Token chỉ có giá trị khi được kiểm tra phía server (/api/recaptcha/verify) bằng khóa
 *   bí mật; component này chỉ lấy token.
 * - Muốn bắt người dùng giải lại (sai mật khẩu, token hết hạn...) thì đổi `key` của
 *   component để gắn lại widget.
 */
const GOOGLE_TEST_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

export const RECAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
  (process.env.NODE_ENV !== "production" ? GOOGLE_TEST_SITE_KEY : "");

type Grecaptcha = {
  ready: (callback: () => void) => void;
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark";
      hl?: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    }
  ) => number;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
    __gendaRecaptchaLoaded?: () => void;
  }
}

let scriptPromise: Promise<Grecaptcha> | null = null;

/** Nạp script reCAPTCHA đúng một lần cho cả trang. */
function loadRecaptcha(): Promise<Grecaptcha> {
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    window.__gendaRecaptchaLoaded = () => {
      if (window.grecaptcha) resolve(window.grecaptcha);
      else reject(new Error("reCAPTCHA không khởi tạo được"));
    };
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?onload=__gendaRecaptchaLoaded&render=explicit&hl=vi";
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Không tải được reCAPTCHA"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function RecaptchaField({ onChange }: { onChange: (token: string | null) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [status, setStatus] = useState<"loading" | "ready" | "error">(RECAPTCHA_SITE_KEY ? "loading" : "error");

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY || !containerRef.current) return;
    let cancelled = false;
    const container = containerRef.current;

    loadRecaptcha()
      .then((grecaptcha) => {
        grecaptcha.ready(() => {
          if (cancelled || container.childElementCount > 0) return;
          grecaptcha.render(container, {
            sitekey: RECAPTCHA_SITE_KEY,
            theme: "light",
            hl: "vi",
            callback: (token) => onChangeRef.current(token),
            "expired-callback": () => onChangeRef.current(null),
            "error-callback": () => onChangeRef.current(null)
          });
          setStatus("ready");
        });
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      onChangeRef.current(null);
    };
  }, []);

  return (
    <div>
      <div ref={containerRef} style={{ minHeight: status === "error" ? 0 : "78px" }} />
      {status === "loading" ? (
        <p className="text-muted" style={{ margin: 0, fontSize: "11px" }}>Đang tải bước xác minh chống người máy…</p>
      ) : null}
      {status === "error" ? (
        <p role="alert" style={{ margin: 0, fontSize: "12px", color: "var(--color-danger-text, #b91c1c)" }}>
          {RECAPTCHA_SITE_KEY
            ? "Không tải được reCAPTCHA. Kiểm tra kết nối mạng rồi tải lại trang."
            : "reCAPTCHA chưa được cấu hình (thiếu NEXT_PUBLIC_RECAPTCHA_SITE_KEY) nên chưa thể gửi biểu mẫu."}
        </p>
      ) : null}
    </div>
  );
}

/** Gửi token lên server để kiểm tra bằng khóa bí mật. Trả về true nếu hợp lệ. */
export async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    const response = await fetch("/api/recaptcha/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
    if (!response.ok) return false;
    const data = (await response.json()) as { ok?: boolean };
    return data.ok === true;
  } catch {
    return false;
  }
}
