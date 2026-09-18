"use client";

import { useId, useState } from "react";
import { Eye, EyeSlash, ICON_WEIGHT } from "../../../components/ui/icons";

/**
 * Thẻ gạt Ẩn/Hiện từng mục portfolio trên trang công khai (FR-CERT-04).
 *
 * Đây là hiện thực của Quy tắc Vàng số 7 — trao quyền kiểm soát cho người dùng.
 * Sinh viên không sửa được NỘI DUNG mục portfolio (hệ thống sinh ra, khóa lại,
 * đó là thứ làm nó đáng tin), nhưng toàn quyền quyết định có công khai nó không.
 *
 * Trạng thái mã hóa ba lớp: vị trí thẻ gạt + biểu tượng mắt + nhãn chữ.
 */
export function VisibilityToggle({ title, defaultVisible }: { title: string; defaultVisible: boolean }) {
  const id = useId();
  const [visible, setVisible] = useState(defaultVisible);

  return (
    <div className="cluster cluster--between">
      <label className="toggle" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={visible}
          onChange={(event) => setVisible(event.target.checked)}
        />
        <span className="cluster" style={{ gap: "var(--space-1)" }}>
          {visible ? (
            <Eye weight={ICON_WEIGHT} aria-hidden="true" />
          ) : (
            <EyeSlash weight={ICON_WEIGHT} aria-hidden="true" />
          )}
          <span className="text-caption">{visible ? "Đang hiện công khai" : "Đang ẩn"}</span>
        </span>
        {/* Nhãn đọc được nêu rõ mục nào, vì trên trang có nhiều thẻ gạt giống nhau */}
        <span className="visually-hidden">Hiện mục {title} trên hồ sơ công khai</span>
      </label>
    </div>
  );
}
