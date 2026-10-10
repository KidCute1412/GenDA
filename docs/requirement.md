# Đặc tả yêu cầu GenDA — Phạm vi MVP

Tài liệu này đặc tả yêu cầu cho **bản MVP** của GenDA, nền tảng kết nối cá nhân nhận dự án với doanh nghiệp nhỏ và vừa (SME) qua các dự án chuyên môn ngắn hạn. Sinh viên là nhóm người dùng trọng tâm ban đầu, nhưng không phải điều kiện bắt buộc để tham gia nền tảng.

Nguồn nghiệp vụ: `docs/general/[SSExFIC] Mô tả dự án vòng sơ loại GenD Arena .md` và `docs/general/SkillBridge_Slides.pdf`.
Nguồn kỹ thuật: `docs/architecture.md`, `docs/domain-model.md`, `docs/authorization-matrix.md`, `docs/api-conventions.md`, `docs/database-conventions.md`.

Khi hai nhóm nguồn mâu thuẫn: nguồn kỹ thuật thắng ở quyết định kỹ thuật, tài liệu nghiệp vụ mới nhất thắng ở phạm vi và hành vi sản phẩm. Các mâu thuẫn chưa giải quyết nằm ở mục [Câu hỏi mở](#9-câu-hỏi-mở).

## 1. Ranh giới phát hành

MVP số hóa đúng một vòng đời: **SME đăng dự án → admin duyệt → cá nhân ứng tuyển → SME chọn → thực hiện theo milestone → nghiệm thu → SME đánh giá**. Mọi thứ nằm ngoài vòng đời này thuộc V1.1/V2.0.

| Ràng buộc MVP | Giá trị | Nguồn |
| --- | --- | --- |
| Địa bàn thử nghiệm | TP.HCM | Mô tả dự án 2.3.1 |
| Số cá nhân thực hiện mỗi dự án | Đúng **1** | Quyết định sản phẩm 2026-10-07; kế thừa giới hạn MVP từ Mô tả dự án 2.3.1 |
| Ngân sách mỗi dự án | 1.000.000 – 5.000.000 VNĐ | Mô tả dự án 2.3.1 |
| Đơn vị tiền tệ | VNĐ, số nguyên đồng | Mô tả dự án 2.3.6 |
| Ký quỹ (escrow) | **Mô phỏng**, không giữ/giải ngân tiền thật | Mô tả dự án 2.3.8 |
| Matching | Rule-based theo kỹ năng, không AI | Slides, mục MVP Roadmap |
| Phí nền tảng | Không thu ở MVP | Slides, Business Model |

**Mở rộng 2026-10-07: cơ hội ngắn.** Ngoài dự án, GenDA nhận tin **cộng tác viên** (làm theo buổi) và **sự kiện & workshop** (khán giả, người dùng thử, học viên thử) ở mọi lĩnh vực, thù lao từ 50.000đ theo buổi hoặc theo người. Các ràng buộc "1 người / dự án" và "1–5 triệu" ở bảng trên **chỉ áp cho dự án**. Cơ hội ngắn có vòng đời riêng (đăng ký một chạm, nhiều người một tin, không mốc bàn giao): yêu cầu ở mục 3.11 và [`opportunities.md`](./opportunities.md). Hiện là bản demo trên trình duyệt, chưa có backend.

## 2. Tác nhân

| Tác nhân | Mô tả | Vai trò hệ thống |
| --- | --- | --- |
| Cá nhân nhận dự án | Cá nhân ứng tuyển bằng CV (PDF) và trực tiếp thực hiện dự án. Có thể là sinh viên, người mới tốt nghiệp, người đang đi làm, freelancer, người chuyển ngành hoặc nhóm nền tảng khác. | `CONTRIBUTOR` |
| SME | Chủ doanh nghiệp hoặc người phụ trách vận hành tại SME dưới 20 nhân sự. Đăng dự án, chọn ứng viên, định nghĩa milestone, nghiệm thu. | `SME` |
| Quản trị viên | Đội vận hành GenDA. Duyệt dự án, hỗ trợ tranh chấp, kiểm toán thay đổi trạng thái. | `ADMIN` |

Phân quyền chi tiết theo `docs/authorization-matrix.md`. Mọi yêu cầu dưới đây giả định: guard chặn truy cập chưa xác thực và sai vai trò, use case kiểm tra quyền sở hữu, phân công và trạng thái hiện tại.

## 3. Yêu cầu chức năng

`M` = Must, `S` = Should. Mọi yêu cầu `S` bị loại khỏi MVP nếu tiến độ ép; không có `S` nào là điều kiện để đóng vòng đời.

### 3.1 Xác thực — module `auth`

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-AUTH-01 | Khách đăng ký tài khoản bằng email và mật khẩu, chọn vai trò `CONTRIBUTOR` hoặc `SME` tại thời điểm đăng ký. Vai trò `ADMIN` chỉ được cấp qua quy trình nội bộ, không qua form đăng ký. | M |
| FR-AUTH-02 | Hệ thống lưu mật khẩu dưới dạng băm (bcrypt), không bao giờ lưu hoặc trả về mật khẩu gốc. | M |
| FR-AUTH-03 | Chỉ tài khoản đã xác minh email và đang hoạt động mới đăng nhập để nhận phiên xác thực; token mang định danh người dùng và vai trò. | M |
| FR-AUTH-04 | Sau khi đăng ký, hệ thống gửi mã OTP gồm 6 chữ số tới email đăng ký. Người dùng phải nhập đúng OTP còn hiệu lực trước khi đủ điều kiện nhận phiên xác thực theo gate của vai trò và tiếp tục onboarding. OTP dùng một lần, hết hạn sau thời lượng cấu hình mặc định 10 phút và bị vô hiệu ngay khi dùng thành công. | M |
| FR-AUTH-05 | Người dùng đăng xuất và yêu cầu đặt lại mật khẩu qua email. | S |
| FR-AUTH-06 | Người dùng có thể yêu cầu gửi lại OTP sau thời gian chờ mặc định 60 giây. OTP mới làm OTP cũ mất hiệu lực; mỗi mã chỉ cho phép tối đa 5 lần nhập sai và việc gửi/xác nhận phải được giới hạn tần suất. | M |

### 3.2 Hồ sơ người dùng — module `users`

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-USR-01 | Cá nhân khai hồ sơ cơ bản gồm họ tên hiển thị, loại nền tảng (`STUDENT`, `RECENT_GRADUATE`, `WORKING_PROFESSIONAL`, `FREELANCER`, `CAREER_SWITCHER`, `OTHER`), chuyên môn và danh sách kỹ năng. Học vấn được quản lý thành danh sách riêng theo FR-USR-10. | M |
| FR-USR-02 | **Đã loại bỏ (2026-10-07).** GenDA không thu thập hoặc xác minh minh chứng tư cách sinh viên; `STUDENT` chỉ là loại nền tảng tự khai trong profile. | — |
| FR-USR-03 | **Đã loại bỏ (2026-10-07).** Không có hàng đợi admin duyệt tư cách sinh viên. | — |
| FR-USR-04 | SME khai hồ sơ gồm tên doanh nghiệp, lĩnh vực, quy mô nhân sự, người liên hệ và thông tin liên lạc. | M |
| FR-USR-05 | Kỹ năng được chọn từ danh mục kỹ năng do hệ thống quản lý, không nhập tự do, để matching và tìm kiếm hoạt động được. | M |
| FR-USR-06 | Người dùng xem hồ sơ công khai của bên kia trong phạm vi một dự án đang tương tác. | M |
| FR-USR-07 | Cá nhân được xem danh sách và chi tiết dự án ở mọi project level sau khi xác minh email, nhưng chỉ được ứng tuyển khi đã có CV ở trạng thái `READY`. CV PDF tối đa 2 MB và có thể thay thế. | M |
| FR-USR-08 | Khi tải CV, hệ thống tự động kiểm tra loại tệp/chữ ký PDF, dung lượng, khả năng đọc, trạng thái mã hóa bằng mật khẩu và kiểm tra an toàn tệp nếu môi trường có bộ quét. CV chuyển qua `UPLOADING` / `PROCESSING` và chỉ đạt `READY` khi vượt qua các kiểm tra kỹ thuật; nếu không thì `REJECTED_TECHNICAL` kèm lý do có thể hành động. | M |
| FR-USR-09 | Điều kiện readiness chung được suy ra tại thời điểm gửi đơn: tài khoản đang hoạt động, email đã xác minh, hồ sơ bắt buộc đã hoàn tất và CV đang `READY`. Không lưu một cờ quyền ứng tuyển độc lập có thể lệch trạng thái nguồn. | M |
| FR-USR-10 | Cá nhân tạo, cập nhật và xóa nhiều bản ghi học vấn. Mỗi bản ghi gồm cơ sở đào tạo, chuyên ngành/lĩnh vực, bậc học, tên bằng cấp nếu có, thời gian bắt đầu–kết thúc, trạng thái (`CURRENTLY_STUDYING`, `GRADUATED`, `COMPLETED`, `NOT_COMPLETED`) và mô tả tùy chọn. | M |
| FR-USR-11 | Hệ thống hiển thị học vấn trên hồ sơ với nhãn “Thông tin tự khai” khi chưa có cơ chế xác minh tương ứng; người dùng không được trình bày bản ghi tự khai như bằng cấp đã được GenDA xác minh. | M |
| FR-USR-12 | Khi đăng ký vai trò SME, người dùng nộp thông tin xác minh doanh nghiệp gồm tên doanh nghiệp, người đại diện/người phụ trách, thông tin liên hệ và mã số thuế Việt Nam hợp lệ; nếu chưa có mã số thuế thì phải cung cấp website hoặc trang doanh nghiệp để đối chiếu. Sau khi email được xác minh, hồ sơ chuyển sang `PENDING`. | M |
| FR-USR-13 | Quản trị viên duyệt hồ sơ SME thành `VERIFIED` hoặc từ chối thành `REJECTED` kèm lý do bắt buộc. Quyết định và người thực hiện phải được ghi audit; xác minh email không tự động xác minh doanh nghiệp. | M |

### 3.3 Dự án — module `projects`

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-PRJ-01 | SME tạo dự án nháp gồm tiêu đề, mô tả, kỹ năng yêu cầu, project level (`BASIC`, `MEDIUM`, `HIGH`), ngân sách (VNĐ), hạn chót và tiêu chí nghiệm thu. Project level đồng thời xác định độ phức tạp, khoảng ngân sách và eligibility theo lịch sử dự án. | M |
| FR-PRJ-02 | SME chỉnh sửa hoặc xóa dự án của chính mình khi dự án còn ở trạng thái `DRAFT`. | M |
| FR-PRJ-03 | SME gửi dự án đi duyệt, chuyển `DRAFT → PENDING_REVIEW`. | M |
| FR-PRJ-04 | Quản trị viên duyệt dự án (`PENDING_REVIEW → PUBLISHED`) hoặc từ chối kèm lý do bắt buộc (`PENDING_REVIEW → DRAFT`). | M |
| FR-PRJ-05 | Mọi người dùng đã xác thực xem danh sách dự án `PUBLISHED` ở mọi project level, kể cả khi chưa đủ điều kiện ứng tuyển; có thể lọc theo level, kỹ năng, khoảng ngân sách và hạn chót. Kết quả phân trang theo `{ data, page, pageSize, total }`. | M |
| FR-PRJ-06 | SME hủy dự án của mình trước khi chấp nhận ứng viên, chuyển sang `CANCELLED`. | M |
| FR-PRJ-07 | Khi SME chấp nhận một ứng tuyển, dự án chuyển `PUBLISHED → IN_PROGRESS` và không còn nhận ứng tuyển mới. | M |
| FR-PRJ-08 | Khi mọi milestone của dự án được nghiệm thu, dự án chuyển sang `COMPLETED`. | M |
| FR-PRJ-09 | SME xem danh sách dự án của chính mình theo trạng thái. | M |
| FR-PRJ-10 | Khi SME chọn project level, hệ thống hiển thị khoảng ngân sách và yêu cầu kinh nghiệm tương ứng, đồng thời chặn gửi duyệt nếu ngân sách nằm ngoài khoảng. Khoảng ngân sách (tính cả hai đầu mút): `BASIC` 1.000.000–1.500.000, `MEDIUM` 1.500.000–3.500.000, `HIGH` 3.500.000–5.000.000 VNĐ. | M |
| FR-PRJ-11 | Khi duyệt dự án, quản trị viên đối chiếu project level với scope, deliverables, kỹ năng, deadline và milestone. Nếu SME khai level thấp hơn khối lượng thực tế, quản trị viên phải trả dự án về `DRAFT` với lý do và level đề xuất để SME thu hẹp scope hoặc tăng level/ngân sách rồi gửi lại. | M |

Vòng đời trạng thái theo `docs/domain-model.md`. Trạng thái `SUBMITTED` ở cấp dự án nằm ngoài MVP (xem [Câu hỏi mở](#9-câu-hỏi-mở)).

### 3.4 Ứng tuyển — module `applications`

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-APP-01 | Cá nhân đáp ứng readiness chung theo FR-USR-09 và eligibility của project level ứng tuyển vào dự án `PUBLISHED`, kèm thư ngỏ và bản CV `READY` hiện hành. | M |
| FR-APP-02 | Một cá nhân chỉ có tối đa một ứng tuyển đang hoạt động cho mỗi dự án. | M |
| FR-APP-03 | SME xem danh sách ứng viên của dự án mình sở hữu, kèm hồ sơ kỹ năng và điểm phù hợp. | M |
| FR-APP-04 | SME đánh dấu ứng tuyển vào danh sách rút gọn (`SUBMITTED → SHORTLISTED`). | S |
| FR-APP-05 | SME chấp nhận đúng một ứng tuyển cho mỗi dự án (`→ ACCEPTED`); mọi ứng tuyển còn lại của dự án đó tự động chuyển `REJECTED` trong cùng một giao dịch. | M |
| FR-APP-06 | Cá nhân rút ứng tuyển (`→ WITHDRAWN`) khi chưa được chấp nhận. | M |
| FR-APP-07 | Cá nhân xem trạng thái tất cả ứng tuyển của mình. | M |
| FR-APP-08 | Hệ thống suy ra điểm kinh nghiệm (XP) từ các dự án đủ điều kiện đã hoàn thành: `BASIC` cộng 1 XP (XP từ `BASIC` tính tối đa 10), `MEDIUM` cộng 2 XP và `HIGH` cộng 3 XP. Chỉ dự án `COMPLETED` mà cá nhân là ứng viên `ACCEPTED` và toàn bộ milestone đã nghiệm thu mới được tính. XP quy ra hạng: Đồng (0 XP, mặc định), Bạc (từ 10 XP), Vàng (từ 30 XP). | M |
| FR-APP-09 | Khi cá nhân tự gửi đơn, backend cho phép `BASIC` với mọi hạng; cho phép `MEDIUM` từ hạng Bạc; và chỉ cho phép `HIGH` với hạng Vàng. Nếu chưa đủ, hệ thống từ chối và trả về hạng cần có, hạng hiện tại và số XP còn thiếu. | M |
| FR-APP-10 | SME gửi lời mời cho một contributor vào dự án `MEDIUM` do mình sở hữu dù contributor chưa đạt hạng Bạc; hệ thống phải cảnh báo SME về điều kiện được miễn và ghi audit lời mời. | M |
| FR-APP-11 | Khi contributor đáp ứng readiness chung và chấp nhận lời mời `MEDIUM` hợp lệ, hệ thống tạo application `SUBMITTED` với nguồn eligibility `SME_INVITATION`; lời mời không tự động chấp nhận ứng viên hoặc giao dự án. | M |
| FR-APP-12 | Cá nhân thấy thanh kinh nghiệm gồm hạng hiện tại, XP và XP còn thiếu tới hạng kế tiếp ở hồ sơ và ở dự án chưa đủ hạng; SME thấy hạng và XP của từng ứng viên khi xét đơn. Ngưỡng hạng lấy từ backend. | M |

### 3.5 Ghép nối — module `matching`

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-MAT-01 | Hệ thống tính điểm phù hợp giữa dự án và cá nhân dựa trên mức trùng khớp kỹ năng, theo một quy tắc tường minh và có thể kiểm thử bằng unit test. | M |
| FR-MAT-02 | Cá nhân xem danh sách dự án `PUBLISHED` được gợi ý, sắp xếp giảm dần theo điểm phù hợp. | M |
| FR-MAT-03 | SME xem danh sách ứng viên của dự án mình sắp xếp theo điểm phù hợp. | M |
| FR-MAT-04 | Điểm phù hợp là thông tin tham khảo, không tự động chấp nhận hay loại bỏ ứng tuyển. | M |

### 3.6 Milestone và bàn giao — module `milestones`

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-MIL-01 | SME định nghĩa các milestone cho dự án đã giao, mỗi milestone gồm tiêu đề, mô tả kết quả bàn giao, hạn chót và phần ngân sách phân bổ. | M |
| FR-MIL-02 | Tổng ngân sách phân bổ cho các milestone bằng đúng ngân sách dự án. | M |
| FR-MIL-03 | Cá nhân được phân công nộp kết quả bàn giao cho một milestone (tệp và/hoặc liên kết), chuyển milestone sang `SUBMITTED`. | M |
| FR-MIL-04 | SME nghiệm thu (`SUBMITTED → ACCEPTED`) hoặc yêu cầu chỉnh sửa kèm lý do bắt buộc (`SUBMITTED → CHANGES_REQUESTED`). | M |
| FR-MIL-05 | Cá nhân nộp lại kết quả sau khi bị yêu cầu chỉnh sửa; hệ thống giữ toàn bộ lịch sử các lần nộp, không ghi đè. | M |
| FR-MIL-06 | Hệ thống ghi nhận trạng thái thanh toán **mô phỏng** cho mỗi milestone (`PENDING_FUNDING` → `FUNDED` → `RELEASED`) do SME và quản trị viên đánh dấu thủ công. Hệ thống không chuyển tiền thật. | M |
| FR-MIL-07 | Giao diện hiển thị rõ ràng rằng escrow ở MVP là mô phỏng và thanh toán diễn ra ngoài nền tảng. | M |
| FR-MIL-08 | Cả hai bên xem tiến độ dự án theo từng milestone với trạng thái và hạn chót. | M |
| FR-MIL-09 | Tệp bàn giao được lưu ở object storage; cơ sở dữ liệu chỉ lưu metadata và khóa đối tượng. | M |

### 3.7 Đánh giá — module `reviews`

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-REV-01 | SME đánh giá cá nhân thực hiện sau khi dự án `COMPLETED`, gồm điểm số và nhận xét. | M |
| FR-REV-02 | Đánh giá chỉ được tạo một lần cho mỗi cặp dự án–cá nhân, và không được sửa sau khi gửi. | M |
| FR-REV-03 | Đánh giá đã gửi hiển thị trên hồ sơ công khai của cá nhân. | M |
| FR-REV-04 | Đánh giá hai chiều (cá nhân đánh giá SME) **không** thuộc MVP. | — |

### 3.8 Portfolio và chứng nhận — module `certificates` (đã bỏ)

Portfolio xác thực (FR-CERT-01…05) đã bị loại khỏi phạm vi. CV chỉ là dữ liệu tự khai để SME tham khảo; `READY` chỉ có nghĩa tệp hợp lệ và an toàn về kỹ thuật, không phải nội dung hay kỹ năng đã được GenDA xác minh. Bằng chứng đáng tin cậy hơn được hình thành từ đánh giá của SME sau dự án (FR-REV-01…03).

### 3.9 Quản trị — module `admin`

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-ADM-01 | Quản trị viên xem riêng hàng đợi dự án `PENDING_REVIEW` và hồ sơ SME `PENDING`. Quản trị viên không duyệt nội dung CV, học vấn hoặc loại nền tảng tự khai của contributor để mở quyền ứng tuyển. | M |
| FR-ADM-02 | Mọi hành động hỗ trợ của quản trị viên ghi bản ghi kiểm toán gồm người thực hiện, đối tượng, hành động, lý do và thời điểm. | M |
| FR-ADM-03 | Quản trị viên xem nhật ký chuyển trạng thái của một dự án để xử lý khiếu nại. | M |
| FR-ADM-04 | Quản trị viên khóa hoặc mở khóa một tài khoản kèm lý do bắt buộc. | S |

### 3.10 Trợ lý tìm việc — module `assistant`

Đặc tả đầy đủ: [`assistant.md`](./assistant.md). Trợ lý là **hệ quy tắc**, không dùng AI, cùng ràng buộc với matching ở mục 1. Mọi yêu cầu ở đây là `S`: bỏ đi không ảnh hưởng vòng đời MVP.

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-AST-01 | Hệ thống suy ra các lời nhắc cho sinh viên từ dữ liệu của chính sinh viên đó (hồ sơ, đơn, mốc bàn giao, đánh giá, dự án đang công khai) theo các quy tắc và ngưỡng tường minh ở `assistant.md` mục 4, kiểm thử được bằng unit test. | S |
| FR-AST-02 | Khi sinh viên có từ 2 đơn bị từ chối liên tiếp trở lên, trợ lý chỉ ra tối đa 3 nguyên nhân sửa được (nộp lệch kỹ năng, thiếu một kỹ năng lặp lại, thư ngỏ dùng lại hoặc sơ sài, CV cũ) kèm một bước làm tiếp. | S |
| FR-AST-03 | Khi đơn chờ từ 7 ngày trở lên chưa có phản hồi, trợ lý báo số ngày chờ và gợi ý dự án khác đang khớp. | S |
| FR-AST-04 | Khi sinh viên quay lại sau từ 7 ngày vắng trở lên, trợ lý chào lại và tóm tắt những thay đổi về đơn, mốc bàn giao và dự án mới khớp trong khoảng vắng. | S |
| FR-AST-05 | Trợ lý tự bật nhiều nhất một lần mỗi phiên với lời nhắc quan trọng nhất chưa nghe; lời nhắc đã nghe không lặp lại cho tới khi tình huống đổi; sinh viên tắt được chế độ tự bật. | S |
| FR-AST-06 | Mỗi lời nhắc nêu dữ liệu đã dẫn tới nó ("Vì sao Gen nói vậy?"). | S |
| FR-AST-07 | Trợ lý chỉ đọc dữ liệu của sinh viên đang đăng nhập, không hiển thị thông tin về ứng viên khác. | S |

### 3.11 Cơ hội ngắn — tính năng `opportunities` (bản demo)

Đặc tả đầy đủ, quy tắc BR-OPP và lý do tách khỏi dự án: [`opportunities.md`](./opportunities.md).

| Mã | Yêu cầu | Mức |
| --- | --- | --- |
| FR-OPP-01 | Doanh nghiệp đã được duyệt đăng tin loại cộng tác viên hoặc sự kiện & workshop, gồm lĩnh vực, thù lao, số chỗ, hình thức, địa điểm, 1–5 buổi và điều kiện tham gia. | M |
| FR-OPP-02 | Thù lao tối thiểu 50.000đ; sự kiện tính theo người, cộng tác viên tính theo buổi; luôn hiển thị kèm đơn vị. | M |
| FR-OPP-03 | Tin chỉ gửi duyệt được khi người đăng cam kết không thu phí người tham gia; thẻ và trang chi tiết hiện nhãn "Không thu phí người tham gia". | M |
| FR-OPP-04 | Quản trị viên duyệt hoặc từ chối tin (từ chối bắt buộc có lý do); tin chưa duyệt không công khai. | M |
| FR-OPP-05 | Cá nhân đã xác minh email đăng ký một chạm, không CV. Sự kiện giữ chỗ ngay; cộng tác viên chờ chủ tin nhận hoặc từ chối. | M |
| FR-OPP-06 | Hết chỗ thì đóng đăng ký; hủy đăng ký trả lại chỗ. | M |
| FR-OPP-07 | Trang "Tìm cơ hội" có ba tab loại kèm số tin; tab cơ hội ngắn lọc theo lĩnh vực, thù lao, hình thức và nhóm theo ngày diễn ra. | M |
| FR-OPP-08 | Người tham gia xem lịch đã đăng ký ở "Đơn của tôi"; chủ tin xem tin của mình kèm số người đã chốt và chờ duyệt. | M |

## 4. Quy tắc nghiệp vụ

Bất biến áp dụng xuyên suốt mọi use case. Vi phạm trả về lỗi miền ổn định theo `docs/api-conventions.md`, không phải lỗi 500.

| ID | Quy tắc |
| --- | --- |
| BR-01 | Chỉ SME sở hữu mới tạo hoặc sửa dự án nháp của mình. |
| BR-02 | Chỉ quản trị viên mới publish hoặc từ chối một dự án chờ duyệt. |
| BR-03 | Cá nhân chỉ được gửi application hoặc chấp nhận SME invitation khi tài khoản hoạt động, email đã xác minh, hồ sơ bắt buộc hoàn tất và CV ở trạng thái `READY`. |
| BR-04 | Cá nhân không được ứng tuyển vào dự án chưa publish hoặc đã hủy. |
| BR-05 | Mỗi dự án có tối đa một ứng tuyển ở trạng thái `ACCEPTED`. |
| BR-06 | Một ứng tuyển được chấp nhận thuộc về tối đa một phân công dự án đang hoạt động. |
| BR-07 | Milestone không được nghiệm thu khi chưa có kết quả bàn giao ở trạng thái `SUBMITTED`. |
| BR-08 | Chỉ dự án `COMPLETED` mới được SME gửi đánh giá cho cá nhân thực hiện. |
| BR-09 | Mọi hành vi chấp nhận và từ chối ghi lại người thực hiện và thời điểm. |
| BR-10 | Ngân sách dự án nằm trong khoảng 1.000.000 – 5.000.000 VNĐ. |
| BR-11 | Hạn chót dự án phải ở tương lai tại thời điểm publish. |
| BR-12 | Chuyển trạng thái không hợp lệ bị từ chối; không có đường tắt bỏ qua trạng thái trung gian. |
| BR-13 | Chuyển trạng thái tác động nhiều bản ghi thực hiện trong một transaction. |
| BR-14 | Nền tảng không thu phí và không xử lý dòng tiền thật ở MVP. |
| BR-15 | Email đã xác minh chỉ chứng minh quyền kiểm soát hộp thư. `backgroundType = STUDENT` và Education đều là thông tin tự khai, không chứng minh người dùng đang là sinh viên hoặc có năng lực nghề nghiệp. |
| BR-16 | Học vấn là phần hồ sơ tùy chọn: contributor có thể không khai học vấn mà vẫn hoàn tất profile và đủ điều kiện ứng tuyển nếu thỏa các điều kiện còn lại. |
| BR-17 | Tài khoản SME chỉ được nhận phiên xác thực đầy đủ và tạo dự án khi email đã xác minh, hồ sơ doanh nghiệp ở trạng thái `VERIFIED` và tài khoản đang hoạt động. |
| BR-18 | Tại thời điểm `DRAFT → PENDING_REVIEW` và `PENDING_REVIEW → PUBLISHED`, ngân sách dự án phải nằm trong khoảng ngân sách (tính cả hai đầu mút) của project level đã chọn theo FR-PRJ-10. |
| BR-19 | Quản trị viên không được publish dự án có project level khai báo thấp hơn đáng kể so với scope/deliverables; dự án phải quay lại `DRAFT` để SME sửa, admin không tự ý thay đổi nội dung hoặc ngân sách thay SME. |
| BR-20 | XP và hạng không phải dữ liệu nhập tay: backend suy ra từ lịch sử dự án đủ điều kiện với trọng số `BASIC = 1`, `MEDIUM = 2`, `HIGH = 3`, trong đó tổng XP từ `BASIC` được tính tối đa 10; application không được chấp nhận, dự án chưa `COMPLETED` hoặc milestone chưa nghiệm thu không tạo điểm. Trong MVP, hạng không bị giảm. |
| BR-21 | Hạng là Đồng khi dưới 10 XP, Bạc khi từ 10 XP, Vàng khi từ 30 XP. Eligibility tự ứng tuyển theo level là `BASIC`: mọi hạng, `MEDIUM`: từ hạng Bạc, `HIGH`: hạng Vàng. Không level nào yêu cầu contributor đã từng hoàn thành chính level đó để mở khóa lần đầu. |
| BR-22 | SME invitation chỉ được miễn điều kiện hạng Bạc cho project `MEDIUM` do chính SME sở hữu; invitation không miễn readiness chung, phải được audit và chỉ tạo application `SUBMITTED` sau khi contributor chấp nhận. |
| BR-23 | Trong MVP, SME invitation hoặc CV/kinh nghiệm tự khai không được vượt eligibility gate của project `HIGH`; admin không duyệt nội dung CV để cấp ngoại lệ. |

BR-01 đến BR-09 đồng nhất với bất biến trong `docs/domain-model.md`. BR-10 đến BR-23 là ràng buộc bổ sung của MVP và quyết định sản phẩm hiện hành.

## 5. Yêu cầu phi chức năng

| ID | Hạng mục | Yêu cầu |
| --- | --- | --- |
| NFR-SEC-01 | Bảo mật | Mật khẩu băm bằng bcrypt. Token có thời hạn. Không ghi log dữ liệu nhạy cảm hay token. |
| NFR-SEC-02 | Bảo mật | Phân quyền cưỡng chế ở tầng API; kiểm tra quyền phía giao diện chỉ phục vụ trải nghiệm. |
| NFR-SEC-03 | Bảo mật | CV, minh chứng và tệp bàn giao được lưu riêng tư; liên kết tải chỉ cấp cho chủ sở hữu hoặc người có quyền nghiệp vụ và có thời hạn. |
| NFR-SEC-04 | Bảo mật | OTP không được lưu dạng rõ hoặc ghi log; hệ thống giới hạn số lần xác nhận/gửi lại theo tài khoản, email và nguồn yêu cầu để giảm brute force và spam. |
| NFR-PRIV-01 | Dữ liệu cá nhân | Chỉ thu thập dữ liệu cần thiết cho vận hành nền tảng; công bố mục đích thu thập trong chính sách bảo mật. |
| NFR-PRIV-02 | Dữ liệu cá nhân | Người dùng yêu cầu chỉnh sửa hoặc xóa dữ liệu cá nhân của mình; hồ sơ giao dịch giữ lại theo quy định và được ẩn danh khi xóa tài khoản. |
| NFR-PRIV-03 | Pháp lý | Nền tảng công bố quy chế hoạt động, điều khoản sử dụng, chính sách bảo mật và quy trình khiếu nại trước khi mở vận hành chính thức. |
| NFR-AUD-01 | Kiểm toán | Mọi chuyển trạng thái miền ghi lại người thực hiện, thời điểm và lý do khi có. |
| NFR-PERF-01 | Hiệu năng | Danh sách dự án và ứng viên trả về dưới 1 giây ở quy mô pilot (≤ 1.000 dự án, ≤ 1.000 người dùng). |
| NFR-PERF-02 | Hiệu năng | Mọi endpoint trả danh sách đều phân trang; không có endpoint trả toàn bộ bảng. |
| NFR-UX-01 | Giao diện | Giao diện tiếng Việt, ưu tiên mobile-first, HTML ngữ nghĩa và hỗ trợ bàn phím. |
| NFR-UX-02 | Giao diện | Mọi màn hình gọi API thể hiện rõ năm trạng thái khi áp dụng: loading, rỗng, lỗi, thành công và bị chặn kèm cách gỡ chặn. |
| NFR-OPS-01 | Vận hành | Hạ tầng nằm trong dự toán 3.000.000 VNĐ cho 6 tháng; chọn phương án lưu trữ và hosting theo ràng buộc này. |
| NFR-OPS-02 | Vận hành | Lỗi trả về mã lỗi ổn định kèm `requestId` để truy vết. |
| NFR-TEST-01 | Kiểm thử | Mỗi tính năng có trạng thái đều phủ ma trận tối thiểu trong `docs/testing-strategy.md`. |
| NFR-DATA-01 | Dữ liệu | Số tiền lưu dưới dạng số nguyên đồng VNĐ, không dùng kiểu dấu phẩy động. |

## 6. Tiêu chí nghiệm thu

Vòng đời MVP được coi là hoàn tất khi các kịch bản sau chạy được đầu–cuối trên dữ liệu seed xác định:

1. **Đăng ký và xác minh email** — Đăng ký tạo tài khoản chưa xác minh và gửi OTP nhưng chưa cấp phiên đầy đủ. OTP sai, hết hạn, đã dùng hoặc vượt quá 5 lần thử bị từ chối; OTP mới làm mã cũ mất hiệu lực. OTP hợp lệ xác minh email; contributor có thể tiếp tục onboarding, còn SME chuyển hồ sơ doanh nghiệp sang hàng đợi và vẫn chưa được đăng nhập đầy đủ (FR-AUTH-03, FR-AUTH-04, FR-AUTH-06, FR-USR-12).
2. **Hoàn thiện điều kiện ứng tuyển** — Cá nhân đã xác minh email vẫn xem được dự án ở mọi project level. Hệ thống từ chối tệp không phải PDF hợp lệ, quá 2 MB, hỏng hoặc khóa bằng mật khẩu; CV hợp lệ chuyển tới `READY`. Thiếu hồ sơ hoặc CV `READY` chỉ chặn tại hành động gửi đơn hoặc chấp nhận lời mời, không chặn duyệt dự án. Không có bản ghi học vấn không làm checklist profile thất bại (FR-USR-07…11, BR-03, BR-16).
3. **Xác minh SME** — SME đã xác minh email nhưng hồ sơ doanh nghiệp còn `PENDING` bị chặn đăng nhập đầy đủ và tạo dự án. Admin từ chối không kèm lý do bị chặn; từ chối hợp lệ chuyển hồ sơ sang `REJECTED` và lưu audit. Khi admin duyệt, hồ sơ chuyển `VERIFIED`; SME đăng nhập và mới có thể tạo dự án (FR-USR-12, FR-USR-13, FR-ADM-01, BR-17).
4. **Tạo và duyệt dự án** — Với policy test xác định, SME chọn từng project level và thấy đúng khoảng ngân sách cùng eligibility; `MEDIUM` với 1.400.000 hoặc `BASIC` với 2.000.000 bị chặn khi gửi duyệt, còn ngân sách đúng bằng đầu mút (ví dụ `BASIC` 1.500.000, `MEDIUM` 1.500.000, `HIGH` 5.000.000) được chấp nhận. Dự án có scope thực tế `HIGH` nhưng khai `BASIC` bị admin trả về `DRAFT` kèm lý do/level đề xuất; sau khi SME sửa level và ngân sách hợp lệ, admin mới publish. Quản trị viên từ chối không kèm lý do bị hệ thống chặn (FR-PRJ-01, FR-PRJ-03, FR-PRJ-04, FR-PRJ-10, FR-PRJ-11, BR-18, BR-19).
5. **Ứng tuyển, tích lũy kinh nghiệm và lựa chọn** — Contributor mới ở hạng Đồng, tự ứng tuyển `BASIC` thành công nhưng bị chặn khi tự ứng tuyển `MEDIUM`, kèm thông báo cần hạng Bạc và còn thiếu bao nhiêu XP. Contributor có 9 XP từ `BASIC` vẫn ở hạng Đồng; hoàn thành thêm một `BASIC` thì đạt 10 XP, lên hạng Bạc và tự ứng tuyển `MEDIUM`. Hoàn thành thêm `BASIC` sau đó không cộng XP. Contributor có 28 XP bị chặn ở `HIGH`; hoàn thành thêm một `MEDIUM` thì đạt 30 XP, lên hạng Vàng và tự ứng tuyển `HIGH`. Một SME khác có thể mời contributor hạng Đồng vào project `MEDIUM`; contributor đủ readiness chấp nhận lời mời thì application `SUBMITTED` có nguồn `SME_INVITATION`, nhưng không tự động `ACCEPTED`. Invitation vào `HIGH` không vượt gate. Ứng tuyển thứ hai vào cùng dự án bị chặn; khi SME chấp nhận một ứng viên, các ứng viên còn lại chuyển `REJECTED` và dự án sang `IN_PROGRESS` trong cùng transaction (FR-APP-01…12, BR-20…23, BR-13).
6. **Milestone và nghiệm thu** — SME tạo 2 milestone có tổng ngân sách đúng bằng ngân sách dự án; tạo milestone lệch tổng bị chặn (FR-MIL-02). Cá nhân nộp bàn giao; SME yêu cầu chỉnh sửa kèm lý do; cá nhân nộp lại; cả hai lần nộp đều còn trong lịch sử (FR-MIL-05). SME nghiệm thu milestone chưa có bàn giao bị chặn (BR-07).
7. **Hoàn tất và đánh giá** — Sau khi mọi milestone `ACCEPTED`, dự án chuyển `COMPLETED`; SME gửi đánh giá đúng một lần và không sửa được (FR-REV-01…03).
8. **Phân quyền** — Với mỗi use case có trạng thái: truy cập chưa xác thực bị chặn, sai vai trò bị chặn, đúng vai trò nhưng sai chủ sở hữu bị chặn, chuyển trạng thái không hợp lệ bị chặn, và mọi hành động quản trị đều sinh bản ghi kiểm toán (FR-ADM-02).
9. **Học vấn** — Contributor thêm hai bản ghi học vấn, cập nhật một bản ghi và xóa bản ghi còn lại; không thể sửa/xóa bản ghi của người khác. Bản ghi `GRADUATED` hiển thị tên bằng cấp, bản ghi `NOT_COMPLETED` không bị diễn giải thành đã tốt nghiệp, và mọi bản ghi đều có nhãn “Thông tin tự khai” (FR-USR-10, FR-USR-11).

Ngoài ra, điều kiện đóng theo `docs/definition-of-done.md` phải đạt: lint, typecheck, test, build, migration và seed đã rà soát.

## 7. Bảng truy vết

| Nhóm yêu cầu | Module sở hữu | Tài liệu liên quan |
| --- | --- | --- |
| FR-AUTH-01…06 | `auth` | `docs/authorization-matrix.md`, `docs/api-conventions.md` |
| FR-USR-01…13 (`02`–`03` đã loại bỏ) | `users` | `docs/domain-model.md`, `docs/database-conventions.md` |
| FR-PRJ-01…11 | `projects` | `docs/domain-model.md`, `docs/authorization-matrix.md` |
| FR-APP-01…12 | `applications` | `docs/domain-model.md`, `docs/authorization-matrix.md`, `docs/GenDA_Verification_and_Matching_Flow.md` |
| FR-MAT-01…04 | `matching` | `docs/architecture.md`, `docs/testing-strategy.md` |
| FR-MIL-01…09 | `milestones` | `docs/domain-model.md`, `docs/database-conventions.md` |
| FR-REV-01…03 | `reviews` | `docs/domain-model.md` |
| FR-CERT-01…05 | `certificates` | `docs/domain-model.md`, `docs/authorization-matrix.md` |
| FR-ADM-01…04 | `admin` | `docs/authorization-matrix.md` |
| BR-01…23 | Tầng domain của module sở hữu | `docs/domain-model.md`, `docs/architecture.md`, `docs/GenDA_Verification_and_Matching_Flow.md` |
| FR-AST-01…07 | `assistant` | `docs/assistant.md`, `docs/design.md` DD-11 |
| FR-OPP-01…08 | `opportunities` (frontend demo) | `docs/opportunities.md`, `docs/design.md` DD-12 |
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
| AI trích xuất, chấm điểm hoặc phê duyệt nội dung CV | Sau MVP, chỉ hỗ trợ và không làm hard gate |
| Quản trị viên duyệt nội dung CV trước khi cho ứng tuyển | Không triển khai |
| Ngoại lệ cho contributor chưa đủ lịch sử GenDA ứng tuyển project `HIGH` bằng CV hoặc kinh nghiệm ngoài nền tảng | Sau MVP, chỉ khi có quy trình xác minh năng lực riêng |
| Xác minh tư cách sinh viên hoặc dự án chỉ dành riêng cho sinh viên | Không nằm trong hướng sản phẩm hiện tại |
| Upload và xác minh bằng cấp (`EDUCATION_CREDENTIAL`) | Sau MVP; học vấn MVP là thông tin tự khai |
| Trợ lý Gen ở backend, nhắc qua email khi sinh viên vắng, nhắc SME về đơn chờ lâu | V1.1 |
| Trợ lý Gen dùng AI: đọc CV và thư ngỏ, trò chuyện tự do | V2.0 |
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
| OQ-04 | **Stack backend.** Slides ghi Node.js/Express; ADR 0001 từng chọn NestJS. ADR 0002 thay thế stack backend bằng Java/Spring Boot, JPA và Flyway; modular monolith được giữ nguyên. Tài liệu này theo nguồn kỹ thuật hiện hành. | Slides vs. ADR 0002 |
| OQ-05 | **Quyền sở hữu sản phẩm bàn giao.** Mô tả dự án 2.3.8 yêu cầu quy định rõ quyền sở hữu, quyền SME sử dụng và quyền sinh viên nêu sản phẩm trong CV. Cần văn bản pháp lý trước khi vận hành thật. | Mô tả dự án 2.3.8 |
| OQ-06 | **Đăng ký sàn TMĐT.** Mô tả dự án 2.3.8 nêu nghĩa vụ rà soát đăng ký website cung cấp dịch vụ TMĐT với Bộ Công Thương khi vận hành chính thức. Ảnh hưởng thời điểm mở public, không ảnh hưởng MVP pilot. | NĐ 52/2013, NĐ 85/2021 |
| OQ-07 | **Lưu trữ tệp.** `docs/database-conventions.md` yêu cầu object storage nhưng chưa chọn nhà cung cấp; ràng buộc chi phí là NFR-OPS-01. Cần một ADR. | `docs/database-conventions.md` |
| OQ-10 | **Lý do đóng đơn có cấu trúc.** Trợ lý hiện chỉ suy luận nguyên nhân trượt từ dữ liệu (FR-AST-02). Cho SME chọn một lý do có cấu trúc khi đơn bị đóng sẽ làm lời khuyên chính xác hơn, nhưng thêm một bước cho SME và đụng tới FR-APP-05 (đơn còn lại tự động `REJECTED`). Cần chốt trước khi dựng module `assistant` ở backend. | `docs/assistant.md` mục 7 |
| OQ-09 | **Cơ hội ngắn lên backend.** Bản demo chưa có điểm danh, xác nhận đã trả thù lao và cách xử lý tiền cho khoản nhỏ nhiều người. Cần chốt trước khi dựng module `opportunities`: GenDA chỉ ghi nhận hay giữ tiền, (cổng CV ở `/projects` đã được gỡ ngày 2026-10-09: CV chỉ cần khi ứng tuyển dự án). | `docs/opportunities.md` mục 6 |

**Xung đột phạm vi đã giải quyết (2026-10-07):** nguồn nghiệp vụ cũ mô tả GenDA chỉ dành cho sinh viên và yêu cầu xác minh email trường/thẻ sinh viên. Quyết định sản phẩm hiện hành mở vai trò nhận dự án thành `CONTRIBUTOR` và loại bỏ xác minh tư cách sinh viên. `STUDENT` chỉ còn là `backgroundType` tự khai; quyết định này thay thế phạm vi actor và verification cũ, nhưng không thay đổi giới hạn một cá nhân trên mỗi dự án của MVP. Học vấn được quản lý như dữ liệu hồ sơ nghề nghiệp tự khai.

**Xung đột complexity đã giải quyết (2026-10-07):** flow legacy chấp nhận rủi ro SME tự khai level thấp. Quyết định hiện hành không chấp nhận rủi ro đó: khoảng ngân sách theo level là lớp kiểm tra định lượng, còn admin review scope là lớp phát hiện under-classification trước khi publish (FR-PRJ-10..11, BR-18..19).

**Eligibility theo project level đã chốt (2026-10-07):** `GENERAL` không còn là project type riêng. `BASIC`, `MEDIUM`, `HIGH` là một trục project level duy nhất, đồng thời điều khiển complexity, khoảng ngân sách và application eligibility. MVP dùng progression `BASIC = 1`, `MEDIUM = 2`, `HIGH = 3` XP. SME invitation chỉ miễn điều kiện cho `MEDIUM`, không vượt readiness chung hoặc gate `HIGH`. Ngưỡng điểm của bản này được thay bằng hệ hạng ngày 2026-10-09 (xem dưới).

**Khoảng ngân sách theo project level đã chốt (2026-10-09, OQ-08):** `BASIC` 1.000.000–1.500.000, `MEDIUM` 1.500.000–3.500.000, `HIGH` 3.500.000–5.000.000 VNĐ, tính cả hai đầu mút. Policy có cả sàn lẫn trần: level thấp không được nhận ngân sách vượt trần của level đó. Admin review theo FR-PRJ-11 vẫn là lớp kiểm soát SME khai level thấp hơn scope (FR-PRJ-10, BR-18).

**Hạng contributor đã chốt (2026-10-09):** XP quy ra ba hạng giới hạn level được tự ứng tuyển: Đồng (mặc định, `BASIC`), Bạc (từ 10 XP, thêm `MEDIUM`), Vàng (từ 30 XP, thêm `HIGH`). XP từ `BASIC` tính tối đa 10, nên 20 XP để lên Vàng phải đến từ `MEDIUM`. Trần này thay điều kiện "đã hoàn thành ít nhất 1 project `MEDIUM`" và ngăn người hạng cao cày điểm bằng project `BASIC`. Hạng không giảm trong MVP. Contributor thấy thanh kinh nghiệm; SME thấy hạng của ứng viên (FR-APP-08, FR-APP-09, FR-APP-12, BR-20, BR-21).

## 10. Giả định và rủi ro

**Giả định**

- Người dùng có quyền truy cập email đã đăng ký để nhận OTP.
- SME sẵn sàng thanh toán ngoài nền tảng trong giai đoạn escrow mô phỏng.
- Phạm vi công việc mỗi dự án đủ nhỏ để một cá nhân hoàn thành trong vài ngày đến vài tuần.
- Quản trị viên duyệt dự án thủ công ở quy mô pilot; hàng đợi duyệt không cần tự động hóa.

**Rủi ro**

| Rủi ro | Ảnh hưởng | Giảm thiểu ở MVP |
| --- | --- | --- |
| Escrow mô phỏng không ngăn được việc bùng tiền | Mất niềm tin — chính là vấn đề nền tảng muốn giải | Ghi nhận trạng thái thanh toán tường minh, giới hạn ngân sách 1–5 triệu, hiển thị rõ giới hạn của escrow mô phỏng (FR-MIL-07) |
| SME giao việc vượt phạm vi đã thỏa thuận | Cá nhân thực hiện bị thiệt, bỏ nền tảng | Phạm vi và tiêu chí nghiệm thu bắt buộc khai lúc đăng dự án (FR-PRJ-01); milestone cố định ngân sách (FR-MIL-02) |
| SME cố tình khai complexity thấp để trả giá rẻ | Contributor nhận scope khó với ngân sách không tương xứng | Khoảng ngân sách tăng dần theo level (FR-PRJ-10, BR-18) và admin trả dự án về `DRAFT` khi scope không khớp level (FR-PRJ-11, BR-19) |
| Contributor và SME tạo các project `BASIC` hình thức để farm experience points | Eligibility `MEDIUM`/`HIGH` mất giá trị và làm sai trust signal | Chỉ tính project thực sự `COMPLETED`, application `ACCEPTED` và toàn bộ milestone đã nghiệm thu; XP từ `BASIC` tính tối đa 10 nên không thể cày lên hạng Vàng bằng `BASIC`; lưu audit để phát hiện chuỗi giao dịch bất thường (FR-APP-08, BR-20, BR-21) |
| SME lạm dụng invitation để đưa contributor chưa có lịch sử vào project khó | Contributor nhận scope vượt năng lực và gate trở nên vô nghĩa | Invitation chỉ miễn điểm cho `MEDIUM`, hiển thị cảnh báo, ghi audit và không tự động accept; `HIGH` không cho bypass trong MVP (FR-APP-10…11, BR-22…23) |
| Tranh chấp lúc nghiệm thu | Bế tắc, cần can thiệp thủ công | Lịch sử bàn giao không ghi đè (FR-MIL-05), nhật ký chuyển trạng thái cho quản trị viên (FR-ADM-03) |
| Thị trường hai phía lệch cung cầu | Không có giao dịch để kiểm chứng | Ngoài phạm vi kỹ thuật; thuộc kế hoạch GTM ba giai đoạn |
