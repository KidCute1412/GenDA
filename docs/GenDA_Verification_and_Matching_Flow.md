# GenDA — Verification & Matching Flow

> Historical flow reference only: email OTP verification has been deferred from the MVP. Current registration creates an ACTIVE account; users sign in with email and password without OTP or SME approval. See docs/decisions/0004-defer-email-verification.md.

## Project Creation — Complexity & Budget Range Guard

Luồng tạo và duyệt dự án áp dụng hai lớp kiểm soát độc lập:

```text
SME đã được xác minh doanh nghiệp
        ↓
Tạo project DRAFT, khai báo scope/deliverables/skills/deadline/milestones
        ↓
Chọn complexity: BASIC / MEDIUM / HIGH
        ↓
Hệ thống hiển thị khoảng ngân sách tương ứng
        ↓
minBudget(level) <= budget <= maxBudget(level)?
        ├─ Không → chặn gửi duyệt; SME chỉnh budget hoặc điều chỉnh scope/level
        └─ Có    → chuyển PENDING_REVIEW
                         ↓
             Admin đối chiếu scope với complexity
        ├─ Không phù hợp → trả về DRAFT, bắt buộc ghi lý do và gợi ý level
        └─ Phù hợp       → PUBLISHED
```

| Project level | Khoảng ngân sách (VNĐ) | Điều kiện tự ứng tuyển |
|---|---:|---|
| `BASIC` | 1.000.000 – 1.500.000 | Mọi hạng, kể cả hạng Đồng mặc định |
| `MEDIUM` | 1.500.000 – 3.500.000 | Hạng Bạc trở lên **hoặc** được SME của project chủ động mời |
| `HIGH` | 3.500.000 – 5.000.000 | Chỉ hạng Vàng |

Khoảng ngân sách theo level đã chốt ngày 2026-10-09 (OQ-08). Cả hai đầu mút đều được tính: 1.500.000 hợp lệ cho cả `BASIC` lẫn `MEDIUM`, 3.500.000 hợp lệ cho cả `MEDIUM` lẫn `HIGH`. Ba khoảng nối liền nhau và phủ đúng khoảng ngân sách MVP 1.000.000–5.000.000 VNĐ (BR-10). Giá trị là policy phía server; frontend chỉ hiển thị policy lấy từ backend.

Khoảng ngân sách chặn hai trường hợp: chọn level cao nhưng trả dưới sàn của level đó, và chọn level thấp với ngân sách vượt trần của level đó (ví dụ 2.000.000 không thể khai `BASIC`). Nó không tự ngăn SME gắn nhãn `BASIC` cho một scope thực tế phức tạp với ngân sách 1–1,5 triệu. Vì vậy admin phải đánh giá scope, deliverables, kỹ năng yêu cầu, deadline và milestones trước khi publish. Admin không được âm thầm đổi nội dung, complexity hoặc budget thay SME; SME phải tự thu hẹp scope hoặc chọn level/budget phù hợp rồi gửi duyệt lại.

Quyết định này thay thế quan điểm legacy chấp nhận rủi ro SME tự khai complexity thấp. Backend là nguồn chính sách duy nhất và phải kiểm tra lại ở cả `DRAFT → PENDING_REVIEW` lẫn `PENDING_REVIEW → PUBLISHED`.

### Project level đồng thời điều khiển eligibility

Target model không dùng `GENERAL` như một project type riêng. SME chọn một `projectLevel = BASIC | MEDIUM | HIGH`; level đó đồng thời quyết định độ phức tạp, khoảng ngân sách và yêu cầu kinh nghiệm khi ứng tuyển.

Không yêu cầu contributor phải từng hoàn thành project **cùng level** mới được ứng tuyển level đó, vì điều này tạo vòng lặp không thể mở khóa. Kinh nghiệm được tích lũy từ level thấp lên thành điểm kinh nghiệm (XP), và XP quy ra **hạng** của contributor:

```text
Hoàn thành BASIC  = +1 XP   (XP từ BASIC chỉ được tính tối đa 10)
Hoàn thành MEDIUM = +2 XP
Hoàn thành HIGH   = +3 XP
```

