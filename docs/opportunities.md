# Cơ hội ngắn: cộng tác viên, sự kiện và workshop — Đặc tả sản phẩm

Tài liệu này mô tả phần mở rộng GenDA ra ngoài dự án công nghệ: **tin cộng tác viên** (làm theo buổi) và **tin sự kiện & workshop** (khán giả, người dùng thử, học viên thử), thù lao từ 50.000đ. Trạng thái hiện tại: **bản demo chạy trên trình duyệt** (ledger `localStorage`), chưa có backend.

Liên quan: [`requirement.md`](./requirement.md) mục 1 và 3.11 (FR-OPP), [`design.md`](./design.md) DD-12, [`architecture.md`](./architecture.md).

## 1. Vì sao không dùng chung khuôn "dự án"

Vòng đời dự án hiện có (1 người, 1–5 triệu, thư ngỏ + CV, mốc bàn giao, nghiệm thu) đúng cho việc trọn gói, nhưng sai cho việc ngắn nhiều người:

| | Dự án | Cộng tác viên | Sự kiện & workshop |
| --- | --- | --- | --- |
| Số người một tin | đúng 1 | vài người | hàng chục, hàng trăm |
| Thù lao | 1–5 triệu, trọn gói | từ 50k **/buổi** | từ 50k **/người** |
| Điều người xem cần biết trước | kỹ năng, hạn chót | ngày giờ, địa điểm, còn bao nhiêu chỗ | ngày giờ, địa điểm, thời lượng |
| Đăng ký | thư ngỏ + CV, SME chọn 1 người | một chạm, đơn vị đăng tin chọn từng người | một chạm, giữ chỗ ngay, đủ chỗ thì đóng |
| Hoàn thành | mốc bàn giao, nghiệm thu, ký quỹ | có mặt và làm buổi đó | có mặt buổi đó |

Ép một suất khán giả 50k qua CV, thư ngỏ và mốc bàn giao vừa khó dùng vừa làm rối trang tìm kiếm. Vì vậy cơ hội ngắn là **một thực thể riêng** (`DemoOpportunity`), không phải một loại dự án.

## 2. Yêu cầu chức năng

| Mã | Yêu cầu | Mức |
| --- | --- | --- |
| FR-OPP-01 | Doanh nghiệp đã được duyệt đăng tin cơ hội ngắn, chọn loại `GIG` (cộng tác viên) hoặc `EVENT` (sự kiện & workshop), gồm tiêu đề, lĩnh vực, mô tả, thù lao, số chỗ, hình thức (tại chỗ / trực tuyến), địa điểm hoặc nền tảng, 1–5 buổi (ngày, giờ bắt đầu, giờ kết thúc) và điều kiện tham gia. | M |
| FR-OPP-02 | Thù lao là số nguyên đồng, tối thiểu 50.000đ; đơn vị do loại quyết định: `EVENT` tính **theo người**, `GIG` tính **theo buổi**. Mọi nơi hiển thị thù lao đều kèm đơn vị. | M |
| FR-OPP-03 | Tin chỉ gửi duyệt được khi người đăng cam kết không thu bất kỳ khoản phí nào của người tham gia (cọc, phí giữ chỗ, mua sản phẩm). Mọi thẻ và trang chi tiết hiện nhãn "Không thu phí người tham gia". | M |
| FR-OPP-04 | Tin mới ở trạng thái `PENDING_REVIEW`; quản trị viên duyệt thành `PUBLISHED` hoặc từ chối thành `REJECTED` kèm lý do bắt buộc. Tin chưa duyệt chỉ chủ tin và quản trị viên xem được. | M |
| FR-OPP-05 | Tài khoản cá nhân đang hoạt động đăng ký một chạm, không cần CV hay thư ngỏ. `EVENT`: đăng ký là giữ chỗ (`CONFIRMED`). `GIG`: đăng ký chờ duyệt (`PENDING`), chủ tin nhận (`CONFIRMED`) hoặc từ chối (`DECLINED`). | M |
| FR-OPP-06 | Số chỗ còn lại = số chỗ − số đăng ký `CONFIRMED`. Hết chỗ thì không nhận đăng ký mới và chủ tin không nhận thêm người. Người đăng ký hủy được đăng ký còn hiệu lực; chỗ được trả lại. | M |
| FR-OPP-07 | Trang "Tìm cơ hội" có ba tab loại: Dự án, Cộng tác viên, Sự kiện & workshop, mỗi tab kèm số tin đang mở. Trong tab cơ hội ngắn: lọc theo lĩnh vực, khoảng thù lao, hình thức; xếp theo buổi sắp diễn ra, nhóm "Trong 7 ngày tới / 7–14 ngày tới / Sau đó"; tin đã qua hết buổi thì ẩn. | M |
| FR-OPP-08 | Người tham gia xem lịch đã đăng ký kèm trạng thái ở mục "Đơn của tôi"; chủ tin xem danh sách tin của mình kèm số người đã chốt và số người chờ duyệt. | M |

## 3. Quy tắc nghiệp vụ

