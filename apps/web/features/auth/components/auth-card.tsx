"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AuthMode = "login" | "register";

const AuthModeContext = createContext<AuthMode>("login");

export const useAuthMode = () => useContext(AuthModeContext);

/**
 * Khung đăng nhập / đăng ký. Giữ chế độ hiện tại ở phía client để chuyển cảnh (hai cột
 * trượt đổi chỗ + cảnh minh họa morph) chạy NGAY khi bấm link, không phải chờ server
 * trả trang mới. Khi trang mới về, `initialMode` từ URL là nguồn sự thật và ghi đè lại.
 */
export function AuthCard({ initialMode, children }: { initialMode: AuthMode; children: ReactNode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [syncedMode, setSyncedMode] = useState<AuthMode>(initialMode);
  if (syncedMode !== initialMode) {
    setSyncedMode(initialMode);
    setMode(initialMode);
  }

  // Nghe ở cấp document (pha capture) để bắt cả link ngoài khung, ví dụ nút "Tham gia"
  // trên header, trước khi Next.js xử lý điều hướng.
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== "/login") return;
      setMode(url.searchParams.get("mode") === "register" ? "register" : "login");
    }
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return (
    <AuthModeContext.Provider value={mode}>
      <div
        className="module-bay module-bay--static auth-card"
        data-mode={mode}
        style={{ padding: 0, overflow: "hidden", boxShadow: "4px 4px 0px var(--machinery-shadow)" }}
      >
        {children}
      </div>
    </AuthModeContext.Provider>
  );
}