### Hạng contributor và thanh kinh nghiệm

Đã chốt ngày 2026-10-09. Hạng là bậc giới hạn level dự án mà contributor được **tự** ứng tuyển:

| Hạng | XP tối thiểu | Tự ứng tuyển được | Lộ trình điển hình |
|---|---:|---|---|
| Đồng (`BRONZE`) | 0 | `BASIC` | Hạng mặc định của mọi contributor |
| Bạc (`SILVER`) | 10 | `BASIC`, `MEDIUM` | Khoảng 10 project `BASIC` |
| Vàng (`GOLD`) | 30 | `BASIC`, `MEDIUM`, `HIGH` | Thêm 20 XP sau hạng Bạc, tức khoảng 10 project `MEDIUM` |

XP từ `BASIC` có trần 10 điểm, bằng đúng ngưỡng hạng Bạc. Trần này có hai tác dụng:

- 20 XP còn lại để lên Vàng phải đến từ `MEDIUM`, vì hạng Bạc chưa tự ứng tuyển được `HIGH`. Hạng Vàng vì thế luôn có nghĩa contributor đã hoàn thành ít nhất 10 project `MEDIUM`. Điều kiện này thay cho điều kiện cũ "đã hoàn thành ít nhất 1 project `MEDIUM`".
- Người đã lên hạng không còn lý do lấy project `BASIC` chỉ để cày điểm, chiếm chỗ của người mới.

Contributor hạng cao vẫn được ứng tuyển `BASIC`. Project đó vẫn vào lịch sử hoàn thành nhưng không cộng XP khi XP từ `BASIC` đã chạm trần.

Quy tắc khác:

- Trong MVP, hạng không bị giảm.
- Không có hạng trên Vàng; XP vẫn tiếp tục được cộng.
- Ngưỡng hạng, trọng số XP và trần `BASIC` là policy phía server, giống khoảng ngân sách. Frontend lấy chúng từ backend để vẽ thanh kinh nghiệm và không tự quyết quyền ứng tuyển.
- Hạng phản ánh lịch sử hoàn thành trên GenDA, không phải xác minh kỹ năng. Giao diện không gọi hạng là "đã xác thực".

Thanh kinh nghiệm hiển thị hạng hiện tại, XP và khoảng còn thiếu tới hạng kế tiếp, ví dụ "Hạng Đồng · 7/10 XP · còn 3 XP để lên Bạc". Thanh xuất hiện ở hồ sơ contributor và ở dự án mà contributor chưa đủ hạng. SME thấy hạng và XP của từng ứng viên khi xét đơn.

Baseline policy cho MVP:

```text
Người mới: hạng Đồng, 0 XP
   ↓
Hoàn thành project BASIC (+1 XP mỗi project, tối đa 10 XP)
   ↓
10 XP → hạng Bạc: tự ứng tuyển được MEDIUM
   ↓
Hoàn thành project MEDIUM (+2 XP mỗi project)
   ↓
30 XP → hạng Vàng: tự ứng tuyển được HIGH
```

Một project chỉ được tính vào kinh nghiệm khi thỏa toàn bộ điều kiện:

```text
project.status == COMPLETED
&& contributor là người có application ACCEPTED
&& toàn bộ milestone đã được nghiệm thu
```

Application gate được backend kiểm tra tại thời điểm submit:

```text
Contributor xem được project ở mọi level
        ↓
Nhấn Ứng tuyển
        ↓
accountActive && emailVerified && profileComplete && cv.status == READY?
        ├─ Không → chặn và hiển thị bước còn thiếu
        └─ Có
             ↓
        Kiểm tra projectLevel
        ├─ BASIC  → cho submit application
        ├─ MEDIUM → tier >= SILVER hoặc có SME invitation hợp lệ
        └─ HIGH   → tier == GOLD
```

Contributor không đủ điều kiện vẫn xem được toàn bộ nội dung project. Giao diện khóa hành động submit và nêu chính xác điều kiện còn thiếu, ví dụ: “Dự án Trung bình cần hạng Bạc. Bạn đang ở hạng Đồng (7/10 XP), còn 3 XP nữa.”

### SME invitation cho MEDIUM

