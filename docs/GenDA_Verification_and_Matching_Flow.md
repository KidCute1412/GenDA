# GenDA — Verification & Matching Flow

## 1. Mục tiêu

Cơ chế verification và matching của GenDA được thiết kế để giải quyết hai vấn đề chính:

- Đảm bảo người tham gia nền tảng là sinh viên và SME hợp lệ.
- Giảm rủi ro khi ghép sinh viên với dự án bằng cách dựa trên lịch sử thực hiện project trên GenDA thay vì chỉ dựa vào thông tin tự khai trong CV.

GenDA không cố gắng xác minh toàn bộ năng lực của sinh viên ngay từ đầu. CV được sử dụng như nguồn thông tin ban đầu, trong khi mức độ tin cậy về năng lực được hình thành dần thông qua lịch sử thực hiện project.

---

# 2. Verification Flow — Sinh viên

## 2.1. Đăng ký tài khoản

Sinh viên tạo tài khoản trên GenDA bằng email.

```text
Student Register
      ↓
Verify Email
      ↓
Student Account Created
```

---

## 2.2. Xác thực tư cách sinh viên

GenDA cần xác minh người dùng thực sự là sinh viên thuộc nhóm đối tượng mà nền tảng phục vụ.

Thông tin có thể sử dụng để xác thực:

- Họ và tên.
- Trường đang theo học.
- Ngành học.
- Trạng thái sinh viên.
- Email trường nếu có.
- Thẻ sinh viên hoặc giấy xác nhận sinh viên trong trường hợp cần thiết.

```text
Student Account
      ↓
Student Verification
      ↓
Verified Student
```

Việc xác thực này chỉ nhằm xác nhận **tư cách sinh viên**, không đồng nghĩa với việc GenDA đã xác minh năng lực chuyên môn.

---

## 2.3. Hoàn thiện profile bắt buộc

Sau khi được xác thực, sinh viên phải hoàn thiện các thông tin bắt buộc trước khi được phép apply project.

Thông tin bắt buộc có thể gồm:

- Họ và tên.
- Trường.
- Ngành học.
- Kỹ năng chính.
- Thời gian có thể tham gia project.
- CV.
- Một số thông tin cơ bản khác do GenDA quy định.

```text
Verified Student
      ↓
Complete Required Profile
      ↓
Upload CV
      ↓
Profile Complete?
   ├─ No  → Không được Apply
   └─ Yes
         ↓
General Apply Permission
```

Nguyên tắc:

> Sinh viên được bắt đầu apply project khi profile đã hoàn thành đầy đủ các thông tin bắt buộc.

---

## 2.4. Vai trò của CV

CV là nguồn thông tin ban đầu để SME và hệ thống hiểu về:

- kỹ năng;
- kinh nghiệm;
- project học tập hoặc project cá nhân;
- công nghệ đã sử dụng;
- hoạt động liên quan.

Tuy nhiên, GenDA không coi toàn bộ nội dung trong CV là năng lực đã được xác minh.

Ví dụ:

```text
CV:
React
Node.js
SQL
```

Hệ thống chỉ hiểu đây là:

```text
Self-declared / CV-declared skills
```

Độ tin cậy của năng lực sẽ được tăng dần thông qua lịch sử thực hiện project trên GenDA.

---

# 3. Verification Flow — SME

## 3.1. Đăng ký tài khoản SME

SME tạo tài khoản và cung cấp thông tin doanh nghiệp.

Thông tin cơ bản gồm:

- Tên doanh nghiệp.
- Email.
- Mã số thuế hoặc thông tin đăng ký doanh nghiệp.
- Người đại diện hoặc người phụ trách đăng project.
- Thông tin liên hệ.
- Website hoặc trang doanh nghiệp nếu có.

```text
SME Register
      ↓
Verify Email
      ↓
Submit Business Information
```

---

## 3.2. Xác thực SME

GenDA kiểm tra tính hợp lệ của doanh nghiệp và người đại diện.

Trong giai đoạn pilot, việc xác thực có thể được thực hiện thủ công thông qua:

- đối chiếu mã số thuế;
- email doanh nghiệp;
- website hoặc trang doanh nghiệp;
- thông tin đăng ký doanh nghiệp;
- liên hệ xác nhận khi cần thiết.

```text
Submit Business Information
      ↓
Business Verification
      ↓
Verified SME
```

Chỉ SME đã được xác thực mới được phép đăng project.

---

# 4. Project Creation Flow

Sau khi được xác thực, SME có thể tạo project.