| Mã | Quy tắc |
| --- | --- |
| BR-OPP-01 | Một người chỉ có tối đa một đăng ký còn hiệu lực (`PENDING` hoặc `CONFIRMED`) cho mỗi tin. |
| BR-OPP-02 | Chỉ đăng ký `CONFIRMED` chiếm chỗ; `PENDING` chưa giữ chỗ. |
| BR-OPP-03 | Không đăng ký được tin chưa `PUBLISHED` hoặc đã qua hết buổi. |
| BR-OPP-04 | Doanh nghiệp và quản trị viên không đăng ký tham gia; chủ tin không đăng ký tin của mình. |
| BR-OPP-05 | Ngày diễn ra không được ở quá khứ lúc đăng tin; giờ kết thúc phải sau giờ bắt đầu; số chỗ 1–500. |

Kiểm tra dữ liệu tin dùng chung một hàm (`validateOpportunity`) ở form và ở tầng ghi, để báo lỗi sớm và chặn thật không lệch nhau.

## 4. Giao diện

Quyết định thiết kế ở [`design.md`](./design.md) DD-12. Tóm tắt:

- **Loại là tab, lĩnh vực là bộ lọc.** "Truyền thông" là lĩnh vực; "tuyển khán giả" là loại. Một công ty truyền thông đăng được cả hai loại.
- **Một dòng thông tin cố định** trên mọi thẻ: lịch → hình thức/địa điểm ở bên trái; thù lao kèm đơn vị → số chỗ còn ở cột phải. Thẻ dùng lại khung `.project-row` của danh sách dự án nên thù lao các loại tin nằm trên cùng một trục dọc.
- Dưới thanh tab có một câu nói rõ loại đang xem khác gì (nhận tiền thế nào, đăng ký thế nào).
- Form đăng tin một trang, có bản xem trước dùng đúng thẻ của danh sách.

| Đường dẫn | Ai dùng | Nội dung |
| --- | --- | --- |
| `/projects?type=gig`, `/projects?type=event` | mọi người | Tab cơ hội ngắn trong trang "Tìm cơ hội" |
| `/opportunities/[id]` | mọi người; chủ tin thấy thêm khu quản lý người đăng ký | Chi tiết, đăng ký, hủy |
| `/sme/opportunities/new` | doanh nghiệp | Form đăng tin |
| `/sme/projects` | doanh nghiệp | Khu "Tin cộng tác viên & sự kiện" |
| `/admin?tab=opportunities` | quản trị viên | Hàng đợi duyệt, kèm nhắc soát dấu hiệu lừa đảo |
| `/student/applications#registrations` | cá nhân | Lịch đã đăng ký |

## 5. Hiện thực trong bản demo

| Phần | Vị trí |
| --- | --- |
| Kiểu dữ liệu | `apps/web/features/demo-ledger/types.ts` (`DemoOpportunity`, `DemoRegistration`) |
| Quy tắc và định dạng (hàm thuần) | `apps/web/features/opportunities/model.ts` |
| Ghi dữ liệu (đăng tin, duyệt, đăng ký, hủy, chọn người) | `apps/web/features/demo-ledger/store.ts`, mục "CƠ HỘI NGẮN" |
| Dữ liệu mẫu (9 tin, 6 lĩnh vực, ngày tương đối so với hôm nay) | `apps/web/features/opportunities/seed.ts` |
| Giao diện | `apps/web/features/opportunities/components/`, `apps/web/features/admin/components/ledger-opportunity-queue.tsx` |
| Kiểm thử | `apps/web/features/opportunities/opportunities.spec.ts`, `apps/web/e2e/opportunities.spec.ts` |

Ledger đã lưu trước khi có tính năng này được bổ sung dữ liệu mẫu cơ hội khi tải, không mất dữ liệu cũ. "Đặt lại demo" dựng lại toàn bộ.

## 6. Chưa làm và câu hỏi mở

1. **Backend.** Khi chuyển lên Spring Boot: module `opportunities` riêng (không nhét vào `projects`), bảng `opportunities`, `opportunity_sessions`, `opportunity_registrations`; kiểm tra quyền và số chỗ ở backend trong cùng giao dịch để hai người không cùng lấy chỗ cuối.
2. **Điểm danh và xác nhận đã trả thù lao.** Bản demo dừng ở đăng ký. Bước kế: chủ tin điểm danh từng buổi, người tham gia xác nhận đã nhận thù lao; hai bước này là nền cho đánh giá hai chiều.
3. **Thanh toán khoản nhỏ.** Ký quỹ mô phỏng của dự án không hợp với khoản 50k nhiều người. Cần chốt: GenDA chỉ ghi nhận, hay giữ tiền; nếu giữ tiền thì phí giao dịch trên khoản nhỏ.
4. **Cổng CV ở `/projects` (đã gỡ 2026-10-09).** `/projects` không còn chuyển người chưa có CV sang trang nộp CV; CV, hồ sơ và hạng chỉ được kiểm tra lúc ứng tuyển dự án, đúng hướng "xem trước, chặn lúc nộp". Đăng ký sự kiện vẫn không cần CV.
5. **Vai trò.** Bản demo cho vai trò `STUDENT` đăng ký. Khi chuyển sang vai trò chung `CONTRIBUTOR` (tài liệu flow mới), quy tắc giữ nguyên.
6. **Gen.** Trợ lý có thể nhắc "buổi bạn đăng ký diễn ra ngày mai" và gợi ý sự kiện cho người mới chưa đủ kinh nghiệm nhận dự án.
