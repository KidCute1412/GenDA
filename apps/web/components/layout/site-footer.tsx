import Link from "next/link";
import { BrandMark } from "../ui/icons";

/**
 * Fat Footer (docs/design.md Mục 6, nhóm pattern 1).
 *
 * Với một sàn kết nối giao dịch có yếu tố tiền bạc, footer không phải chỗ chứa
 * liên kết thừa: quy chế sàn, chính sách bảo mật và quy trình khiếu nại là các
 * cam kết pháp lý người dùng cần tìm được ngay. Đặt chúng ở đây cũng là một
 * phần của nguyên tắc Trust-First.
 */
const COLUMNS = [
  {
    title: "Quy định & pháp lý",
    links: [
      { href: "/phap-ly/quy-che-san", label: "Quy chế hoạt động sàn" },
      { href: "/phap-ly/bao-mat", label: "Chính sách bảo mật" },
      { href: "/phap-ly/khieu-nai", label: "Quy trình khiếu nại" }
    ]
  },
  {
    title: "Dành cho bạn",
    links: [
      { href: "/projects", label: "Dự án đang tuyển" },
      { href: "/register", label: "Tạo tài khoản" },
      { href: "/admin", label: "Bảng quản trị (Ops)" },
      { href: "/ho-tro/cau-hoi-thuong-gap", label: "Câu hỏi thường gặp" }
    ]
  }
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="stack stack--sm">
            <Link href="/" className="brand">
              <BrandMark />
              GenDA
            </Link>
            <p className="text-muted" style={{ maxWidth: "38ch" }}>
              Nền tảng kết nối sinh viên TP.HCM với doanh nghiệp nhỏ và vừa qua các mini-project ngắn
              hạn, có mốc bàn giao rõ ràng và portfolio được xác thực.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-labelledby={`footer-${column.title}`}>
              <h2 id={`footer-${column.title}`}>{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <hr className="rule" style={{ marginBlock: "var(--space-8)" }} />

        <p className="text-caption">
          Bản quyền thuộc về Đội thi from L to E - Cuộc thi GenD Arena 2026. Phiên bản MVP: cơ chế ký quỹ
          được ghi nhận mô phỏng, thanh toán thực tế diễn ra ngoài nền tảng.
        </p>
      </div>
    </footer>
  );
}
