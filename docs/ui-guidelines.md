# GenDA UI & Agent Prompt Guidelines (Neo-Industrial Ledger - DD-10)

Tài liệu này là **nguồn chân lý và bản hợp đồng bất biến** dành cho tất cả AI Agents và Developers khi xây dựng hoặc cập nhật bất kỳ giao diện, component hay style nào trong dự án GenDA.

Phong cách chính thức của dự án là: **Neo-Industrial Ledger (Teenage Engineering Metaphor)** — kết hợp giữa độ chính xác cơ khí, độ tin cậy của sổ cái tài chính và phần cứng tactile công nghệ cao.

---

## 1. Triết lý Thiết kế Cốt lõi (Core Metaphor)

1. **The Trust Machine (Cỗ máy Giao kèo Niềm tin)**:
   - Thay vì là một "web app SaaS thông thường", GenDA được thiết kế như một **công cụ phần cứng cơ khí kỹ thuật cao**.
   - Mỗi dự án là một **Module Bay** (khoang gắn linh kiện), mỗi mốc nghiệm thu là một **Phân đoạn cơ khí** (Segmented Milestone).
   - Minh bạch tuyệt đối: sử dụng số liệu Monospace, đường thước đo (Ruler Gridlines), mã hash định danh linh kiện (`BAY-01 // ACTIVE`).

2. **Dứt khoát, Cơ học & Xúc giác (Tactile Hardware)**:
   - **Góc vuông cơ khí dứt khoát**: `--radius-sm: 2px`, `--radius-md: 4px`, `--radius-lg: 0px` (thẻ module bay hoàn toàn vuông vức 0px sắc lẹm).
   - **Đường viền cơ khí**: Đường viền dày 2px rõ ràng (`border: 2px solid var(--machinery-border)`).
   - **Bóng cứng xúc giác (Hard Drop Shadows)**: Không dùng bóng mờ nhòe lan tỏa của SaaS thông thường. Sử dụng bóng đổ cơ học dứt khoát:
     `box-shadow: 4px 4px 0px var(--machinery-shadow);`
   - **Phản hồi nút bấm cơ học**: Nút khi bấm hoặc hover sẽ lún xuống như một phím switch cơ khí thực thụ (`transform: translate(2px, 2px)`).

3. **Màu nhấn Công nghiệp (Hardware Accent)**:
   - Điểm nhấn độc bản duy nhất: **Safety Orange / International Orange (`#F97316`)** — lấy cảm hứng từ nút xoay và chi tiết cơ khí của Teenage Engineering.
   - Các màu khác: Chỉ dùng trong trạng thái dữ liệu (Xanh lục cho nghiệm thu, Đỏ cho từ chối, Hổ phách cho lưu ý).

4. **Hỗ trợ Song song Light Mode & Dark Mode**:
   - Hệ thống hỗ trợ 100% cả 2 chế độ, chuyển đổi tức thì thông qua class `.dark` trên thẻ `<html>` và CSS Variables.

---

## 2. Hệ thống Tokens cho Light Mode & Dark Mode

| Token Semantic | Light Mode (Matte Off-White) | Dark Mode (Anodized Carbon) | Vai trò |
| :--- | :--- | :--- | :--- |
| `--color-surface-page` | `#FAFAFA` (xám ghi sáng) | `#09090B` (đen carbon sâu) | Nền canvas chính |
| `--color-surface-subtle` | `#F4F4F5` | `#121215` | Nền khoang phụ / band |
| `--color-surface-card` | `#FFFFFF` | `#18181B` | Nền Module Bay |
| `--machinery-border` | `#18181B` (đen đanh thép) | `#3F3F46` (viền nhôm phay xước) | Viền cơ khí 2px |
| `--machinery-shadow` | `#18181B` | `#000000` | Bóng cứng cơ khí |
| `--color-action-primary` | `#F97316` (Safety Orange) | `#F97316` (Safety Orange) | Màu công tắc / CTA chính |
| `--color-action-primary-hover` | `#EA580C` | `#FB923C` | Hover công tắc |
| `--color-text-heading` | `#09090B` | `#F4F4F5` | Tiêu đề in hoa cơ khí |
| `--color-text-body` | `#52525B` | `#A1A1AA` | Văn bản nội dung |
| `--color-text-muted` | `#71717A` | `#71717A` | Thông số kỹ thuật / ID |