Thông tin project gồm:

- mô tả công việc;
- scope;
- deliverables;
- kỹ năng yêu cầu;
- deadline;
- số lượng sinh viên;
- tiêu chí nghiệm thu;
- mức độ phức tạp;
- ngân sách.

```text
Verified SME
      ↓
Create Project
      ↓
Select Complexity
Basic / Medium / High
      ↓
Enter Budget
      ↓
Budget Validation
```

---

## 4.1. Complexity-Based Budget Guard

SME được phép tự lựa chọn mức độ phức tạp của project.

Mỗi mức độ có một mức ngân sách tối thiểu do GenDA quy định.

Ví dụ:

```text
Basic  → Minimum Budget A
Medium → Minimum Budget B
High   → Minimum Budget C
```

Nếu SME chọn mức độ cao nhưng ngân sách thấp hơn mức tối thiểu:

```text
Selected Complexity
      ↓
Budget < Minimum?
   ├─ Yes → Không cho Publish
   │        → Increase Budget
   │        hoặc
   │        → Reduce Complexity
   │
   └─ No
        ↓
     Publish
```

Mục tiêu của cơ chế này là tránh trường hợp SME chọn project complexity cao để tiếp cận nhóm sinh viên có lịch sử tốt nhưng vẫn trả mức ngân sách thấp.

---

## 4.2. Trường hợp SME khai complexity thấp hơn thực tế

Ví dụ:

```text
Project thực tế: High
SME khai: Basic
```

GenDA chấp nhận rằng SME đang lựa chọn một mức rủi ro cao hơn cho chính mình.

Hệ quả:

```text
Basic Project
      ↓
Lower Minimum Budget
      ↓
Student Pool có ít bằng chứng năng lực hơn
      ↓
SME chấp nhận rủi ro tuyển sinh viên
chưa có nhiều lịch sử được kiểm chứng
```

Tuy nhiên, SME không được phép khai Basic rồi mở rộng scope thành High trong quá trình thực hiện.

Scope và deliverables đã công bố là căn cứ kiểm soát project.

Nếu muốn mở rộng đáng kể:

```text
Change Request
      ↓
Update Scope
      ↓
Re-evaluate Complexity
      ↓
Adjust Budget / Deadline
      ↓
Student Approval
```

---

# 5. Student Project Eligibility

Sau khi profile hoàn chỉnh, sinh viên có quyền sử dụng chức năng Apply.

Tuy nhiên, khả năng apply vào từng project cụ thể còn phụ thuộc vào điều kiện của project.

```text
General Apply Permission
      ↓
Open Project
      ↓
Project Eligibility Check
```

Hệ thống có thể kiểm tra:

- kỹ năng bắt buộc;
- trạng thái profile;
- lịch sử thực hiện project;
- điểm uy tín;
- completion rate;
- lịch sử tranh chấp;
- mức độ phức tạp của project.

---

# 6. Matching giữa SME và Sinh viên

## 6.1. Nguyên tắc

Matching của GenDA dựa chủ yếu trên **lịch sử thực hiện project trên nền tảng**.

CV chỉ đóng vai trò cung cấp dữ liệu ban đầu.

Sau khi sinh viên đã tham gia các project trên GenDA, hệ thống ưu tiên sử dụng dữ liệu thực tế từ lịch sử thực hiện.

Các yếu tố chính gồm:

- số project đã hoàn thành;
- loại project đã thực hiện;
- complexity của các project đã hoàn thành;
- tỷ lệ hoàn thành;
- mức độ đúng hạn;
- đánh giá từ SME;
- số lần yêu cầu chỉnh sửa;
- lịch sử tranh chấp;
- kỹ năng đã được sử dụng trong các project trước.

---

## 6.2. Matching Flow

```text
Student Apply
      ↓
Read Project Requirements
      ↓
Check Student Project History
      ↓
Evaluate Similarity
      ↓
Calculate Matching Score
      ↓
Rank Candidates
      ↓
SME Reviews Candidate List
      ↓
SME Makes Final Decision
```

---

## 6.3. Ví dụ Matching

Project mới:

```text
Type: Landing Page
Complexity: Medium
Skills:
- React
- Tailwind
```

Sinh viên A:

```text
Completed Projects: 4

Project History:
- Landing Page / React / Medium / Rating 4.8
- Company Website / React / Medium / Rating 4.7
- UI Fix / React / Basic / Rating 5.0

Completion Rate: 100%
Disputes: 0
```

Sinh viên B:

```text
Completed Projects: 0

CV:
- React
- Tailwind
```

Matching:

```text
Student A
→ Có lịch sử project tương tự
→ Có rating tốt
→ Có completion history
→ Matching Score cao

Student B
→ Có kỹ năng khai trong CV
→ Chưa có project history
→ Matching Score thấp hơn
```

Sinh viên B vẫn có thể apply nếu project cho phép sinh viên mới, nhưng SME sẽ nhìn thấy mức độ bằng chứng năng lực khác nhau.

---

# 7. Cold Start — Sinh viên chưa có lịch sử Project

GenDA cần tránh tình trạng:

> Không có project history → không được nhận project → không bao giờ có project history.

Do đó sinh viên mới vẫn có thể tiếp cận các project phù hợp.

```text
New Student
      ↓
Verified
      ↓
Complete Profile + CV
      ↓
No GenDA Project History
      ↓
Can Apply to Suitable Basic Projects
```

Với sinh viên mới, matching có thể dựa nhiều hơn vào:

- CV;
- kỹ năng khai báo;
- ngành học;
- project học tập ghi trong CV;
- yêu cầu của project.

Sau khi sinh viên hoàn thành project đầu tiên:

```text
First Completed Project
      ↓
Project History Created
      ↓
Future Matching uses GenDA History
```

Theo thời gian:

```text
CV-based matching
      ↓
CV + GenDA history
      ↓
Primarily GenDA project history
```

---

# 8. Reputation Update sau Project

Sau mỗi project, hệ thống cập nhật hồ sơ năng lực thực tế của sinh viên.

```text
Project Completed
      ↓
SME Evaluation
      ↓
Store Project Result
      ↓
Update Student Reputation
      ↓
Used for Future Matching
```

Các dữ liệu được ghi nhận có thể gồm:

- project type;
- complexity;
- kỹ năng sử dụng;
- completion status;
- deadline performance;
- SME rating;
- revision count;
- dispute result.

Dữ liệu này trở thành bằng chứng năng lực đáng tin cậy hơn so với thông tin tự khai trong CV.

---

# 9. Tổng thể Flow của GenDA

```text
================ STUDENT SIDE ================

Student Register
      ↓
Verify Student Status
      ↓
Complete Required Profile
      ↓
Upload CV
      ↓
General Apply Permission
      ↓
Apply Project
      ↓
Project Eligibility Check
      ↓
Matching based on Project History
      ↓
SME Selection
      ↓
Execute Project
      ↓
Project Result + Rating
      ↓
Update Reputation & Project History


================ SME SIDE ====================

SME Register
      ↓
Business Verification
      ↓
Verified SME
      ↓
Create Project
      ↓
Choose Complexity
      ↓
Enter Budget
      ↓
Complexity-Based Budget Guard
      ↓
Publish Project
      ↓
Receive Applications
      ↓
Review Matching Ranking
      ↓
Select Student
      ↓
Execute Project
      ↓
Evaluate Student


================ MATCHING LOOP ===============

Completed Project
      ↓
Project History
      ↓
Reputation
      ↓
Better Matching Evidence
      ↓
Access to More Suitable / Higher-Risk Projects
```

---

# 10. Technical Decision Summary

## Decision

GenDA áp dụng mô hình:

> **Identity Verification + Profile Completion + Project-History-Based Matching**

## Sinh viên

GenDA xác thực tư cách sinh viên và yêu cầu hoàn thiện profile trước khi mở quyền Apply.

CV được sử dụng làm dữ liệu ban đầu nhưng không được coi là bằng chứng năng lực đã được xác minh hoàn toàn.

Năng lực được chứng minh dần thông qua lịch sử thực hiện project.

## SME

GenDA xác thực doanh nghiệp trước khi cho phép đăng project.

SME tự lựa chọn complexity của project nhưng phải tuân thủ mức ngân sách tối thiểu tương ứng.

## Matching

Matching ưu tiên dữ liệu thực tế từ lịch sử project:

```text
Project similarity
+ Completion history
+ Rating
+ Deadline performance
+ Dispute history
+ Skills used in previous projects
```

SME vẫn là bên đưa ra quyết định lựa chọn cuối cùng.

## Nguyên tắc

GenDA không cố xác định trước rằng một sinh viên “giỏi” hay “không giỏi”.

Thay vào đó, hệ thống liên tục xây dựng mức độ tin cậy dựa trên:

> **Sinh viên đã thực sự hoàn thành những project nào và kết quả của các project đó ra sao.**
