# Design Tokens & Component Specifications — GenDA

Tài liệu bàn giao thiết kế → mã nguồn (design-to-code handoff). Đây là **hợp đồng triển khai**: đặc tả chính xác từng component phải trông như thế nào ở mọi trạng thái.

| Vai trò tài liệu | Tài liệu |
| :--- | :--- |
| **Tại sao** — cơ sở lý luận, wireframe, nguyên tắc chọn màu, thang chữ | [`design.md`](./design.md) |
| **Bằng giá trị gì** — kiến trúc token 3 lớp, đặc tả component *(tài liệu này)* | `design-tokens.md` |
| **Mã nguồn thật** — biến CSS triển khai | [`../apps/web/app/globals.css`](../apps/web/app/globals.css) |

> **Nguồn chân lý về giá trị màu** là [`design.md` Mục 4.4](./design.md#44-hệ-thống-màu-sắc-nguyên-tắc-chọn-màu--semantic-tokens). Tài liệu này **không lặp lại** bảng màu — chỉ định nghĩa kiến trúc và lớp component. Khi hai tài liệu lệch nhau, `design.md` thắng.

---

## 1. Kiến trúc Token Ba lớp

```text
┌──────────────────────────────────────────────────────────────┐
│  LỚP 3 — COMPONENT     --btn-bg, --card-padding              │
│  Tùy biến riêng từng component. Sửa khi một component         │
│  cần khác biệt, không ảnh hưởng component khác.               │
├──────────────────────────────────────────────────────────────┤
│  LỚP 2 — SEMANTIC      --color-action-primary, --space-card-  │
│  Gán ý nghĩa. Đây là lớp đổi khi làm dark mode / đổi thương   │
│  hiệu. Component CHỈ ĐƯỢC gọi lớp này trở lên.                │
├──────────────────────────────────────────────────────────────┤
│  LỚP 1 — PRIMITIVE     --blue-600, --space-5, --text-base     │
│  Giá trị thô, không mang ý nghĩa. Gần như không bao giờ sửa.  │
└──────────────────────────────────────────────────────────────┘
```

**Quy tắc bất di bất dịch:** component **không bao giờ** gọi trực tiếp lớp primitive hay mã hex.

```css
/* SAI — hex thô, không đổi theme được */
.btn-primary { background: #1b3fd8; }

/* SAI — gọi thẳng primitive, mất tầng ngữ nghĩa */
.btn-primary { background: var(--blue-600); }

/* ĐÚNG */
.btn-primary { background: var(--btn-primary-bg); }
/* với --btn-primary-bg: var(--color-action-primary); */
/* và  --color-action-primary: var(--blue-600);        */
```

**Vì sao đáng công? — nay đã có bằng chứng ba lần, không còn là giả thiết.** Lập luận ban đầu là: nếu nhận diện đổi, chỉ cần sửa lớp primitive + semantic. Điều đó **đã thật sự xảy ra ba lần liên tiếp**:

| Lần | Đổi gì | Phải sửa gì |
| :--- | :--- | :--- |
| 1 | Teal/green/slate nền sáng → neon/cyan/ink **nền tối** ([DD-07](./design.md#quyết-định-thiết-kế-dd-07-chuyển-toàn-sản-phẩm-sang-nền-tối-theo-bảng-màu-nhận-diện-mới)) | Lớp primitive + semantic |
| 2 | Một họ phông → hai họ, thêm giọng **viết tay** | `layout.tsx` + token phông |
| 3 | Nền tối → **kem/navy/coral nền sáng**, bo góc rộng gấp đôi, nút bo tròn lại ([DD-08](./design.md#quyết-định-thiết-kế-dd-08-chuyển-sang-phong-cách-ấm-sáng-thân-thiện)) | `globals.css` + `components.css` viết lại, **giữ nguyên mọi tên class** |

Kết quả cả ba lần: **không một màn hình nào trong tám màn hình phải dựng lại, không một tên class nào bị đổi.** Nếu hex nằm rải rác trong component thì mỗi lần như vậy đã là một đợt viết lại toàn bộ giao diện.

> Lần thứ ba nói thêm một điều mà hai lần đầu chưa nói: lớp component **được phép viết lại hoàn toàn về mặt thị giác** — đổi bo góc, đổi bóng, đổi cấu trúc nền — miễn là giữ nguyên hợp đồng tên class với các trang. Tên class mới là ranh giới thật giữa thiết kế và màn hình, không phải giá trị token.

---

## 2. Lớp Semantic — danh mục đầy đủ

Chi tiết giá trị và số đo tương phản: [`design.md` Mục 4.4.5](./design.md#445-bảng-token-ngữ-nghĩa--số-đo-tương-phản-đã-kiểm-định).

| Nhóm | Token |
| :--- | :--- |
| Hành động | `--color-action-primary`, `--color-action-primary-hover`, `--color-action-link` |
| Thương hiệu phi văn bản | `--color-brand-decorative` |
| Nhấn dạng chữ | `--color-accent-text` (chữ cam cỡ nhỏ), `--color-accent-strong` (nền cam có chữ trắng) |
| Trạng thái xác thực | `--color-status-verified`, `--color-status-verified-text`, `--color-status-verified-bg` |
| Trạng thái lưu ý | `--color-status-warning`, `--color-status-warning-text`, `--color-status-warning-bg` |
| Trạng thái lỗi | `--color-status-danger`, `--color-status-danger-text`, `--color-status-danger-bg` |
| Chữ | `--color-text-heading`, `--color-text-body`, `--color-text-muted`, `--color-text-on-dark`, `--color-text-on-accent`, `--color-text-ghost` |
| Bề mặt | `--color-surface-page` (nền trang), `--color-surface-subtle` (kem), `--color-surface-card` (thẻ trắng) |
| Nền của bốn kiểu khối | `--color-surface-brand`, `--color-surface-brand-strong` (kiểu A, B — kem), `--color-surface-achieve`, `--color-surface-achieve-strong` (kiểu C — xanh nhạt). Hai luật xen kẽ ở [`design.md` Mục 4.9.3](./design.md#493-bốn-kiểu-khối--luật-xen-kẽ) |
| Đường viền | `--color-border-input`, `--color-border-subtle`, `--color-border-focus` |
| Khoảng cách | `--space-field-label`, `--space-field-error`, `--space-field-group`, `--space-card-padding`, `--space-card-gap`, `--space-section` |
| Chữ (vai trò) | `--text-display`, `--text-h1`…`--text-h4`, `--text-body-lg`, `--text-body`, `--text-body-sm`, `--text-caption` |

---

## 3. Đặc tả Component

Mọi component dưới đây **bắt buộc** tuân thủ [`design.md` Mục 4.6](./design.md#46-đặc-tả-tiếp-cận-bàn-phím--trình-đọc-màn-hình-nfr-ux-01) về bàn phím và trình đọc màn hình.

### 3.1. Button

#### Biến thể (Variants)

| Biến thể | Nền | Chữ | Viền | Tương phản chữ/nền | Dùng khi |
| :--- | :--- | :--- | :--- | ---: | :--- |
| `primary` | `--color-action-primary` (navy) | trắng | không | **7.64:1** ✅ | Hành động chính. **Tối đa 1 nút/màn hình** |
| `secondary` | `--color-surface-subtle` | `--color-text-heading` | không | **15.24:1** ✅ | Hành động phụ ("Lưu bản nháp") |
| `outline` | trong suốt | `--color-text-heading` | `--color-border-input` | **19.94:1** ✅ | Hành động cấp ba ("Hủy") |
| `ghost` | trong suốt | `--color-text-body` | không | **16.07:1** ✅ | Hành động chìm trong bảng/thẻ |
| `danger` | `--color-status-danger` | trắng | không | **6.54:1** ✅ | Từ chối, hủy dự án, xóa |

> **Không có biến thể nút màu CORAL.** Coral là màu nhấn của nhận diện nên đây là thứ ai cũng muốn thử. Nó không đạt: `#E85D2C` với chữ trắng chỉ **3.48:1**, dưới ngưỡng 4.5:1. Muốn một khối cam đặc có chữ trắng thì phải xuống `--color-accent-strong` (coral-600, 4.69:1), và khi ấy nó không còn là màu trong bảng nhận diện nữa. Vai trò của coral là **nét vẽ và giọng nói**, không phải nền nút — xem [`design.md` Mục 4.4.2](./design.md#442-bảng-màu-nhận-diện--bốn-vai-trò).

> **Không có biến thể `success` riêng.** Quy tắc này đã sống qua ba bảng màu với ba lý do khác nhau, và lần nào cũng đứng vững. Bản đầu cấm vì xanh lá được giữ khan hiếm cho trạng thái "đã xác thực"; bản nền tối lấy chính xanh lá làm màu thương hiệu nên lý do đó mất chỗ dựa, nhưng kết luận vẫn giữ vì nút `success` khi ấy trông y hệt nút `primary`. Ở bảng màu hiện tại, lý do là thứ ba: hành động là **navy**, còn xanh lá chỉ nói "đã xong". Một nút xanh lá sẽ bảo người dùng bấm vào một thứ vốn là **kết quả**, không phải hành động. Nút "Nghiệm thu mốc này" dùng biến thể `primary`.

#### Kích cỡ (Sizes)

| Size | Cao | Đệm ngang | Cỡ chữ | Icon | Ghi chú |
| :--- | ---: | ---: | :--- | ---: | :--- |
| `sm` | 32px | 16px | `--text-caption` | 16px | Chỉ dùng trên desktop |
| `md` *(mặc định)* | 44px | 24px | `--text-body-sm` | 18px | **44px = ngưỡng GenDA tự đặt**, vượt sàn 24px của WCAG 2.2 AA (2.5.8) — lý do tại [`design.md` 4.6f](./design.md#46-đặc-tả-tiếp-cận-bàn-phím--trình-đọc-màn-hình-nfr-ux-01) |
| `lg` | 52px | 32px | `--text-body` | 20px | CTA trang chủ |

Bo góc: `--radius-full` — nút là **viên thuốc bo tròn hoàn toàn**.

> **Hai lựa chọn có chủ đích.** (1) Chiều cao mặc định là **48px**, vượt hẳn ngưỡng vùng chạm 44px, vì `md` là cỡ dùng trên mobile — nơi 85% sinh viên thao tác. (2) Nút **bo tròn hoàn toàn trở lại**, sau khi bản trước hạ xuống 8px. Đây là lần đảo chiều thứ hai của cùng một quyết định và lý do đầy đủ nằm ở [`design.md` Mục 4.8.2](./design.md#482-bo-góc-border-radius) — tóm tắt: cả hai lập luận đều đúng, chúng chỉ phục vụ hai đích đến khác nhau.
>
> **Hệ quả có lợi:** nút bo tròn còn ô nhập bo 12px, nên **hình dạng góc lại phân biệt được chỗ bấm với chỗ gõ**. Ở bản trước hai thứ cùng bán kính nên việc phân biệt phải dồn hết cho nền đặc và nhãn chữ.

#### Trạng thái (States)

| Trạng thái | Nền | Chữ | Viền ngoài | Con trỏ |
| :--- | :--- | :--- | :--- | :--- |
| `default` | token biến thể | token biến thể | không | `pointer` |
| `hover` | `--color-action-primary-hover` (đậm hơn 1 bậc) + `--shadow-md` | giữ nguyên | không | `pointer` |
| `active` | `--color-action-primary-active`, tắt bóng | giữ nguyên | không | `pointer` |
| `focus-visible` | giữ nguyên `default` | giữ nguyên | **2px `--color-border-focus`, cách 2px** | `pointer` |
| `disabled` | giữ nguyên, `opacity: 0.5` | giữ nguyên | không | `not-allowed` |
| `loading` | giữ nguyên, `opacity: 0.7` | spinner + giữ nhãn | không | `wait` |

Ghi chú triển khai:
- **`hover` và `focus-visible` là hai trạng thái độc lập**, không gộp. Người dùng bàn phím chỉ nhận được `focus-visible`.
- Trạng thái `disabled` được WCAG 1.4.3 **miễn trừ** khỏi ngưỡng tương phản (ngoại lệ cho "inactive user interface components"), nên `opacity: 0.5` là hợp lệ. Nhưng nút `disabled` **bắt buộc** đi kèm dòng chữ giải thích lý do bên cạnh — xem ràng buộc BR-07 ở [`design.md` Mục 7.6](./design.md#76-màn-hình-6-không-gian-quản-lý-milestone--bàn-giao-workspaceid).
- Khi `loading`, **giữ nguyên nhãn chữ** và thêm spinner; không thay nhãn bằng spinner đơn độc, vì người dùng mất ngữ cảnh mình vừa bấm gì.

---

### 3.2. Input / Textarea / Select

#### Trạng thái

| Trạng thái | Viền | Nền | Vòng ngoài | Thuộc tính ARIA |
| :--- | :--- | :--- | :--- | :--- |
| `default` | 1px `--color-border-input` | `--color-surface-card` | không | — |
| `hover` | 1px `--color-text-muted` | `--color-surface-card` | không | — |
| `focus` | 1px `--color-border-focus` | `--color-surface-card` | **2px `--color-border-focus`, cách 2px** | — |
| `error` | 1px `--color-status-danger` | `--color-surface-card` | không | `aria-invalid="true"` + `aria-describedby` |
| `disabled` | 1px `--color-border-subtle` | `--color-surface-subtle` | không | `disabled` |

#### Giải phẫu & khoảng cách

```text
Nhãn trường (--text-body-sm, 500)
   ↕ --space-field-label (6px)
┌────────────────────────────────────────┐
│ Giá trị / gợi ý mờ    (--text-body)    │  cao 48px, bo --radius-md (12px)
└────────────────────────────────────────┘
   ↕ --space-field-error (6px)
Dòng lỗi (--text-caption, --color-status-danger-text)
   ↕ --space-field-group (20px)   ← sang nhóm trường tiếp theo
```

**Ba ràng buộc bắt buộc:**
1. **Cỡ chữ trong ô nhập không bao giờ dưới 16px trên mobile** — iOS Safari sẽ tự phóng to trang, làm vỡ bố cục giữa lúc điền form.
2. Viền dùng `--color-border-input` (4.17:1) chứ **không** dùng `--color-border-subtle` (1.32:1), vì viền ô nhập là ranh giới mang thông tin, chịu ngưỡng 3:1 của WCAG 1.4.11.
3. Lỗi **không được chỉ báo bằng màu đỏ**. Bắt buộc có đủ: viền đỏ + icon cảnh báo + dòng chữ nêu nguyên nhân và cách sửa.

#### Biến thể đặc thù GenDA

| Component | Ràng buộc |
| :--- | :--- |
| `BudgetInput` | Chỉ nhận số; tự chèn dấu phân cách hàng nghìn (`2.500.000 đ`); kẹp cứng 1.000.000–5.000.000 (BR-10); kèm thanh trượt đồng bộ hai chiều |
| `DeadlinePicker` | Khóa và làm mờ mọi ngày ≤ hôm nay (BR-11) |
| `SkillMultiSelect` | Chỉ chọn từ danh mục hệ thống, **cấm nhập tự do** (FR-USR-05) |

---

### 3.3. Card

| Thuộc tính | Giá trị |
| :--- | :--- |
| Nền | `--color-surface-card` |
| Viền | 1px `--color-border-subtle` |
| Bo góc | `--radius-lg` (20px) |
| Đổ bóng | `--shadow-sm` — rất nhẹ, chỉ đủ để mép thẻ trắng không cắt gắt vào tấm kem |
| Đệm trong | `--space-card-padding` (24px) |
| Khoảng cách giữa các thẻ | `--space-card-gap` (16px) |

> **Vì sao thẻ không đổ bóng.** Đổ bóng mềm trên mọi bề mặt là dấu hiệu dễ nhận nhất của giao diện dựng
> theo khuôn mẫu. Quan trọng hơn, bóng là **tín hiệu về độ cao** — nó nói với người dùng rằng "vật này nhấc
> lên được, tương tác được". Đem bóng rải lên cả những thẻ chỉ để đọc là làm hỏng tín hiệu đó. GenDA dùng
> mặt phẳng với viền kẻ mảnh, giống chứng từ tài chính, và **chỉ dành bóng cho `card--interactive` khi rê
> chuột** — đúng lúc tín hiệu "nhấc lên được" thật sự có nghĩa.

| Biến thể | Khác biệt |
| :--- | :--- |
| `default` | Như trên |
| `interactive` | Thêm `cursor: pointer`; hover nâng lên `--shadow-md`; **bắt buộc có `focus-visible`** vì là phần tử bấm được |
| `selected` | Viền 2px `--color-action-primary` + nền `--color-status-progress-bg` |

Ba loại thẻ **Project / Milestone / Applicant** dùng chung toàn bộ giá trị trên — đây chính là nguyên lý *Repetition* của bộ quy tắc CRAP.

---

### 3.4. StatusBadge

Component quan trọng nhất về mặt khả dụng, vì nó hiện thực hóa quy tắc **Redundant Coding** ([`design.md` Mục 4.5](./design.md#45-sử-dụng-màu-trong-mã-hóa-trạng-thái-redundant-coding)).

**Cấu trúc bắt buộc — ba lớp, không được lược bỏ lớp nào:**

```text
┌───────────────────────────────┐
│ [icon]  Nhãn chữ              │   nền tint + chữ đậm cùng tông
└───────────────────────────────┘
   ↑        ↑
 lớp 2    lớp 3        (lớp 1 = màu nền)
```

| Trạng thái | Nền | Chữ | Icon | Nhãn |
| :--- | :--- | :--- | :--- | :--- |
| `VERIFIED` / `ACCEPTED` | `--color-status-verified-bg` | `--color-status-verified-text` | dấu tích | "Đã xác thực" / "Đã nghiệm thu" |
| `PENDING` / `PENDING_REVIEW` | `--color-status-warning-bg` | `--color-status-warning-text` | đồng hồ | "Đang chờ duyệt" |
| `CHANGES_REQUESTED` | `--color-status-warning-bg` | `--color-status-warning-text` | mũi tên quay lại | "Yêu cầu chỉnh sửa" |
| `REJECTED` / `CANCELLED` | `--color-status-danger-bg` | `--color-status-danger-text` | dấu X | "Bị từ chối" / "Đã hủy" |
| `SUBMITTED` / `IN_PROGRESS` | `--color-status-progress-bg` | `--color-status-progress` | vòng tròn tiến độ | "Đang thực hiện" |

| Thuộc tính | Giá trị |
| :--- | :--- |
| Cỡ chữ | `--text-caption` (12px, weight 500) |
| Đệm | 4px 10px |
| Bo góc | `--radius-full` — viên thuốc, cùng ngôn ngữ hình với nút và chip |
| Kích thước icon | 14px |

**Điều kiện nghiệm thu component:** chụp màn hình → chuyển sang ảnh xám → vẫn đọc được đầy đủ mọi trạng thái.

---

### 3.5. Alert / Banner

| Biến thể | Nền | Chữ | Viền trái | Dùng ở đâu |
| :--- | :--- | :--- | :--- | :--- |
| `info` | `--color-status-progress-bg` | `--color-text-body` | 4px `--color-brand-decorative` | Hướng dẫn chung |
| `warning` | `--color-status-warning-bg` | `--color-status-warning-text` | 4px `--color-status-warning` | **Banner Ký quỹ mô phỏng (FR-MIL-07)**, hồ sơ chờ duyệt |
| `success` | `--color-status-verified-bg` | `--color-status-verified-text` | 4px `--color-status-verified` | Đã xác thực sinh viên |
| `danger` | `--color-status-danger-bg` | `--color-status-danger-text` | 4px `--color-status-danger` | Minh chứng bị từ chối, lỗi hệ thống |

| Thuộc tính | Giá trị |
| :--- | :--- |
| Đệm | 16px |
| Bo góc | `--radius-lg` (20px) |
| Icon | 20px, canh theo dòng đầu tiên |
| Vùng thông báo động | `aria-live="polite"` (lỗi chặn tác vụ: `assertive`) |

---

### 3.6. Dialog / Modal

| Size | Rộng tối đa | Dùng cho |
| :--- | ---: | :--- |
| `sm` | 400px | Xác nhận đơn giản |
| `md` *(mặc định)* | 520px | **Modal Xác nhận chọn ứng viên** (FR-APP-05) |
| `lg` | 640px | **Modal Ứng tuyển** (thư ngỏ + liên kết minh chứng) |

| Thuộc tính | Giá trị |
| :--- | :--- |
| Nền phủ (overlay) | `rgb(26 26 26 / 0.45)` |
| Nền hộp | `--color-surface-card` |
| Bo góc | `--radius-xl` (28px) — cùng bán kính với tấm panel của trang |
| Đệm | `--space-card-padding` (24px) |
| Trên mobile | Chiếm toàn màn hình, trượt lên từ đáy |

**Hành vi bắt buộc** (không phải tùy chọn):
- Khi mở: chuyển tiêu điểm vào trong hộp và **giữ lại** (focus trap).
- `Esc` đóng hộp thoại.
- Khi đóng: trả tiêu điểm về **đúng nút đã mở nó**.
- Hộp thoại phải có tên có thể truy cập, trỏ tới tiêu đề bằng `aria-labelledby`.
- Với hành động **không thể đảo ngược** (chấp nhận ứng viên): nút xác nhận đặt **bên phải**, nút hủy bên trái, và nội dung phải liệt kê rõ hệ quả.

> **Cách triển khai đang dùng**: phần tử `<dialog>` của trình duyệt, mở bằng `showModal()`. Bốn hành vi
> đầu tiên (focus trap, phím `Esc`, trả tiêu điểm, lớp phủ `::backdrop`) là hành vi **có sẵn** của nền tảng,
> không cần thư viện và không cần tự viết lại. Phần tử này cũng **ngầm mang** `role="dialog"` và ngữ nghĩa
> modal khi mở bằng `showModal()`, nên không cần khai báo `role` hay `aria-modal` thủ công — chỉ cần
> `aria-labelledby`. Nếu về sau đổi sang `<div>` tự dựng, toàn bộ bốn hành vi trên phải được hiện thực lại
> bằng tay cùng với hai thuộc tính ARIA đó.

---

### 3.7. Dropzone

| Trạng thái | Viền | Nền |
| :--- | :--- | :--- |
| `idle` | 2px nét đứt `--color-border-input` | `--color-surface-subtle` |
| `hover` / `focus-visible` | 2px nét đứt `--color-action-primary` | `--color-status-progress-bg` |
| `dragover` | 2px nét liền `--color-action-primary` | `--color-status-progress-bg` |
| `error` | 2px nét đứt `--color-status-danger` | `--color-status-danger-bg` |

- Bo góc `--radius-lg`, chiều cao tối thiểu 160px.
- Nội dung: icon đám mây 32px + *"Kéo thả tệp vào đây hoặc Bấm để duyệt tệp"* + dòng phụ nêu định dạng và dung lượng tối đa.
- **Bắt buộc bấm được bằng bàn phím** (Enter/Space mở hộp chọn tệp). Kéo thả không được là cách duy nhất để nộp bài.

---

### 3.8. Stepper

Hai kiểu dùng chung một component:

| Kiểu | Dùng ở | Trục |
| :--- | :--- | :--- |
| `wizard` | Đăng dự án 3 bước | Ngang |
| `milestone` | Workspace (tiến độ mốc) | Ngang trên desktop, **dọc trên mobile** |

| Trạng thái bước | Vòng tròn | Nhãn |
| :--- | :--- | :--- |
| `completed` | Nền `--color-status-verified` + dấu tích `--color-text-on-dark` | `--color-text-body` |
| `current` | Nền `--color-action-primary` + số thứ tự `--color-text-on-dark` | `--color-text-heading`, weight 600 |
| `upcoming` | Viền `--color-border-input`, nền trong suốt, số màu `--color-text-muted` | `--color-text-muted` |

Khi chuyển bước trong `wizard`, **đưa tiêu điểm về tiêu đề của bước mới** để trình đọc màn hình đọc đúng ngữ cảnh.

---

### 3.9. Skeleton

| Thuộc tính | Giá trị |
| :--- | :--- |
| Nền cơ sở | `--color-surface-subtle` |
| Hiệu ứng | Quét sáng (shimmer), chu kỳ 1.5s — vệt quét đi từ nền lên **sáng hơn** nền. Giữ công thức của bản nền sáng sẽ cho một vệt *tối hơn* chạy qua, đọc ra như lỗi dựng hình chứ không ra "đang tải". |
| Bo góc | Khớp với phần tử thật mà nó thay thế |

Skeleton phải **mô phỏng đúng hình khối** của nội dung sắp hiển thị (đúng số dòng, đúng chiều cao thẻ) — đó là lý do tồn tại của nó: khử giật bố cục (CLS).

> **Tôn trọng `prefers-reduced-motion`**: khi người dùng bật chế độ giảm chuyển động, tắt hiệu ứng quét sáng và chỉ giữ khối nền tĩnh.

---

## 4. Danh sách kiểm tra khi dựng component mới

- [ ] Không có mã hex thô nào trong file component.
- [ ] Không gọi trực tiếp token lớp primitive.
- [ ] Có đủ trạng thái: `default`, `hover`, `focus-visible`, `disabled` (và `loading` nếu gọi API).
- [ ] `focus-visible` hiển thị rõ, không bị `outline: none` xóa mất.
- [ ] Thao tác được trọn vẹn bằng bàn phím.
- [ ] Vùng chạm ≥ 24×24px (sàn WCAG 2.2 AA); đạt 44×44px trên các bề mặt chính của mobile.
- [ ] Vòng focus không bị thanh dính hoặc thanh cố định che khuất (WCAG 2.2 AA 2.4.11).
- [ ] Trạng thái không chỉ mã hóa bằng màu (kiểm thử ảnh xám).
- [ ] Chữ < 24px dùng token màu có tương phản ≥ 4.5:1.
- [ ] Không dùng `--color-brand-decorative` (coral-500) làm màu chữ thường hay nền nút — chữ cam cỡ nhỏ dùng `--color-accent-text`.
- [ ] Chữ viết tay (`--font-hand`) chỉ ở nhãn phụ, $\ge$ 14px, không dùng cho nội dung, nhãn trường hay chữ trong nút.
- [ ] Bóng mặc định là `--shadow-sm`; `--shadow-md`/`--shadow-lg` chỉ cho phần tử thật sự nổi (hover, hero, modal).
- [ ] Cỡ chữ ô nhập ≥ 16px trên mobile.
