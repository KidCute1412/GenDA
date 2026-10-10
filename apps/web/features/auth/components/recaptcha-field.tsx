"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Bước chống người máy cho đăng nhập / đăng ký, chạy theo loại khóa đã cấu hình:
 *
 * - `v3` (mặc định khi có NEXT_PUBLIC_RECAPTCHA_SITE_KEY): chấm điểm ngầm, không có ô tích. Component tự lấy
 *   token khi sẵn sàng và lấy lại trước khi token hết hạn (2 phút), nên biểu mẫu vẫn chỉ cần "đã có token".
 *   Huy hiệu nổi của Google được ẩn và thay bằng dòng thông báo bắt buộc ngay trong biểu mẫu.
 * - `v2` ô "Tôi không phải người máy": chỉ dùng khi chạy dev chưa cấu hình khóa, với khóa THỬ NGHIỆM chính thức
 *   của Google (Google không có khóa thử nghiệm cho v3). Có thể ép bằng NEXT_PUBLIC_RECAPTCHA_VERSION=v2 nếu dự
 *   án chuyển sang khóa v2 thật.
 *
 * Dựng ô v2 bằng khóa v3 (hoặc ngược lại) làm Google báo "Loại khóa không hợp lệ". Token chỉ có giá trị khi được
 * kiểm tra phía server (/api/recaptcha/verify) bằng khóa bí mật. Muốn lấy token mới thì đổi `key` của component.
 */
/**
 * Tạm tắt theo quyết định của nhóm: đăng nhập và đăng ký không hỏi reCAPTCHA cho tới khi bật lại bằng
 * NEXT_PUBLIC_RECAPTCHA_ENABLED=true (cần site key đúng loại và RECAPTCHA_SECRET_KEY ở production).
 */
export const RECAPTCHA_ENABLED = process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED === "true";

const GOOGLE_TEST_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
const TOKEN_REFRESH_MS = 100_000;

export const RECAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
  (process.env.NODE_ENV !== "production" ? GOOGLE_TEST_SITE_KEY : "");

export const RECAPTCHA_VERSION: "v2" | "v3" =
  process.env.NEXT_PUBLIC_RECAPTCHA_VERSION === "v2" || RECAPTCHA_SITE_KEY === GOOGLE_TEST_SITE_KEY ? "v2" : "v3";

type Grecaptcha = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
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

/** Nạp script reCAPTCHA đúng một lần cho cả trang, theo đúng phiên bản của khóa. */
function loadRecaptcha(): Promise<Grecaptcha> {
  if (window.grecaptcha?.ready && (RECAPTCHA_VERSION === "v3" ? window.grecaptcha.execute : window.grecaptcha.render)) {
    return Promise.resolve(window.grecaptcha);
  }
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    window.__gendaRecaptchaLoaded = () => {
      if (window.grecaptcha) resolve(window.grecaptcha);
      else reject(new Error("reCAPTCHA không khởi tạo được"));
    };
    const script = document.createElement("script");
    script.src = RECAPTCHA_VERSION === "v3"
      ? `https://www.google.com/recaptcha/api.js?onload=__gendaRecaptchaLoaded&render=${encodeURIComponent(RECAPTCHA_SITE_KEY)}&hl=vi`
      : "https://www.google.com/recaptcha/api.js?onload=__gendaRecaptchaLoaded&render=explicit&hl=vi";
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

export function RecaptchaField({ onChange, action = "submit" }: { onChange: (token: string | null) => void; action?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [status, setStatus] = useState<"loading" | "ready" | "error">(RECAPTCHA_SITE_KEY ? "loading" : "error");

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY || !containerRef.current) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const container = containerRef.current;

    loadRecaptcha()
      .then((grecaptcha) => {
        grecaptcha.ready(() => {
          if (cancelled) return;
          if (RECAPTCHA_VERSION === "v3") {
            const refresh = () => {
              grecaptcha.execute(RECAPTCHA_SITE_KEY, { action })
                .then((token) => {
                  if (cancelled) return;
                  onChangeRef.current(token);
                  setStatus("ready");
                  timer = setTimeout(refresh, TOKEN_REFRESH_MS);
                })
                .catch(() => {
                  if (!cancelled) setStatus("error");
                });
            };
            refresh();
            return;
          }
          if (container.childElementCount > 0) return;
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
      if (timer) clearTimeout(timer);
      onChangeRef.current(null);
    };
  }, [action]);

  return (
    <div>
      {RECAPTCHA_VERSION === "v2" ? <div ref={containerRef} style={{ minHeight: status === "error" ? 0 : "78px" }} /> : <div ref={containerRef} hidden />}
      {status === "loading" ? (
        <p className="text-muted" style={{ margin: 0, fontSize: "11px" }}>Đang tải bước xác minh chống người máy…</p>
      ) : null}
      {RECAPTCHA_VERSION === "v3" && status !== "error" ? (
        // Google cho phép ẩn huy hiệu nổi khi biểu mẫu ghi rõ dòng này.
        <p className="text-muted" style={{ margin: 0, fontSize: "11px" }}>
          Trang này được bảo vệ bởi reCAPTCHA. Áp dụng{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Chính sách quyền riêng tư</a> và{" "}
          <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">Điều khoản dịch vụ</a> của Google.
        </p>
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
export async function verifyRecaptcha(token: string, action = "submit"): Promise<boolean> {
  try {
    const response = await fetch("/api/recaptcha/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action })
    });
    if (!response.ok) return false;
    const data = (await response.json()) as { ok?: boolean };
    return data.ok === true;
  } catch {
    return false;
  }
}
