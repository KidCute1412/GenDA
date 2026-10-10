# Các luồng chính để hoàn thiện MVP GenDA

Mục tiêu: một SME đăng dự án, chọn một cá nhân thực hiện, nhận sản phẩm và đánh giá sau khi hoàn tất. Ưu tiên chạy trọn vòng đời này bằng dữ liệu backend thật.

## 1. Use case cần thiết

| Luồng | Các bước chính | Công nghệ / API / kỹ thuật đề xuất |
| --- | --- | --- |
| **1. Tạo tài khoản và hồ sơ** | Đăng ký cá nhân hoặc SME → Đăng nhập → Hoàn thiện hồ sơ → Cá nhân tải CV | Dùng Spring Security, BCrypt, JWT trong cookie HttpOnly và CSRF hiện có. API đăng ký/đăng nhập, hồ sơ, danh mục kỹ năng và tải CV PDF. Backend kiểm tra CV và quyền truy cập. |
| **2. Đăng và duyệt dự án** | SME tạo/lưu nháp → Khai phạm vi, kỹ năng, cấp độ, ngân sách, hạn chót, tiêu chí nghiệm thu và kế hoạch milestone → Gửi duyệt → Admin công khai hoặc trả về có lý do → SME sửa/gửi lại | REST API tạo/sửa/gửi duyệt/publish/return; Spring Data JPA + PostgreSQL. Backend kiểm tra quyền, trạng thái, ngân sách theo cấp độ và milestone; lưu người quyết định và thời điểm. |
| **3. Tìm dự án và ứng tuyển** | Cá nhân xem dự án → Lọc hoặc xem gợi ý → Xem chi tiết → Gửi thư ngỏ và CV → Xem trạng thái đơn | API danh sách có phân trang, lọc kỹ năng/ngân sách/cấp độ; API ứng tuyển. Matching bằng mức trùng kỹ năng, hiển thị lý do phù hợp. Backend kiểm tra hồ sơ, CV và hạng trước khi nhận đơn. |
| **4. Chọn người thực hiện** | SME xem ứng viên và CV → So sánh mức phù hợp → Chọn một người → Dự án bắt đầu | Tái sử dụng API danh sách ứng viên và chấp nhận đơn. Dùng transaction và khóa bản ghi dự án để chọn đúng một người, đóng các đơn còn lại và chuyển trạng thái cùng lúc. |
| **5. Thực hiện và nghiệm thu** | Sử dụng kế hoạch milestone đã khai trước khi gửi duyệt → Cá nhân thực hiện → Nộp tệp hoặc liên kết → SME nghiệm thu → Hoàn tất các milestone | API milestone, bàn giao và nghiệm thu; lưu lịch sử các lần nộp. Ngân sách milestone cộng lại bằng ngân sách dự án. Bắt đầu với bàn giao bằng liên kết; khi nhận tệp, dùng object storage riêng tư và tải qua API có kiểm tra quyền. |
| **6. Hoàn tất và ghi nhận kết quả** | Nghiệm thu milestone cuối → Dự án hoàn tất → Ghi nhận thanh toán mô phỏng → SME đánh giá → Cập nhật XP và hạng | API trạng thái thanh toán mô phỏng, đánh giá và kinh nghiệm. Backend suy ra XP/hạng từ lịch sử hoàn thành; chỉ cho đánh giá dự án đã hoàn tất. Hiển thị rõ thanh toán mô phỏng. |

**Luồng xuyên suốt:** Đăng ký → Hồ sơ/CV → Đăng và duyệt dự án → Ứng tuyển → Chọn người → Bàn giao theo milestone → Nghiệm thu → Đánh giá và tích lũy kinh nghiệm.

## 2. Nền tảng kỹ thuật nên dùng

### Trạng thái triển khai luồng 1

- Đăng ký cá nhân/SME và đăng nhập đã dùng API backend.
- Hồ sơ cá nhân, kỹ năng, học vấn và upload/xem/thay CV PDF đã nối backend; CV tối đa 2 MB, hiện lưu trong PostgreSQL.
- Hồ sơ SME tại `/sme/profile` đã đọc thông tin đăng ký thật và cho sửa/lưu tên doanh nghiệp, mô tả, lĩnh vực qua `/api/v1/users/me/sme-profile`. Email, mã số thuế và website đăng ký chỉ đọc; thông tin doanh nghiệp là tự khai, chưa xác minh.
- Luồng 1 không yêu cầu logo/avatar, OTP hoặc duyệt doanh nghiệp. Trạng thái trên mô tả implementation; bản deploy cần được kiểm chứng riêng.