SME có thể mời một contributor chưa đạt hạng Bạc vào project `MEDIUM` của chính mình. Cơ chế này hỗ trợ người đã có kinh nghiệm bên ngoài nhưng mới tham gia GenDA, nhưng không bỏ qua email verification, profile completeness hoặc CV `READY`.

```text
SME chọn contributor chưa đủ lịch sử
        ↓
Hệ thống cảnh báo điều kiện đang được miễn
        ↓
SME xác nhận gửi lời mời
        ↓
Contributor chấp nhận lời mời
        ↓
Tạo Application SUBMITTED
eligibilitySource = SME_INVITATION
```

Lời mời chỉ cho phép đi vào quy trình ứng tuyển, không tự động `ACCEPTED` và không tự động giao project. Hệ thống ghi lại SME, project, contributor, thời điểm gửi/chấp nhận và điều kiện được miễn để phục vụ audit.

Trong MVP, lời mời của SME không vượt qua gate của `HIGH`. Contributor chỉ được ứng tuyển `HIGH` khi đạt hạng Vàng. Project `MEDIUM` hoàn thành nhờ lời mời vẫn cộng 2 XP như bình thường. Ngoại lệ dựa trên kinh nghiệm ngoài GenDA chỉ được bổ sung sau khi có một quy trình xác minh năng lực riêng; admin hiện không duyệt nội dung CV để cấp ngoại lệ này.

## 1. Quyết định phạm vi

GenDA phục vụ vai trò cá nhân dùng chung `CONTRIBUTOR`; sinh viên là phân khúc trọng tâm ban đầu, không phải điều kiện bắt buộc để mở tài khoản hoặc ứng tuyển dự án `GENERAL`.

Mô hình niềm tin được tách thành ba lớp, không dùng một nhãn “đã xác thực” cho nhiều ý nghĩa khác nhau:

1. **Email verified:** người dùng kiểm soát email đăng ký.
2. **Application ready:** tài khoản hoạt động, hồ sơ hoàn tất và CV hợp lệ về kỹ thuật.
3. **Platform reputation:** đánh giá và lịch sử dự án thật trên GenDA.

Không lớp nào tự động chứng minh toàn bộ năng lực chuyên môn của cá nhân.

## 2. Đăng ký và xác thực email bằng OTP

```text
Chọn vai trò CONTRIBUTOR hoặc SME
        ↓
Nhập email, mật khẩu và thông tin đăng ký bắt buộc
        ↓
Tạo tài khoản PENDING_EMAIL_VERIFICATION
        ↓
Gửi OTP 6 chữ số tới email đăng ký
        ↓
Nhập OTP
   ┌────┴──────────────────────────┐
   │ hợp lệ                        │ sai/hết hạn/đã dùng
   ↓                               ↓
EMAIL_VERIFIED                 Giữ trạng thái pending
   ↓                               ↓
Contributor: tiếp tục onboarding   Cho thử lại hoặc gửi lại có giới hạn
SME: tiếp tục chờ admin duyệt
```

Quy tắc OTP của MVP:

- OTP gồm 6 chữ số, dùng một lần và mặc định hết hạn sau 10 phút; thời lượng có thể cấu hình.
- Tối đa 5 lần nhập sai cho một mã. Vượt ngưỡng thì mã bị khóa.
- Chỉ gửi lại sau tối thiểu 60 giây; mã mới làm mã cũ mất hiệu lực.
- Giới hạn tần suất theo tài khoản/email và nguồn yêu cầu để chống brute force, spam và email enumeration.
- Chỉ lưu hash của OTP cùng expiry, số lần sai, thời điểm gửi và thời điểm sử dụng; không log OTP rõ.
- Đăng ký chưa cấp access/refresh session đầy đủ. Chỉ sau email verification và các gate riêng của vai trò mới cho phép đăng nhập/tiếp tục.

Email verification chỉ chứng minh quyền kiểm soát hộp thư. Với SME, admin approval vẫn là một gate độc lập.

## 3. Verification Flow — SME

### 3.1. Đăng ký và nộp thông tin doanh nghiệp

Khi chọn vai trò `SME`, người dùng cung cấp:

