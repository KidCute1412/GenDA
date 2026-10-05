"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";

/**
 * Chuyển cảnh "lướt" khi vào trang /projects (theo nhịp cảnh chuyển trong game): các dải
 * màu lớn quét chéo qua màn hình như vệt gió, confetti bung ra, rồi nội dung trang lướt
 * vào từ bên phải (phần lướt của nội dung nằm ở CSS .projects-page trong components.css).
 *
 * Chỉ chạy một lần khi vừa vào /projects (gắn từ layout của /projects), tự gỡ khỏi trang
 * sau khi xong để không còn lớp phủ cố định nào. Trang chi tiết /projects/[id] không chạy.
 * Thuần trang trí: aria-hidden, không nhận chuột; chế độ giảm chuyển động thì không hiện.
 */
const RIBBONS = [
  { d: "M1900 260C1400 80 900 620 -300 340", color: "var(--orange-500)", width: 190 },
  { d: "M1900 520C1300 760 700 220 -300 600", color: "#18181b", width: 120 },
  { d: "M1900 760C1350 560 800 1020 -300 820", color: "#fdba74", width: 150 },
  { d: "M1900 90C1500 260 700 -60 -300 140", color: "#c2410c", width: 90 },
  { d: "M1900 420C1450 300 650 700 -300 460", color: "#ffffff", width: 60 },
  { d: "M1900 640C1500 760 900 420 -300 720", color: "var(--orange-500)", width: 70 },
  { d: "M1900 340C1300 480 900 140 -300 260", color: "#3f3f46", width: 28 }
];

const CONFETTI = [
  [-38, -26, 300, "var(--orange-500)"], [-30, 18, -240, "#18181b"], [-18, -34, 200, "#fdba74"], [-8, 30, -320, "var(--orange-500)"],
  [6, -36, 260, "#18181b"], [16, 24, -200, "#c2410c"], [26, -20, 340, "#fdba74"], [36, 12, -280, "var(--orange-500)"],
  [42, -32, 220, "#3f3f46"], [-44, 4, -260, "#c2410c"], [-24, 36, 300, "#fdba74"], [22, -40, -220, "var(--orange-500)"],
  [32, 34, 260, "#18181b"], [-12, -14, 200, "#fdba74"], [12, 16, -300, "var(--orange-500)"], [-36, -8, 240, "#3f3f46"],
  [44, -6, -240, "#fdba74"], [-2, 40, 280, "#c2410c"]
] as const;

const DURATION_MS = 1500;

export function ProjectsSwoosh() {
  const pathname = usePathname();
  const [active, setActive] = useState(pathname === "/projects");

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => setActive(false), DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [active]);

  if (!active) return null;

  return (
    <div className="projects-swoosh" aria-hidden="true">
      <svg className="projects-swoosh__ribbons" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" fill="none">
        {RIBBONS.map((ribbon, index) => (
          <path
            key={ribbon.d}
            d={ribbon.d}
            pathLength={1}
            style={{ stroke: ribbon.color, strokeWidth: ribbon.width, "--r": index } as CSSProperties}
          />
        ))}
      </svg>
      <div className="projects-swoosh__burst">
        {CONFETTI.map(([x, y, rotate, color], index) => (
          <span
            key={index}
            style={{ "--tx": `${x}vw`, "--ty": `${y}vh`, "--rot": `${rotate}deg`, "--c": color, "--k": index } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