---

## 3. Quy chuẩn Typography & Component Contracts

### 3.1. Cặp Font (Typography Pairing)
- **Văn bản & Tiêu đề:** `Be Vietnam Pro` (chữ in hoa đậm đà cho tiêu đề, phân cấp dứt khoát).
- **Thông số kỹ thuật, tiền tệ, trạng thái:** Phông Monospace (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`).

### 3.2. Module Bay (Thẻ cơ khí - Thay thế Card thông thường)
```tsx
<article className="module-bay stack stack--sm">
  <div className="module-bay__header">
    <span className="module-bay__id">BAY-01 // ACTIVE</span>
    <span>EST. 2026</span>
  </div>
  <h2 className="module-bay__title">{project.title}</h2>
  <div className="cluster cluster--between">
    <span className="module-bay__money">{formatVnd(project.budget)}</span>
    <span className="module-bay__tag">3 PHÂN ĐOẠN (MỐC)</span>
  </div>
  <ul className="pill-list">
    <li className="tech-tag tech-tag--active">[x] Figma</li>
    <li className="tech-tag">[ ] React</li>
  </ul>
</article>
```

### 3.3. Tactile Hardware Buttons (Nút bấm cơ khí)
```tsx
// Nút màu Safety Orange (Hành động chính)
<Link href="/projects" className="btn--tactile-orange">
  Nhận dự án
</Link>

// Nút màu Kim loại / Zinc (Hành động phụ)
<Link href="/sme/projects/new" className="btn--tactile-zinc">
  Đăng bài toán
</Link>
```

---

## 4. Prompt Template dành cho AI Agents khi tạo Màn hình mới

Mỗi khi yêu cầu một AI Agent tạo hoặc sửa màn hình, **phải đính kèm chỉ dẫn bắt buộc sau**:

```markdown
[ROLE & UI DIRECTIVE: NEO-INDUSTRIAL LEDGER (DD-10)]
Bạn là Frontend Engineer tuân thủ nghiêm ngặt Design System Neo-Industrial Ledger của GenDA (quy định tại docs/ui-guidelines.md và DD-10).

Yêu cầu bất biến:
1. Thẩm mỹ: Cỗ máy cơ khí chính xác (Teenage Engineering Metaphor). Góc vuông sắc dứt khoát, viền 2px (#18181B trong light mode, #3F3F46 trong dark mode), đổ bóng cứng xúc giác (box-shadow: 4px 4px 0px ...).
2. Màu nhấn duy nhất: Safety Orange (#F97316) cho CTA chính và điểm nhấn kỹ thuật.
3. Typography: Dùng Be Vietnam Pro cho tiêu đề in hoa dứt khoát; bắt buộc dùng Monospace cho số tiền, mã ID (BAY-01), hạn chót, trạng thái kỹ thuật ([x], [ ]).
4. Hỗ trợ 100% Light Mode và Dark Mode qua các biến CSS (--color-surface-page, --machinery-border, --color-text-heading).
5. TUYỆT ĐỐI CẤM: Nút viên thuốc tròn 9999px, bóng đổ mờ nhòe kiểu SaaS đại trà, font viết tay, nền kem cũ.
```

---

## 5. Checklist Tự Kiểm Tra (Self-Audit Checklist)

- [ ] 1. Giao diện có đúng vibe Neo-Industrial Ledger (thước đo, mã linh kiện, góc vuông, tactile button) không?
- [ ] 2. Kiểm tra giao diện hiển thị hoàn hảo ở cả **Light Mode** và **Dark Mode**?
- [ ] 3. Số tiền và các mã linh kiện có hiển thị bằng font Monospace dạng bảng không?
- [ ] 4. Nút bấm có hiệu ứng lún cơ học `translate(2px, 2px)` không?
- [ ] 5. Chạy `npm run typecheck` và `npm run build` pass 100% không có lỗi?
