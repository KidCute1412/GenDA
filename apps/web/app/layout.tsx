import "./globals.css";
import "./components.css";
import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Playpen_Sans } from "next/font/google";

/**
 * Hai họ phông, hai vai trò tách bạch (docs/design.md 4.7.2).
 *
 * Be Vietnam Pro — toàn bộ giao diện.
 * Đây là chỗ ĐẢO NGƯỢC một quyết định cũ. Bản trước loại phông này với lý do:
 * "geometric sans, cùng họ hình với Poppins/Montserrat, nên đọc ra mẫu có sẵn".
 * Lý do đó gắn chặt với một đích đến khác — khi ấy sản phẩm nhắm tới vẻ công cụ
 * kỹ thuật nghiêm túc, và geometric sans kéo ngược lại. Phong cách mới nhắm tới
 * vẻ ẤM và DỄ GẦN, và geometric sans chính là dáng chữ của vẻ đó. Cùng một
 * phông, cùng một đặc điểm, nhưng đổi đích đến thì từ điểm trừ thành điểm cộng.
 * Thêm nữa nó dựng dấu tiếng Việt nguyên bản, không phải bản chắp vá.
 *
 * Playpen Sans — giọng viết tay, dùng RẤT tiết chế.
 * Chỉ cho nhãn phụ phía trên tiêu đề, từ nhấn được khoanh tròn, và dòng ghi
 * công dưới trích dẫn. Không bao giờ cho nội dung, nhãn trường hay chữ trong
 * nút — ràng buộc đầy đủ ở design.md 4.7.2.
 *
 * Vì sao không phải đúng phông trong ảnh tham chiếu: Poppins và Outfit (gần
 * nhất về dáng) cùng Caveat (phông viết tay phổ biến nhất) đều KHÔNG có subset
 * `vietnamese`. Với một giao diện toàn tiếng Việt thì đó là điều kiện loại,
 * không phải điểm trừ có thể bỏ qua.
 *
 * Ba biện pháp bắt buộc để bù chi phí băng thông — 85% sinh viên vào bằng
 * smartphone, có thể đang dùng 3G/4G:
 *  1. Chỉ tải các trọng lượng thực sự dùng, không tải cả họ phông. Riêng phông
 *     viết tay chỉ lấy MỘT trọng lượng vì nó chỉ xuất hiện ở vài dòng.
 *  2. Chỉ nhúng subset `latin` + `vietnamese`, bỏ Cyrillic/Greek.
 *  3. Tự host qua next/font để phông đi cùng domain và có `size-adjust`
 *     khử giật bố cục khi đổi phông (cam kết chống CLS ở Mục 8.1).
 */
const sans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-family",
  display: "swap"
});

const hand = Playpen_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["600"],
  variable: "--font-hand-family",
  display: "swap"
});

/**
 * Khai báo tường minh thay vì dựa vào mặc định của framework, để một điều quan
 * trọng được ghi rõ ra: KHÔNG khóa phóng to. Không đặt `maximumScale` hay
 * `userScalable: false` — người dùng thị lực kém phải phóng to được trang, và
 * chặn phóng to là một trong những lỗi tiếp cận bị vi phạm nhiều nhất trên web
 * di động.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  /* Màu thanh trạng thái khớp với nền kem của khối mở đầu, vì đó là thứ nằm
     ngay dưới mép trên màn hình trên mọi trang. */
  themeColor: "#fdf3ec"
};

export const metadata: Metadata = {
  title: {
    default: "GenDA - From Learn to Earn",
    template: "%s | GenDA"
  },
  description:
    "Nền tảng kết nối sinh viên TP.HCM với doanh nghiệp nhỏ và vừa qua các mini-project 1-5 triệu đồng, có mốc bàn giao rõ ràng và portfolio được xác thực."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${sans.variable} ${hand.variable}`}>
      <body>
        {/* WCAG 2.4.1 — ẩn cho tới khi nhận tiêu điểm lần đầu */}
        <a href="#main-content" className="skip-link">
          Bỏ qua tới nội dung chính
        </a>

        {children}
      </body>
    </html>
  );
}
