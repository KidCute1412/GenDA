import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GenDA",
  description: "From Learn to Earn"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}

