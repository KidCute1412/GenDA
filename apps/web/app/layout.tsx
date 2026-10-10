import "./globals.css";
import "./components.css";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Inter } from "next/font/google";

/**
 * Hai họ phông, hai vai trò khác nhau (docs/design.md 4.7.2):
 * tiêu đề cỡ lớn cần BẢN SẮC, nội dung cỡ nhỏ cần ĐỘ DỄ ĐỌC.
 *
 * Ba biện pháp bắt buộc để bù chi phí băng thông — 85% sinh viên vào bằng
 * smartphone, có thể đang dùng 3G/4G:
 *  1. Chỉ tải các trọng lượng thực sự dùng, không tải cả họ phông.
 *  2. Chỉ nhúng subset `latin` + `vietnamese`, bỏ Cyrillic/Greek.
 *  3. Tự host qua next/font để phông đi cùng domain và có `size-adjust`
 *     khử giật bố cục khi đổi phông (cam kết chống CLS ở Mục 8.1).
 */
/**
 * IBM Plex Sans thay cho Be Vietnam Pro ở vai trò tiêu đề.
 *
 * Lý do đổi: Be Vietnam Pro dựng dấu tiếng Việt rất tốt, nhưng dáng chữ là
 * geometric sans — cùng họ hình với Poppins/Montserrat, tức là đúng kiểu chữ mà
 * mọi trang do máy sinh đều dùng. Ở trọng lượng 700 cỡ lớn, nó đọc ra "mẫu có
 * sẵn" chứ không ra "sản phẩm có người thiết kế".
 *
 * IBM Plex Sans là chữ của một hãng kỹ thuật, dáng hơi vuông, có đặc điểm riêng
 * nhận ra được, và mang sắc thái nghiêm túc đúng với một nền tảng nói chuyện
 * tiền bạc và cam kết. Bộ ký tự Vietnamese là bản chính thức của IBM, không
 * phải bản chắp vá.
 */
const plexSans = IBM_Plex_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  variable: "--font-heading-family",
  display: "swap"
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
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
  initialScale: 1
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
    <html lang="vi" className={`${plexSans.variable} ${inter.variable}`}>
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
