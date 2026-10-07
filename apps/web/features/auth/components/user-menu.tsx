"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretDown, FileText, ICON_WEIGHT, IdentificationCard, UserCircle } from "../../../components/ui/icons";
import type { AuthSession } from "../services/auth-api";

/**
 * Menu tài khoản ở góc phải header: một nút biểu tượng người dùng, bấm vào mở danh sách
 * lối tắt theo vai trò (sinh viên: CV + Hồ sơ; doanh nghiệp: Hồ sơ doanh nghiệp;
 * admin: Trang quản trị).
 *
 * Theo mẫu "menu button" của WAI-ARIA: aria-haspopup / aria-expanded trên nút, danh sách
 * role="menu"; mở xong tự đưa tiêu điểm vào mục đầu, phím mũi tên di chuyển giữa các mục,
 * Esc hoặc bấm ra ngoài thì đóng và trả tiêu điểm về nút.
 */
type MenuItem = { href: string; label: string; icon: typeof UserCircle };

function itemsFor(role: AuthSession["role"]): MenuItem[] {
  if (role === "SME") return [{ href: "/sme/profile", label: "Hồ sơ doanh nghiệp", icon: IdentificationCard }];
  if (role === "ADMIN") return [{ href: "/admin", label: "Trang quản trị", icon: IdentificationCard }];
  return [
    { href: "/student/cv", label: "CV của tôi", icon: FileText },
    { href: "/student/profile", label: "Hồ sơ", icon: IdentificationCard }
  ];
}

export function UserMenu({ session }: { session: AuthSession }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const pathname = usePathname();
  const items = itemsFor(session.role);

  // Đổi trang thì đóng menu
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    rootRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();

    function handlePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const links = Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
      const index = links.indexOf(document.activeElement as HTMLElement);
      const next = event.key === "ArrowDown" ? (index + 1) % links.length : (index - 1 + links.length) % links.length;
      links[next]?.focus();
      event.preventDefault();
    }
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="user-menu" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="icon-btn user-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Tài khoản: ${session.name}`}
        title={session.name}
        onClick={() => setOpen((value) => !value)}
      >
        <UserCircle weight={ICON_WEIGHT} aria-hidden="true" />
        <CaretDown weight={ICON_WEIGHT} aria-hidden="true" className="user-menu__caret" />
      </button>

      {open ? (
        <div className="user-menu__panel" id={menuId} role="menu" aria-label="Tài khoản">
          <p className="user-menu__name" aria-hidden="true">{session.name}</p>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                className="user-menu__item"
                aria-current={pathname === item.href ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <Icon weight={ICON_WEIGHT} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