- tên doanh nghiệp;
- email đăng ký;
- mã số thuế Việt Nam; nếu chưa có thì cung cấp website hoặc trang doanh nghiệp để đối chiếu;
- người đại diện hoặc người phụ trách đăng dự án;
- thông tin liên hệ;
- lĩnh vực và quy mô doanh nghiệp.

```text
SME Register + Business Information
        ↓
Verify Registered Email by OTP
        ↓
Business Verification = PENDING
```

Xác minh email chỉ chứng minh SME kiểm soát hộp thư đăng ký. Nó không tự động chứng minh doanh nghiệp hoặc người đại diện là hợp lệ.

### 3.2. Admin xác minh doanh nghiệp

Trong giai đoạn pilot, admin thực hiện review thủ công dựa trên những nguồn phù hợp với hồ sơ:

- đối chiếu mã số thuế và tên doanh nghiệp;
- email tên miền doanh nghiệp nếu có;
- website hoặc trang doanh nghiệp;
- thông tin người đại diện/người phụ trách;
- liên hệ xác nhận khi dữ liệu chưa đủ rõ.

```text
Business Verification = PENDING
        ↓
Admin Review
   ┌────┴───────────────────────┐
   │ hợp lệ                     │ không hợp lệ/không đủ căn cứ
   ↓                            ↓
VERIFIED                    REJECTED
   ↓                            ↓
Cho phép full session       Lưu lý do từ chối
và tạo dự án               Không được tạo dự án
```

Mọi quyết định approve/reject phải ghi người thực hiện, thời điểm và lý do khi từ chối. Chỉ SME đồng thời có `emailVerified = true`, business verification `VERIFIED` và tài khoản hoạt động mới nhận phiên đầy đủ và tạo dự án.

Flow này xác minh danh tính/tính hợp lệ của bên đăng việc; nó không phải bảo chứng rằng mọi dự án của SME đều hợp lệ. Từng dự án vẫn phải qua vòng `PENDING_REVIEW → PUBLISHED` riêng.

## 4. Onboarding cá nhân và quyền ứng tuyển GENERAL

```text
Email đã xác minh
        ↓
Hoàn thiện contributor profile
        ↓
Tải CV PDF
        ↓
CV được kiểm tra kỹ thuật/an toàn
        ↓
CV READY
        ↓
Đủ điều kiện ứng tuyển dự án GENERAL
```

Hồ sơ contributor gồm tên hiển thị, loại nền tảng, chuyên môn và kỹ năng chuẩn. Loại nền tảng là thông tin tự khai: `STUDENT`, `RECENT_GRADUATE`, `WORKING_PROFESSIONAL`, `FREELANCER`, `CAREER_SWITCHER` hoặc `OTHER`.

Contributor có thể thêm nhiều bản ghi **Education / Học vấn** gồm trường/cơ sở đào tạo, chuyên ngành, bậc học, tên bằng cấp nếu có, thời gian, trạng thái học tập và mô tả. Education là dữ liệu nghề nghiệp tự khai, cho phép ghi đúng cả trường hợp đang học, đã tốt nghiệp, đã hoàn thành hoặc chưa hoàn thành. Không có Education vẫn có thể hoàn tất profile và ứng tuyển `GENERAL`.

Education không đồng nghĩa với credential. GenDA không xác minh tư cách sinh viên; `backgroundType = STUDENT` chỉ là thông tin tự khai. Xác minh bằng cấp `EDUCATION_CREDENTIAL` nằm ngoài MVP.

Quyền ứng tuyển không được lưu bằng một cờ độc lập. Backend suy ra tại thời điểm gửi đơn:

```text
canApplyGeneral = accountActive
               && emailVerified
               && contributorProfileComplete
               && cv.status == READY
```

Contributor đã xác minh email vẫn được xem danh sách và chi tiết dự án khi checklist chưa hoàn tất. Hệ thống chỉ chặn tại hành động gửi đơn và trả lý do cụ thể; frontend hiển thị checklist nhưng không thay thế kiểm tra phía backend.

## 5. Xử lý CV trong MVP

