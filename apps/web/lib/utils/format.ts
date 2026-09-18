/**
 * Định dạng hiển thị dùng chung.
 *
 * Tất cả đều tự cài đặt thay vì gọi `Intl`, vì hai lý do: (1) kết quả phải
 * giống hệt nhau giữa lần render trên máy chủ và trên trình duyệt, nếu không
 * React sẽ báo lệch hydration; (2) `Intl` phụ thuộc dữ liệu vùng miền của môi
 * trường chạy, mà máy chủ triển khai thường chỉ có `en-US`.
 */

/** `2500000` -> `"2.500.000 đ"` (dấu chấm ngăn hàng nghìn theo quy ước VN). */
export function formatVnd(amount: number): string {
  return `${groupThousands(Math.round(amount))} đ`;
}

/** `2500000` -> `"2.500.000"` — dùng khi đơn vị tiền đã nằm ở nhãn cột. */
export function groupThousands(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** `2500000` -> `"2,5 triệu"` — dạng rút gọn cho nhãn bộ lọc. */
export function formatMillions(amount: number): string {
  const millions = amount / 1_000_000;
  const text = Number.isInteger(millions) ? String(millions) : millions.toFixed(1).replace(".", ",");
  return `${text} triệu`;
}

/** `"2026-10-28"` -> `"28/10/2026"`. */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

/** `"2026-10-28"` -> `"28/10"` — dạng ngắn cho dòng thời gian trong thẻ. */
export function formatDayMonth(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
}

/**
 * Số ngày còn lại tới mốc `iso`, tính theo ngày lịch.
 *
 * `today` là tham số bắt buộc chứ không lấy `new Date()` bên trong: hàm phải
 * thuần túy để máy chủ và trình duyệt cho ra cùng một kết quả. Ở bản MVP dùng
 * dữ liệu mẫu, `today` đến từ hằng số `TODAY` trong `mocks/data.ts`.
 */
export function daysUntil(iso: string, today: string): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const target = Date.parse(`${iso}T00:00:00Z`);
  const from = Date.parse(`${today}T00:00:00Z`);
  return Math.round((target - from) / MS_PER_DAY);
}

/**
 * Điểm phù hợp kỹ năng (FR-MAT-02).
 *
 * Luôn trả về CẢ tỷ lệ phần trăm lẫn phần "trùng mấy trên mấy". Giao diện bắt
 * buộc hiển thị cả hai: đưa ra một con số trần rồi bắt sinh viên tin là đi
 * ngược nguyên tắc Trust-First.
 */
export function matchScore(projectSkills: string[], studentSkills: string[]) {
  const owned = new Set(studentSkills);
  const matched = projectSkills.filter((skill) => owned.has(skill));
  const total = projectSkills.length;

  return {
    matched,
    matchedCount: matched.length,
    total,
    percent: total === 0 ? 0 : Math.round((matched.length / total) * 100)
  };
}
