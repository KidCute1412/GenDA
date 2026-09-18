"use client";

import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Check, ICON_WEIGHT, LinkSimple } from "../../../components/ui/icons";

/**
 * "Sao chép liên kết hồ sơ" (FR-CERT-05) — để sinh viên dán thẳng vào CV.
 *
 * Phản hồi hiển thị ngay trên chính cái nút vừa bấm, không bắn toast ở góc màn
 * hình: người dùng đang nhìn vào nút, phản hồi nên xuất hiện đúng chỗ họ nhìn.
 * Nhãn nút đổi theo trạng thái nên trình đọc màn hình cũng nhận được thay đổi.
 */
export function ShareLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  // Trả nhãn về trạng thái ban đầu, và dọn timer nếu component bị gỡ giữa chừng
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    const url = `${window.location.origin}/portfolio/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Trình duyệt chặn quyền ghi clipboard (thường do trang chưa chạy HTTPS).
      // Chọn sẵn đường dẫn để người dùng tự nhấn Ctrl+C, thay vì báo lỗi suông.
      window.prompt("Sao chép liên kết hồ sơ của bạn:", url);
    }
  }

  return (
    <Button variant="outline" onClick={copy}>
      {copied ? (
        <Check weight={ICON_WEIGHT} aria-hidden="true" />
      ) : (
        <LinkSimple weight={ICON_WEIGHT} aria-hidden="true" />
      )}
      {copied ? "Đã sao chép liên kết" : "Sao chép liên kết hồ sơ"}
    </Button>
  );
}
