# Đặc tả yêu cầu GenDA — Phạm vi MVP

Tài liệu này đặc tả yêu cầu cho **bản MVP** của GenDA, nền tảng kết nối sinh viên với doanh nghiệp nhỏ và vừa (SME) qua các dự án chuyên môn ngắn hạn.

Nguồn nghiệp vụ: `docs/general/[SSExFIC] Mô tả dự án vòng sơ loại GenD Arena .md` và `docs/general/SkillBridge_Slides.pdf`.
Nguồn kỹ thuật: `docs/architecture.md`, `docs/domain-model.md`, `docs/authorization-matrix.md`, `docs/api-conventions.md`, `docs/database-conventions.md`.

Khi hai nhóm nguồn mâu thuẫn: nguồn kỹ thuật thắng ở quyết định kỹ thuật, tài liệu nghiệp vụ mới nhất thắng ở phạm vi và hành vi sản phẩm. Các mâu thuẫn chưa giải quyết nằm ở mục [Câu hỏi mở](#9-câu-hỏi-mở).

## 1. Ranh giới phát hành

MVP số hóa đúng một vòng đời: **SME đăng dự án → admin duyệt → sinh viên ứng tuyển → SME chọn → thực hiện theo milestone → nghiệm thu → portfolio xác thực**. Mọi thứ nằm ngoài vòng đời này thuộc V1.1/V2.0.

| Ràng buộc MVP | Giá trị | Nguồn |
| --- | --- | --- |
| Địa bàn thử nghiệm | TP.HCM | Mô tả dự án 2.3.1 |
| Số sinh viên mỗi dự án | Đúng **1** | Mô tả dự án 2.3.1 |
| Ngân sách mỗi dự án | 1.000.000 – 5.000.000 VNĐ | Mô tả dự án 2.3.1 |
| Đơn vị tiền tệ | VNĐ, số nguyên đồng | Mô tả dự án 2.3.6 |
| Ký quỹ (escrow) | **Mô phỏng**, không giữ/giải ngân tiền thật | Mô tả dự án 2.3.8 |
| Matching | Rule-based theo kỹ năng, không AI | Slides, mục MVP Roadmap |
| Phí nền tảng | Không thu ở MVP | Slides, Business Model |

## 2. Tác nhân

| Tác nhân | Mô tả | Vai trò hệ thống |
| --- | --- | --- |
| Sinh viên | Sinh viên năm 3–4 hoặc mới tốt nghiệp dưới 1 năm, ngành CNTT/Kinh tế/QTKD tại TP.HCM. Ứng tuyển cá nhân, thực hiện dự án, sở hữu portfolio. | `STUDENT` |
| SME | Chủ doanh nghiệp hoặc người phụ trách vận hành tại SME dưới 20 nhân sự. Đăng dự án, chọn ứng viên, định nghĩa milestone, nghiệm thu. | `SME` |
| Quản trị viên | Đội vận hành GenDA. Duyệt dự án, hỗ trợ tranh chấp, kiểm toán thay đổi trạng thái. | `ADMIN` |

Phân quyền chi tiết theo `docs/authorization-matrix.md`. Mọi yêu cầu dưới đây giả định: guard chặn truy cập chưa xác thực và sai vai trò, use case kiểm tra quyền sở hữu, phân công và trạng thái hiện tại.

## 3. Yêu cầu chức năng

`M` = Must, `S` = Should. Mọi yêu cầu `S` bị loại khỏi MVP nếu tiến độ ép; không có `S` nào là điều kiện để đóng vòng đời.

### 3.1 Xác thực — module `auth`

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-AUTH-01 | Khách đăng ký tài khoản bằng email và mật khẩu, chọn vai trò `STUDENT` hoặc `SME` tại thời điểm đăng ký. Vai trò `ADMIN` chỉ được cấp qua quy trình nội bộ, không qua form đăng ký. | M |
| FR-AUTH-02 | Hệ thống lưu mật khẩu dưới dạng băm (bcrypt), không bao giờ lưu hoặc trả về mật khẩu gốc. | M |
| FR-AUTH-03 | Người dùng đã đăng ký đăng nhập và nhận access token; token mang định danh người dùng và vai trò. | M |
| FR-AUTH-04 | Người dùng xác minh địa chỉ email qua liên kết gửi tới email đăng ký trước khi thực hiện bất kỳ hành động tạo dự án hoặc ứng tuyển nào. | M |
| FR-AUTH-05 | Người dùng đăng xuất và yêu cầu đặt lại mật khẩu qua email. | S |

### 3.2 Hồ sơ người dùng — module `users`

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-USR-01 | Sinh viên khai hồ sơ gồm họ tên, trường, ngành, năm học, danh sách kỹ năng và liên kết portfolio ngoài. | M |
| FR-USR-02 | Sinh viên nộp minh chứng sinh viên: email tên miền trường **hoặc** ảnh thẻ sinh viên còn hiệu lực. | M |
| FR-USR-03 | Quản trị viên duyệt hoặc từ chối minh chứng sinh viên; hồ sơ mang trạng thái xác minh rõ ràng (`UNVERIFIED` / `PENDING` / `VERIFIED` / `REJECTED`). Từ chối phải kèm lý do. | M |
| FR-USR-04 | SME khai hồ sơ gồm tên doanh nghiệp, lĩnh vực, quy mô nhân sự, người liên hệ và thông tin liên lạc. | M |
| FR-USR-05 | Kỹ năng được chọn từ danh mục kỹ năng do hệ thống quản lý, không nhập tự do, để matching và tìm kiếm hoạt động được. | M |
| FR-USR-06 | Người dùng xem hồ sơ công khai của bên kia trong phạm vi một dự án đang tương tác. | M |

### 3.3 Dự án — module `projects`

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-PRJ-01 | SME tạo dự án nháp gồm tiêu đề, mô tả, kỹ năng yêu cầu, ngân sách (VNĐ), hạn chót và tiêu chí nghiệm thu. | M |
| FR-PRJ-02 | SME chỉnh sửa hoặc xóa dự án của chính mình khi dự án còn ở trạng thái `DRAFT`. | M |
| FR-PRJ-03 | SME gửi dự án đi duyệt, chuyển `DRAFT → PENDING_REVIEW`. | M |
| FR-PRJ-04 | Quản trị viên duyệt dự án (`PENDING_REVIEW → PUBLISHED`) hoặc từ chối kèm lý do bắt buộc (`PENDING_REVIEW → DRAFT`). | M |
| FR-PRJ-05 | Mọi người dùng đã xác thực xem danh sách dự án `PUBLISHED`, lọc theo kỹ năng, khoảng ngân sách và hạn chót. Kết quả phân trang theo `{ data, page, pageSize, total }`. | M |
| FR-PRJ-06 | SME hủy dự án của mình trước khi chấp nhận ứng viên, chuyển sang `CANCELLED`. | M |
| FR-PRJ-07 | Khi SME chấp nhận một ứng tuyển, dự án chuyển `PUBLISHED → IN_PROGRESS` và không còn nhận ứng tuyển mới. | M |
| FR-PRJ-08 | Khi mọi milestone của dự án được nghiệm thu, dự án chuyển sang `COMPLETED`. | M |
| FR-PRJ-09 | SME xem danh sách dự án của chính mình theo trạng thái. | M |

Vòng đời trạng thái theo `docs/domain-model.md`. Trạng thái `SUBMITTED` ở cấp dự án nằm ngoài MVP (xem [Câu hỏi mở](#9-câu-hỏi-mở)).

### 3.4 Ứng tuyển — module `applications`

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-APP-01 | Sinh viên đã xác minh ứng tuyển vào một dự án `PUBLISHED`, kèm thư ngỏ và liên kết sản phẩm minh chứng. | M |
| FR-APP-02 | Một sinh viên chỉ có tối đa một ứng tuyển đang hoạt động cho mỗi dự án. | M |
| FR-APP-03 | SME xem danh sách ứng viên của dự án mình sở hữu, kèm hồ sơ kỹ năng và điểm phù hợp. | M |
| FR-APP-04 | SME đánh dấu ứng tuyển vào danh sách rút gọn (`SUBMITTED → SHORTLISTED`). | S |
| FR-APP-05 | SME chấp nhận đúng một ứng tuyển cho mỗi dự án (`→ ACCEPTED`); mọi ứng tuyển còn lại của dự án đó tự động chuyển `REJECTED` trong cùng một giao dịch. | M |
| FR-APP-06 | Sinh viên rút ứng tuyển (`→ WITHDRAWN`) khi chưa được chấp nhận. | M |
| FR-APP-07 | Sinh viên xem trạng thái tất cả ứng tuyển của mình. | M |

### 3.5 Ghép nối — module `matching`

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-MAT-01 | Hệ thống tính điểm phù hợp giữa dự án và sinh viên dựa trên mức trùng khớp kỹ năng, theo một quy tắc tường minh và có thể kiểm thử bằng unit test. | M |
| FR-MAT-02 | Sinh viên xem danh sách dự án `PUBLISHED` được gợi ý, sắp xếp giảm dần theo điểm phù hợp. | M |
| FR-MAT-03 | SME xem danh sách ứng viên của dự án mình sắp xếp theo điểm phù hợp. | M |
| FR-MAT-04 | Điểm phù hợp là thông tin tham khảo, không tự động chấp nhận hay loại bỏ ứng tuyển. | M |

### 3.6 Milestone và bàn giao — module `milestones`

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-MIL-01 | SME định nghĩa các milestone cho dự án đã giao, mỗi milestone gồm tiêu đề, mô tả kết quả bàn giao, hạn chót và phần ngân sách phân bổ. | M |
| FR-MIL-02 | Tổng ngân sách phân bổ cho các milestone bằng đúng ngân sách dự án. | M |
| FR-MIL-03 | Sinh viên được phân công nộp kết quả bàn giao cho một milestone (tệp và/hoặc liên kết), chuyển milestone sang `SUBMITTED`. | M |
| FR-MIL-04 | SME nghiệm thu (`SUBMITTED → ACCEPTED`) hoặc yêu cầu chỉnh sửa kèm lý do bắt buộc (`SUBMITTED → CHANGES_REQUESTED`). | M |
| FR-MIL-05 | Sinh viên nộp lại kết quả sau khi bị yêu cầu chỉnh sửa; hệ thống giữ toàn bộ lịch sử các lần nộp, không ghi đè. | M |
| FR-MIL-06 | Hệ thống ghi nhận trạng thái thanh toán **mô phỏng** cho mỗi milestone (`PENDING_FUNDING` → `FUNDED` → `RELEASED`) do SME và quản trị viên đánh dấu thủ công. Hệ thống không chuyển tiền thật. | M |
| FR-MIL-07 | Giao diện hiển thị rõ ràng rằng escrow ở MVP là mô phỏng và thanh toán diễn ra ngoài nền tảng. | M |
| FR-MIL-08 | Cả hai bên xem tiến độ dự án theo từng milestone với trạng thái và hạn chót. | M |
| FR-MIL-09 | Tệp bàn giao được lưu ở object storage; cơ sở dữ liệu chỉ lưu metadata và khóa đối tượng. | M |

### 3.7 Đánh giá — module `reviews`

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-REV-01 | SME đánh giá sinh viên sau khi dự án `COMPLETED`, gồm điểm số và nhận xét. | M |
| FR-REV-02 | Đánh giá chỉ được tạo một lần cho mỗi cặp dự án–sinh viên, và không được sửa sau khi gửi. | M |
| FR-REV-03 | Đánh giá đã gửi hiển thị trên hồ sơ công khai của sinh viên. | M |
| FR-REV-04 | Đánh giá hai chiều (sinh viên đánh giá SME) **không** thuộc MVP. | — |

### 3.8 Portfolio và chứng nhận — module `certificates`

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-CERT-01 | Khi dự án chuyển `COMPLETED`, hệ thống tạo một mục portfolio đã xác thực cho sinh viên được phân công, gồm tên dự án, tên SME, phạm vi công việc, khoảng thời gian và đánh giá. | M |
| FR-CERT-02 | Mục portfolio được tạo bởi hệ thống, không do sinh viên tự khai và không thể sửa nội dung xác thực. | M |
| FR-CERT-03 | Sinh viên chia sẻ portfolio qua một liên kết công khai, chỉ đọc. | M |
| FR-CERT-04 | Sinh viên chọn ẩn hoặc hiện từng mục trên trang portfolio công khai; ẩn không xóa bản ghi. | S |
| FR-CERT-05 | Mục portfolio ghi rõ quyền sử dụng sản phẩm đã thỏa thuận giữa SME và sinh viên. | S |

### 3.9 Quản trị — module `admin`

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-ADM-01 | Quản trị viên xem hàng đợi dự án `PENDING_REVIEW` và hàng đợi minh chứng sinh viên chờ duyệt. | M |
| FR-ADM-02 | Mọi hành động hỗ trợ của quản trị viên ghi bản ghi kiểm toán gồm người thực hiện, đối tượng, hành động, lý do và thời điểm. | M |
| FR-ADM-03 | Quản trị viên xem nhật ký chuyển trạng thái của một dự án để xử lý khiếu nại. | M |
| FR-ADM-04 | Quản trị viên khóa hoặc mở khóa một tài khoản kèm lý do bắt buộc. | S |

## 4. Quy tắc nghiệp vụ

Bất biến áp dụng xuyên suốt mọi use case. Vi phạm trả về lỗi miền ổn định theo `docs/api-conventions.md`, không phải lỗi 500.

| ID | Quy tắc |
| --- | --- |
| BR-01 | Chỉ SME sở hữu mới tạo hoặc sửa dự án nháp của mình. |
| BR-02 | Chỉ quản trị viên mới publish hoặc từ chối một dự án chờ duyệt. |
| BR-03 | Sinh viên chưa được xác minh (`VERIFIED`) không được ứng tuyển. |
| BR-04 | Sinh viên không được ứng tuyển vào dự án chưa publish hoặc đã hủy. |
| BR-05 | Mỗi dự án có tối đa một ứng tuyển ở trạng thái `ACCEPTED`. |
| BR-06 | Một ứng tuyển được chấp nhận thuộc về tối đa một phân công dự án đang hoạt động. |
| BR-07 | Milestone không được nghiệm thu khi chưa có kết quả bàn giao ở trạng thái `SUBMITTED`. |
| BR-08 | Chỉ dự án `COMPLETED` mới sinh mục portfolio xác thực hoặc chứng nhận. |
| BR-09 | Mọi hành vi chấp nhận và từ chối ghi lại người thực hiện và thời điểm. |
| BR-10 | Ngân sách dự án nằm trong khoảng 1.000.000 – 5.000.000 VNĐ. |
| BR-11 | Hạn chót dự án phải ở tương lai tại thời điểm publish. |
| BR-12 | Chuyển trạng thái không hợp lệ bị từ chối; không có đường tắt bỏ qua trạng thái trung gian. |
| BR-13 | Chuyển trạng thái tác động nhiều bản ghi thực hiện trong một transaction. |
| BR-14 | Nền tảng không thu phí và không xử lý dòng tiền thật ở MVP. |

BR-01 đến BR-09 đồng nhất với bất biến trong `docs/domain-model.md`. BR-10 đến BR-14 là ràng buộc bổ sung của MVP từ tài liệu nghiệp vụ.

## 5. Yêu cầu phi chức năng

| ID | Hạng mục | Yêu cầu |
| --- | --- | --- |
| NFR-SEC-01 | Bảo mật | Mật khẩu băm bằng bcrypt. Token có thời hạn. Không ghi log dữ liệu nhạy cảm hay token. |
| NFR-SEC-02 | Bảo mật | Phân quyền cưỡng chế ở tầng API; kiểm tra quyền phía giao diện chỉ phục vụ trải nghiệm. |
| NFR-SEC-03 | Bảo mật | Liên kết tải tệp bàn giao chỉ cấp cho các bên của dự án và có thời hạn. |
| NFR-PRIV-01 | Dữ liệu cá nhân | Chỉ thu thập dữ liệu cần thiết cho vận hành nền tảng; công bố mục đích thu thập trong chính sách bảo mật. |
| NFR-PRIV-02 | Dữ liệu cá nhân | Người dùng yêu cầu chỉnh sửa hoặc xóa dữ liệu cá nhân của mình; hồ sơ giao dịch giữ lại theo quy định và được ẩn danh khi xóa tài khoản. |
| NFR-PRIV-03 | Pháp lý | Nền tảng công bố quy chế hoạt động, điều khoản sử dụng, chính sách bảo mật và quy trình khiếu nại trước khi mở vận hành chính thức. |
| NFR-AUD-01 | Kiểm toán | Mọi chuyển trạng thái miền ghi lại người thực hiện, thời điểm và lý do khi có. |
| NFR-PERF-01 | Hiệu năng | Danh sách dự án và ứng viên trả về dưới 1 giây ở quy mô pilot (≤ 1.000 dự án, ≤ 1.000 người dùng). |
| NFR-PERF-02 | Hiệu năng | Mọi endpoint trả danh sách đều phân trang; không có endpoint trả toàn bộ bảng. |
| NFR-UX-01 | Giao diện | Giao diện tiếng Việt, ưu tiên mobile-first, HTML ngữ nghĩa và hỗ trợ bàn phím. |
| NFR-UX-02 | Giao diện | Mọi màn hình gọi API thể hiện rõ bốn trạng thái: loading, rỗng, lỗi, thành công. |
| NFR-OPS-01 | Vận hành | Hạ tầng nằm trong dự toán 3.000.000 VNĐ cho 6 tháng; chọn phương án lưu trữ và hosting theo ràng buộc này. |
| NFR-OPS-02 | Vận hành | Lỗi trả về mã lỗi ổn định kèm `requestId` để truy vết. |
| NFR-TEST-01 | Kiểm thử | Mỗi tính năng có trạng thái đều phủ ma trận tối thiểu trong `docs/testing-strategy.md`. |
| NFR-DATA-01 | Dữ liệu | Số tiền lưu dưới dạng số nguyên đồng VNĐ, không dùng kiểu dấu phẩy động. |

## 6. Tiêu chí nghiệm thu

Vòng đời MVP được coi là hoàn tất khi các kịch bản sau chạy được đầu–cuối trên dữ liệu seed xác định:

1. **Tạo và duyệt dự án** — SME đã xác minh tạo dự án ngân sách 3.000.000 VNĐ, gửi duyệt; quản trị viên publish; dự án xuất hiện trong danh sách công khai. Quản trị viên từ chối không kèm lý do bị hệ thống chặn.
2. **Ứng tuyển và chọn** — Sinh viên chưa xác minh bị từ chối ứng tuyển (BR-03). Sinh viên đã xác minh ứng tuyển thành công; ứng tuyển thứ hai vào cùng dự án bị chặn (FR-APP-02). SME chấp nhận một ứng viên; các ứng viên còn lại chuyển `REJECTED` và dự án sang `IN_PROGRESS` trong cùng transaction (FR-APP-05, BR-13).
3. **Milestone và nghiệm thu** — SME tạo 2 milestone có tổng ngân sách đúng bằng ngân sách dự án; tạo milestone lệch tổng bị chặn (FR-MIL-02). Sinh viên nộp bàn giao; SME yêu cầu chỉnh sửa kèm lý do; sinh viên nộp lại; cả hai lần nộp đều còn trong lịch sử (FR-MIL-05). SME nghiệm thu milestone chưa có bàn giao bị chặn (BR-07).
4. **Hoàn tất và portfolio** — Sau khi mọi milestone `ACCEPTED`, dự án chuyển `COMPLETED`; hệ thống sinh mục portfolio xác thực; sinh viên mở được liên kết portfolio công khai. Sinh viên không sửa được nội dung xác thực (FR-CERT-02).
5. **Phân quyền** — Với mỗi use case có trạng thái: truy cập chưa xác thực bị chặn, sai vai trò bị chặn, đúng vai trò nhưng sai chủ sở hữu bị chặn, chuyển trạng thái không hợp lệ bị chặn, và mọi hành động quản trị đều sinh bản ghi kiểm toán (FR-ADM-02).

Ngoài ra, điều kiện đóng theo `docs/definition-of-done.md` phải đạt: lint, typecheck, test, build, migration và seed đã rà soát.

## 7. Bảng truy vết

| Nhóm yêu cầu | Module sở hữu | Tài liệu liên quan |
| --- | --- | --- |
| FR-AUTH-01…05 | `auth` | `docs/authorization-matrix.md`, `docs/api-conventions.md` |
| FR-USR-01…06 | `users` | `docs/domain-model.md`, `docs/database-conventions.md` |
| FR-PRJ-01…09 | `projects` | `docs/domain-model.md`, `docs/authorization-matrix.md` |
| FR-APP-01…07 | `applications` | `docs/domain-model.md`, `docs/authorization-matrix.md` |
| FR-MAT-01…04 | `matching` | `docs/architecture.md`, `docs/testing-strategy.md` |
| FR-MIL-01…09 | `milestones` | `docs/domain-model.md`, `docs/database-conventions.md` |
| FR-REV-01…03 | `reviews` | `docs/domain-model.md` |
| FR-CERT-01…05 | `certificates` | `docs/domain-model.md`, `docs/authorization-matrix.md` |
| FR-ADM-01…04 | `admin` | `docs/authorization-matrix.md` |
| BR-01…14 | Tầng domain của module sở hữu | `docs/domain-model.md`, `docs/architecture.md` |
| NFR-SEC, NFR-PRIV, NFR-AUD | Xuyên suốt | `docs/architecture.md`, `docs/authorization-matrix.md` |
| NFR-PERF, NFR-DATA | `projects`, `applications`, `milestones` | `docs/database-conventions.md`, `docs/api-conventions.md` |
| NFR-UX-01…02 | `apps/web` | `docs/frontend-conventions.md` |
| NFR-TEST-01 | Xuyên suốt | `docs/testing-strategy.md` |

## 8. Ngoài phạm vi MVP

Các mục sau **không** được xây ở MVP. Liệt kê tường minh để không bị cài vào một cách âm thầm.

| Hạng mục | Phiên bản dự kiến |
| --- | --- |
| Ký quỹ thật, giữ và giải ngân tiền, tích hợp cổng thanh toán | V1.1 |
| Thu phí nền tảng / hoa hồng | V1.1 |
| Ứng tuyển theo nhóm 2–4 sinh viên | Sau MVP |
| Đánh giá hai chiều | V1.1 |
| Community Review theo rubric chuyên môn | V1.1 |
| Workspace chat/cộng tác tích hợp | V1.1 |
| AI Matching | V2.0 |
| SME Premium, chứng nhận QR, Talent Pool | V2.0 |
| Ứng dụng di động native | Chưa lên lịch |
| Mở rộng ngoài TP.HCM | Sau khi kiểm chứng pilot |

## 9. Câu hỏi mở

Các điểm cần quyết định trước khi module liên quan được implement. Mỗi mục nêu rõ nguồn mâu thuẫn.

| ID | Vấn đề | Nguồn |
| --- | --- | --- |
| OQ-01 | **Tên sản phẩm.** Tài liệu nghiệp vụ mới nhất dùng "GenDA"; `AGENTS.md`, `docs/architecture.md`, `docs/domain-model.md` và slides dùng "SkillBridge". Tài liệu này dùng GenDA theo quyết định phạm vi; các docs còn lại chưa được đổi. | Mô tả dự án vs. `docs/*.md` |
| OQ-02 | **Ứng tuyển theo nhóm.** Slides cho phép nhóm 2–4; mô tả dự án (mới hơn) giới hạn 1 sinh viên ở MVP. Tài liệu này theo mô tả dự án. Cần xác nhận lược đồ dữ liệu có chừa chỗ cho nhóm ở V1.1 hay không. | Slides vs. Mô tả dự án 2.3.1 |
| OQ-03 | **Trạng thái `SUBMITTED` ở cấp dự án.** `docs/domain-model.md` liệt kê `IN_PROGRESS → SUBMITTED → COMPLETED`, nhưng MVP đóng dự án bằng cách nghiệm thu milestone cuối. Cần chốt: bỏ `SUBMITTED` khỏi vòng đời dự án, hay thêm bước sinh viên bàn giao toàn bộ dự án. | `docs/domain-model.md` vs. FR-PRJ-08 |
| OQ-04 | **Stack backend.** Slides ghi Node.js/Express; `docs/architecture.md` và ADR 0001 chốt NestJS. Tài liệu này theo nguồn kỹ thuật. | Slides vs. ADR 0001 |
| OQ-05 | **Quyền sở hữu sản phẩm bàn giao.** Mô tả dự án 2.3.8 yêu cầu quy định rõ quyền sở hữu, quyền SME sử dụng và quyền sinh viên đưa vào portfolio. Cần văn bản pháp lý trước khi FR-CERT-05 được implement. | Mô tả dự án 2.3.8 |
| OQ-06 | **Đăng ký sàn TMĐT.** Mô tả dự án 2.3.8 nêu nghĩa vụ rà soát đăng ký website cung cấp dịch vụ TMĐT với Bộ Công Thương khi vận hành chính thức. Ảnh hưởng thời điểm mở public, không ảnh hưởng MVP pilot. | NĐ 52/2013, NĐ 85/2021 |
| OQ-07 | **Lưu trữ tệp.** `docs/database-conventions.md` yêu cầu object storage nhưng chưa chọn nhà cung cấp; ràng buộc chi phí là NFR-OPS-01. Cần một ADR. | `docs/database-conventions.md` |

## 10. Giả định và rủi ro

**Giả định**

- Sinh viên có email tên miền trường hoặc thẻ sinh viên còn hiệu lực để xác minh.
- SME sẵn sàng thanh toán ngoài nền tảng trong giai đoạn escrow mô phỏng.
- Phạm vi công việc mỗi dự án đủ nhỏ để một sinh viên hoàn thành trong vài ngày đến vài tuần.
- Quản trị viên duyệt dự án thủ công ở quy mô pilot; hàng đợi duyệt không cần tự động hóa.

**Rủi ro**

| Rủi ro | Ảnh hưởng | Giảm thiểu ở MVP |
| --- | --- | --- |
| Escrow mô phỏng không ngăn được việc bùng tiền | Mất niềm tin — chính là vấn đề nền tảng muốn giải | Ghi nhận trạng thái thanh toán tường minh, giới hạn ngân sách 1–5 triệu, hiển thị rõ giới hạn của escrow mô phỏng (FR-MIL-07) |
| SME giao việc vượt phạm vi đã thỏa thuận | Sinh viên bị thiệt, bỏ nền tảng | Phạm vi và tiêu chí nghiệm thu bắt buộc khai lúc đăng dự án (FR-PRJ-01); milestone cố định ngân sách (FR-MIL-02) |
| Tranh chấp lúc nghiệm thu | Bế tắc, cần can thiệp thủ công | Lịch sử bàn giao không ghi đè (FR-MIL-05), nhật ký chuyển trạng thái cho quản trị viên (FR-ADM-03) |
| Thị trường hai phía lệch cung cầu | Không có giao dịch để kiểm chứng | Ngoài phạm vi kỹ thuật; thuộc kế hoạch GTM ba giai đoạn |
| Portfolio xác thực bị khai khống | Mất giá trị cốt lõi của sản phẩm | Mục portfolio do hệ thống sinh, sinh viên không sửa được (FR-CERT-02) |
