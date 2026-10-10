/**
 * Hình minh họa riêng — đòn bẩy làm ấm số 4 của docs/design.md 4.9.1.
 *
 * Tất cả dựng từ MỘT mô-típ duy nhất: khối nghiêng của logo GenDA, lặp lại ở
 * các kích thước và góc khác nhau. Vì dựng từ nhận diện riêng nên không đụng
 * hàng bộ hình stock nào; vì tô bằng token màu nên đổi thương hiệu là hình đổi
 * theo. Tất cả đều `aria-hidden` vì thuần trang trí.
 *
 * Đây KHÔNG phải minh họa người kiểu 3D bong bóng, cũng không phải gradient
 * nhiều màu — cả hai đều nằm trong danh sách cấm ở cuối Mục 4.9.1.
 */

type SpotProps = {
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Hai khối nghiêng nghiêng vào nhau: bên trái teal (quá trình), bên phải xanh
 * lá (thành quả). Chính là câu chuyện "From Learn to Earn" ở dạng hình khối.
 */
export function SpotHandshake({ className, style }: SpotProps) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 240 200"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="8" y="150" width="224" height="6" rx="3" fill="var(--color-border-subtle)" />
      {/* Cung "Learn" */}
      <path d="M30 150 L78 40 L104 40 L62 150 Z" fill="var(--color-brand-decorative)" />
      <path d="M62 150 L104 40 L118 40 L80 150 Z" fill="var(--color-action-primary)" opacity="0.55" />
      {/* Cầu nối: lớp niềm tin nằm giữa hai bên */}
      <rect x="86" y="92" width="68" height="14" rx="7" fill="var(--color-text-muted)" opacity="0.28" />
      {/* Cầu "Earn" */}
      <path d="M136 40 L178 150 L152 150 L122 40 Z" fill="var(--color-status-verified)" opacity="0.5" />
      <path d="M160 40 L210 150 L184 150 L142 40 Z" fill="var(--color-status-verified)" />
    </svg>
  );
}

/** Khối rỗng chỉ còn đường viền: chưa có gì ở đây, nhưng chỗ đã sẵn sàng. */
export function SpotEmpty({ className, style }: SpotProps) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 200 160"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="10" y="126" width="180" height="5" rx="2.5" fill="var(--color-border-subtle)" />
      <path
        d="M52 126 L92 30 L116 30 L78 126 Z"
        stroke="var(--color-border-input)"
        strokeWidth="3"
        strokeDasharray="9 7"
        fill="none"
      />
      <path
        d="M104 126 L144 30 L168 30 L130 126 Z"
        stroke="var(--color-border-input)"
        strokeWidth="3"
        strokeDasharray="9 7"
        fill="none"
        opacity="0.55"
      />
    </svg>
  );
}

/** Khối nghiêng bị gãy nhịp: có gì đó hỏng, nhưng hỏng ở phía chúng tôi. */
export function SpotError({ className, style }: SpotProps) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 200 160"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="10" y="126" width="180" height="5" rx="2.5" fill="var(--color-border-subtle)" />
      <path d="M48 126 L88 30 L112 30 L74 126 Z" fill="var(--color-border-subtle)" />
      {/* Khối lệch trục so với khối bên cạnh — nhịp bị gãy */}
      <path
        d="M118 126 L150 46 L174 52 L142 126 Z"
        fill="var(--color-status-danger)"
        opacity="0.75"
        transform="rotate(8 146 86)"
      />
    </svg>
  );
}
