# GenDA — Verification & Matching Flow

> Trạng thái triển khai: actor identity là `CONTRIBUTOR`; account state và email OTP đã được triển khai. Registration tạo `PENDING_EMAIL_VERIFICATION`, gửi OTP 6 chữ số và không phát session. Confirm/resend, hash-only persistence, expiry, attempt limit, cooldown, source rate limit và UI nhập OTP đã hoạt động. SME sau OTP chỉ chuyển sang `EMAIL_VERIFIED`, không vượt qua gate duyệt doanh nghiệp.

## Project Creation — Complexity & Minimum Budget Guard

Luồng tạo và duyệt dự án áp dụng hai lớp kiểm soát độc lập:

```text
SME đã được xác minh doanh nghiệp
        ↓
Tạo project DRAFT, khai báo scope/deliverables/skills/deadline/milestones
        ↓
Chọn complexity: BASIC / MEDIUM / HIGH
        ↓
Hệ thống hiển thị minimum budget tương ứng
        ↓
Budget >= minimumBudget(complexity)?
        ├─ Không → chặn gửi duyệt; SME tăng budget hoặc điều chỉnh scope/level
        └─ Có    → chuyển PENDING_REVIEW
                         ↓
             Admin đối chiếu scope với complexity
        ├─ Không phù hợp → trả về DRAFT, bắt buộc ghi lý do và gợi ý level
        └─ Phù hợp       → PUBLISHED
```

| Project level | Minimum budget | Điều kiện tự ứng tuyển |
|---|---:|---|
| `BASIC` | `BASIC_MIN` | Không yêu cầu lịch sử dự án |
| `MEDIUM` | `MEDIUM_MIN` | Có ít nhất 1 experience point **hoặc** được SME của project chủ động mời |
| `HIGH` | `HIGH_MIN` | Có ít nhất 3 experience points **và** đã hoàn thành ít nhất 1 project `MEDIUM` |

Các ngưỡng phải thỏa `BASIC_MIN < MEDIUM_MIN < HIGH_MIN` và nằm trong khoảng ngân sách MVP 1.000.000-5.000.000 VNĐ. Giá trị cụ thể chưa được tự giả định trong tài liệu này; cần chốt tại OQ-08 trước khi triển khai.

Minimum budget chỉ ngăn trường hợp chọn complexity cao nhưng trả ngân sách quá thấp. Nó không tự ngăn SME cố tình gắn nhãn `BASIC` cho một scope thực tế phức tạp. Vì vậy admin phải đánh giá scope, deliverables, kỹ năng yêu cầu, deadline và milestones trước khi publish. Admin không được âm thầm đổi nội dung, complexity hoặc budget thay SME; SME phải tự thu hẹp scope hoặc chọn level/budget phù hợp rồi gửi duyệt lại.

Quyết định này thay thế quan điểm legacy chấp nhận rủi ro SME tự khai complexity thấp. Backend là nguồn chính sách duy nhất và phải kiểm tra lại ở cả `DRAFT → PENDING_REVIEW` lẫn `PENDING_REVIEW → PUBLISHED`.

### Project level đồng thời điều khiển eligibility

Target model không dùng `GENERAL` như một project type riêng. SME chọn một `projectLevel = BASIC | MEDIUM | HIGH`; level đó đồng thời quyết định độ phức tạp, minimum budget và yêu cầu kinh nghiệm khi ứng tuyển.

Không yêu cầu contributor phải từng hoàn thành project **cùng level** mới được ứng tuyển level đó, vì điều này tạo vòng lặp không thể mở khóa. Kinh nghiệm được tích lũy từ level thấp lên:

```text
Hoàn thành BASIC  = +1 experience point
Hoàn thành MEDIUM = +2 experience points
Hoàn thành HIGH   = +3 experience points
```

Baseline policy cho MVP:

```text
Người mới
   ↓
Ứng tuyển và hoàn thành BASIC (+1 điểm)
   ↓
Đủ điều kiện tự ứng tuyển MEDIUM
   ↓
Hoàn thành MEDIUM (tổng tối thiểu 3 điểm)
   ↓
Đủ điều kiện tự ứng tuyển HIGH
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
        ├─ MEDIUM → score >= 1 hoặc có SME invitation hợp lệ
        └─ HIGH   → score >= 3 và completedMediumProjects >= 1
```

Contributor không đủ điều kiện vẫn xem được toàn bộ nội dung project. Giao diện khóa hành động submit và nêu chính xác điều kiện còn thiếu, ví dụ: “Bạn cần hoàn thành thêm 1 project BASIC để ứng tuyển project MEDIUM.”

### SME invitation cho MEDIUM

SME có thể mời một contributor chưa đủ experience point vào project `MEDIUM` của chính mình. Cơ chế này hỗ trợ người đã có kinh nghiệm bên ngoài nhưng mới tham gia GenDA, nhưng không bỏ qua email verification, profile completeness hoặc CV `READY`.

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

Trong MVP, lời mời của SME không vượt qua gate của `HIGH`. Contributor chỉ được ứng tuyển `HIGH` khi đạt cả experience point và lịch sử hoàn thành `MEDIUM`. Ngoại lệ dựa trên kinh nghiệm ngoài GenDA chỉ được bổ sung sau khi có một quy trình xác minh năng lực riêng; admin hiện không duyệt nội dung CV để cấp ngoại lệ này.

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

Đây là flow đích đã chốt cho tài liệu. Code hiện tại đã dùng role `CONTRIBUTOR`, account state chuẩn hóa, không còn student-verification gate, không cấp session khi đăng ký và đã hoàn thiện email OTP. Contributor-profile/CV lifecycle, contributor eligibility và workflow admin xác minh SME hoàn chỉnh chưa được implement. Các batch tiếp theo vẫn phải cập nhật đồng bộ migration, backend, OpenAPI client, frontend routes/copy và tests; không đổi riêng một lớp.