CV là tài liệu tự khai để SME đánh giá ứng viên. GenDA không yêu cầu admin đọc/duyệt nội dung CV và không dùng AI để quyết định cá nhân có được ứng tuyển hay không.

```text
UPLOADING → PROCESSING → READY
                       ↘ REJECTED_TECHNICAL
```

Các kiểm tra tự động bắt buộc:

- dung lượng không quá 2 MB;
- MIME, phần mở rộng và file signature thực sự là PDF;
- tệp đọc được, không hỏng và không khóa bằng mật khẩu;
- kiểm tra an toàn/malware khi môi trường có bộ quét được cấu hình.

`READY` chỉ có nghĩa artifact đạt điều kiện kỹ thuật để lưu và chia sẻ có kiểm soát. Nó không có nghĩa học vấn, kinh nghiệm hoặc kỹ năng trong CV đã được GenDA xác minh. SME xem CV khi xét từng application. CV được lưu riêng tư trong object storage và chỉ cấp quyền truy cập ngắn hạn cho chủ sở hữu hoặc actor có nhu cầu nghiệp vụ hiện tại.

AI trích xuất CV, gợi ý cải thiện hoặc scoring có thể được nghiên cứu sau MVP, nhưng phải minh bạch, có đường kiểm tra của con người và không trở thành hard gate duy nhất.

## 6. Matching và bằng chứng năng lực

Matching MVP là rule-based theo mức trùng khớp giữa kỹ năng chuẩn trong hồ sơ và kỹ năng dự án. Điểm số chỉ hỗ trợ sắp xếp/tham khảo; không tự động chấp nhận hoặc loại ứng viên.

Theo thời gian, bằng chứng đáng tin cậy hơn CV tự khai đến từ:

- dự án GenDA đã hoàn tất;
- milestone và lịch sử bàn giao;
- đánh giá của SME sau dự án.

AI Matching vẫn thuộc V2.0.

## 7. Phân chia ownership

- `auth`: đăng ký, OTP email, trạng thái email, account activation, đăng nhập và session.
- `users`: contributor/SME profile, SME business-verification record, education history, profile completeness, CV lifecycle và kỹ năng.
- `applications`: kiểm tra eligibility qua public application facade của `users`, tạo/rút/chọn application.
- `matching`: tính điểm kỹ năng tường minh; không đọc trực tiếp persistence riêng của module khác.
- `admin`: entrypoint duyệt dự án, SME và audit; mutation nghiệp vụ vẫn thuộc module sở hữu. Quyết định SME do use case `users` sở hữu; khi cấp session cho SME, `auth` truy vấn public approval facade của `users` thay vì đọc persistence trực tiếp.

## 8. Tiêu chí chốt flow

- Không cấp phiên đầy đủ khi đăng ký chưa xác minh OTP.
- OTP sai, hết hạn, đã dùng, bị khóa hoặc bị thay bởi mã mới đều không xác minh được email.
- SME đã xác minh email nhưng business verification còn `PENDING` hoặc `REJECTED` không nhận full session và không tạo được dự án.
- Admin approve chuyển SME sang `VERIFIED`; admin reject bắt buộc có lý do; cả hai quyết định đều có audit.
- SME `VERIFIED` vẫn phải gửi từng dự án qua hàng đợi duyệt dự án riêng.
- Contributor đã xác minh email nhưng thiếu hồ sơ/CV vẫn duyệt được dự án `GENERAL` và bị chặn đúng tại lúc apply.
- CV không hợp lệ bị `REJECTED_TECHNICAL` với lý do có thể hành động; CV hợp lệ đạt `READY` mà không cần admin/AI duyệt nội dung.
- Không có upload, admin review hoặc huy hiệu xác minh tư cách sinh viên; `backgroundType = STUDENT` là tự khai.
- Contributor có thể quản lý nhiều bản ghi Education; thiếu Education không ảnh hưởng quyền apply và bản ghi tự khai không có huy hiệu xác minh.
- SME là bên đọc CV và quyết định application; matching không auto accept/reject.

## 9. Trạng thái triển khai

This historical flow document describes future and demo behavior; its OTP sections are superseded by ADR 0004. Current auth uses real registration and sign-in, while demo seed profiles are disabled in local, test and production runtime configuration.
