import "./globals.css";
import "./components.css";
import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { AssistantHost } from "../features/assistant/components/assistant-host";
import { AuthSessionProvider } from "../features/auth/components/auth-session-provider";

/**
 * Phông chữ duy nhất: Be Vietnam Pro (Clean Modern SaaS - DD-09).
 * Dựng dấu tiếng Việt chuẩn xác, hình học sắc sảo, tối ưu hiển thị trên màn hình số.
 */
const sans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-family",
  display: "swap"
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff"
};

export const metadata: Metadata = {
  title: {
    default: "GenDA - From Learn to Earn",
    template: "%s | GenDA"
  },
  description:
    "Nền tảng kết nối sinh viên TP.HCM với doanh nghiệp nhỏ và vừa qua các mini-project 1-5 triệu đồng, có mốc bàn giao rõ ràng và ứng tuyển bằng CV.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" }
    ]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={sans.variable}>
      <body>
        <a href="#main-content" className="skip-link">
          Bỏ qua tới nội dung chính
        </a>
        <AuthSessionProvider>
        {children}
        {/* Trợ lý Gen: chỉ hiện với phiên sinh viên, đứng ngoài từng trang để theo sinh viên qua mọi màn hình */}
        <AssistantHost />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