### Phạm vi và nghiệm thu luồng 2

- SME active lưu/mở lại và chỉnh sửa dự án của mình ở `DRAFT`; `PENDING_REVIEW` và `PUBLISHED` khóa chỉnh sửa. Không yêu cầu OTP hoặc duyệt doanh nghiệp. Xóa nháp hoãn khỏi MVP (FR-PRJ-02).
- `DRAFT → PENDING_REVIEW → PUBLISHED`; admin cũng có thể trả `PENDING_REVIEW → DRAFT` với lý do 10–1000 ký tự và cấp độ đề xuất tùy chọn. SME tự sửa rồi gửi lại; admin không sửa phạm vi/ngân sách thay SME. Khi phát hiện khai cấp độ thấp hơn scope, admin trả về và nêu cấp độ phù hợp.
- Backend kiểm tra khi gửi duyệt và công khai: đủ thông tin, kỹ năng hợp lệ, ngân sách trong khoảng cấp độ (cả hai đầu mút), hạn chót tương lai, ít nhất một milestone có tiêu đề/ngân sách dương/hạn tương lai không vượt hạn dự án, tổng tiền bằng ngân sách dự án.
- Nghiệm thu local bằng backend/PostgreSQL thật: tạo/lưu nháp → tải lại → gửi duyệt → admin trả về → SME thấy lý do, sửa/gửi lại → admin công khai → cá nhân thấy trong danh sách và trang chi tiết. Nháp/chờ duyệt không xuất hiện trong catalog.
- Kiểm tra sai quyền/chủ sở hữu, thiếu CSRF, dữ liệu sai, hạn hết trong lúc chờ duyệt, thao tác lặp, hai quyết định đồng thời và rollback nếu ghi audit thất bại. Restart backend phải giữ nội dung/trạng thái/lịch sử.
- Các test và kết quả nghiệm thu được ghi riêng; có implementation hoặc test file chưa đồng nghĩa đã nghiệm thu local hay deploy.

### Kết quả nghiệm thu luồng 2 trên local (2026-10-10)

- Đã đạt vòng SME tạo/lưu/mở lại nháp → gửi duyệt → admin trả về → SME sửa/gửi lại → admin công khai → cá nhân mở dự án từ catalog, bằng API/PostgreSQL thật trên `compose.auth-test.yaml` và frontend production build. Playwright: 1 test đạt, không mock API nghiệp vụ.
- Maven `verify`: 176 test đạt, không bỏ qua test nào, gồm ArchUnit và integration PostgreSQL. Năm test `ProjectLifecycleIntegrationTest` đạt cả khi chạy riêng: thay collections nháp, audit rollback, quyết định đồng thời, phân quyền/CSRF và deadline hết khi chờ duyệt.
- Frontend lint/typecheck, 41 test Vitest và production build đạt. OpenAPI đang chạy và client sinh lại khớp artifact trong repo; không đổi contract/schema.
- Health frontend → API → database và CORS đạt. Sau restart backend, nội dung dự án, hai milestone và bốn audit event giữ nguyên; API chủ sở hữu và công khai vẫn đọc đúng.
- Chỉ xác nhận luồng 2 trên local; chưa nghiệm thu deploy, hot reload hoặc các luồng còn lại. Xóa nháp tiếp tục hoãn khỏi MVP.

### Trạng thái triển khai và nghiệm thu luồng 3 (2026-10-10)

- Đã loại bỏ hoàn toàn mock data `CURRENT_STUDENT` và thuật toán match score ảo khỏi trang danh sách `/projects` và chi tiết `/projects/[id]`. Danh sách kỹ năng yêu cầu của dự án hiển thị ở trạng thái nhãn (pill) trung lập, minh bạch và nhất quán.
- Nghiệp vụ ứng tuyển chạy bằng API backend và PostgreSQL thật:
  - Backend kiểm tra role `CONTRIBUTOR`, dự án `PUBLISHED`, checklist điều kiện hồ sơ & CV qua `ContributorEligibilityService`, kiểm tra hạng, độ dài thư ngỏ (>= 80 ký tự) và chặn ứng tuyển trùng lặp.
  - Cá nhân ứng tuyển qua `ApplyButton` modal, đơn được lưu vào bảng `applications` thật.
  - Trang "Đơn của tôi" (`/student/applications`) đọc danh sách đơn thật qua `/api/v1/applications/me`, phân loại theo tab trạng thái (Đang chờ duyệt, Được nhận, Không được nhận, Đã rút).
  - Cá nhân có thể rút đơn đang chờ duyệt qua `/api/v1/applications/{id}/withdraw` và trạng thái chuyển sang `WITHDRAWN` ngay lập tức.
- Frontend typecheck (`tsc --noEmit`), 41 test Vitest và production build (`next build`) đạt 100%. Backend unit test (`ApplicationControllerTest`, `ContributorApplicationServiceTest`) đạt 11/11 test. Đã bổ sung kịch bản Playwright E2E `flow3-application.spec.ts`.

Ưu tiên stack và thành phần đã có trong repository:

| Thành phần | Lựa chọn | Mục đích |
| --- | --- | --- |
| Giao diện | Next.js + TypeScript, component hiện có | Màn hình theo vai trò cá nhân/SME/admin; tuân thủ DD-10 trong tài liệu thiết kế. |
| Backend | Java 21 + Spring Boot, modular monolith | Một API triển khai chung; nghiệp vụ thuộc module sở hữu. |
| Dữ liệu | PostgreSQL + JPA/Hibernate + Flyway | Lưu dữ liệu thật, transaction và ràng buộc quan hệ; Flyway quản lý schema. |
| Hợp đồng API | springdoc OpenAPI + `openapi-typescript` + `openapi-fetch` | Sinh client TypeScript từ backend, đồng bộ kiểu dữ liệu giữa hai phía. |
| CV và bàn giao | Giữ upload CV hiện có; bổ sung object storage khi cần tệp bàn giao | CV hiện được lưu trong PostgreSQL. Tệp bàn giao phải riêng tư; nhà cung cấp storage cần được chốt trước khi triển khai upload. |
| Triển khai | Vercel frontend + Render backend + Supabase PostgreSQL | Tiếp tục cấu hình triển khai hiện có; cấu hình HTTPS, cookie và CORS đúng domain. |
| Kiểm chứng khi triển khai | JUnit/MockMvc + PostgreSQL integration + ArchUnit; Playwright cho luồng chính | Kiểm tra quyền, transaction, ranh giới module và một vòng đời dự án từ đầu đến cuối. |

API nghiệp vụ dùng tiền tố `/api/v1`. Tái sử dụng endpoint đã có; endpoint milestone/thanh toán/đánh giá cần được đối chiếu và hoàn thiện hợp đồng trước khi nối UI. Dữ liệu nghiệp vụ lưu ở backend; localStorage chỉ dùng cho tùy chọn giao diện.

Tham khảo kỹ thuật: [Spring Data JPA transactions](https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html), [openapi-fetch](https://openapi-ts.dev/openapi-fetch/api).

## 3. Phạm vi đề xuất và tiêu chí hoàn tất

- **Ưu tiên:** sáu luồng trên chạy liên tục trên bản triển khai, bằng tài khoản và dữ liệu backend thật.
- **Giữ chính sách hiện hành:** một người thực hiện mỗi dự án; cấp độ/ngân sách và XP/hạng do backend kiểm soát. Email OTP và duyệt danh tính SME đang được hoãn trong MVP.
- **Đề xuất để sau:** cơ hội cộng tác viên/sự kiện, trợ lý AI, chat thời gian thực, chứng chỉ và thanh toán thật. Đây là đề xuất thu hẹp MVP; cơ hội ngắn vẫn có trong tài liệu phạm vi hiện tại dưới dạng demo.
- **Chưa ưu tiên mở rộng:** shortlist, lời mời MEDIUM và tự động hóa tranh chấp. Nếu áp dụng phạm vi rút gọn này, cần cập nhật yêu cầu về lời mời vì hiện được đánh dấu Must.
- **Đạt MVP khi:** SME đăng dự án → admin duyệt → cá nhân ứng tuyển → SME chọn → bàn giao/nghiệm thu → hoàn tất/đánh giá; mọi bước đọc và ghi qua API, có phân quyền, trạng thái lỗi rõ ràng và lịch sử quyết định.

Tài liệu này là đề xuất phạm vi và kỹ thuật; kết quả nghiệm thu chỉ áp dụng cho luồng và môi trường được ghi rõ ở trên, không xác nhận toàn bộ MVP đã hoàn thiện. Thanh toán mô phỏng chỉ ghi nhận trạng thái, không bảo đảm người thực hiện nhận tiền thật.

Nguồn nội bộ: [kiến trúc](architecture.md), [yêu cầu](requirement.md), [API](api-conventions.md), [domain](domain-model.md), [triển khai](deployment.md), [Definition of Done](definition-of-done.md). Một số mục yêu cầu còn ghi OTP/duyệt SME theo chính sách cũ; tài liệu này theo quyết định MVP mới trong kiến trúc và API.
