# Trợ lý tìm việc Gen — Đặc tả sản phẩm

Tài liệu này mô tả **Gen**, trợ lý tìm việc của sinh viên trên GenDA: Gen làm gì, nói khi nào, nói gì, hiện ra thế nào, và lộ trình từ bản demo hiện tại tới bản có backend và AI.

Liên quan: [`requirement.md`](./requirement.md) mục 3.10 (FR-AST), [`design.md`](./design.md) DD-11 (hộp thoại và nhân vật), [`architecture.md`](./architecture.md) (module `assistant`).

---

## 1. Từ "nơi tìm việc" sang "trợ lý tìm việc"

Một sàn việc làm thông thường chỉ trả lời câu hỏi *"có việc gì?"*. Sinh viên năm 3–4 lần đầu nộp đơn còn mắc ở những câu hỏi sàn không trả lời:

| Câu hỏi thật của sinh viên | Sàn thông thường | GenDA có Gen |
| :--- | :--- | :--- |
| "Nộp 4 đơn trượt cả 4, mình sai ở đâu?" | Im lặng. Đơn chỉ đổi màu đỏ. | Gen xem lại các đơn trượt và chỉ ra điểm sửa được: nộp lệch kỹ năng, thiếu một kỹ năng lặp lại, thư ngỏ dùng lại y nguyên, CV cũ. |
| "Đơn chờ 3 tuần rồi, có nên chờ tiếp?" | Không ai nói. | Gen nói thẳng là đơn đã chờ lâu, khuyên không đặt cược vào một đơn và chỉ ra dự án khác đang khớp. |
| "Mình nghỉ 2 tuần, giờ có gì mới?" | Người dùng tự lục lại từng trang. | Gen chào lại và tóm tắt những gì đổi trong lúc vắng: đơn nào có kết quả, mốc nào được nghiệm thu, dự án mới nào hợp. |
| "Mốc bàn giao bị yêu cầu sửa, giờ làm gì?" | Một dòng trạng thái. | Gen trích nguyên văn góp ý, nhắc hạn còn lại, trấn an rằng lịch sử nộp vẫn được giữ. |
| "Mình nên bắt đầu từ đâu?" | Danh sách dài. | Gen chọn một dự án khớp nhất và nói vì sao nó khớp. |

**Định vị:** Gen không thay sinh viên quyết định. Gen là người anh chị khóa trên đọc hồ sơ của bạn mỗi khi bạn mở app, và chỉ lên tiếng khi có điều đáng nói.

## 2. Năm nguyên tắc

1. **Chỉ nói khi dữ liệu cho phép nói.** Mỗi lời nhắc sinh ra từ một quy tắc tường minh trên dữ liệu của chính sinh viên. Không có lời khuyên chung chung kiểu "hãy cố gắng lên".
2. **Một lần mỗi phiên.** Gen tự bật nhiều nhất một lần mỗi phiên, với điều quan trọng nhất chưa nghe. Phần còn lại nằm sau huy hiệu số trên nút gọi. Trợ lý gây phiền thì sẽ bị tắt, và một trợ lý bị tắt thì vô dụng.
3. **Giải thích được.** Mọi lời nhắc có mục *"Vì sao Gen nói vậy?"* nêu dữ liệu đã dùng. Đây là nguyên tắc Trust-First của GenDA áp vào trợ lý.
4. **Không đổ lỗi, luôn kèm một bước làm được ngay.** Câu cuối của mỗi lời nhắc là một hành động cụ thể và một nút dẫn thẳng tới nơi làm hành động đó.
5. **Người dùng nắm quyền.** Đóng bất cứ lúc nào (nút X, phím Esc), tắt chế độ tự bật, gọi lại bằng nút ở góc màn hình.

**Ràng buộc phạm vi:** MVP cấm AI ở matching ([`requirement.md`](./requirement.md) mục 1). Gen ở MVP vì vậy là **hệ quy tắc**, cùng tinh thần FR-MAT-01: quy tắc tường minh, kiểm thử được bằng unit test. AI thuộc V2.0 (mục 9).

## 3. Nhân vật Gen

| Thuộc tính | Giá trị | Lý do |
| :--- | :--- | :--- |
| Tên | **Gen** | Gọi ngắn, đọc tự nhiên trong tiếng Việt, lấy từ tên sản phẩm GenD/GenDA. |
| Vai | Chị khóa trên đi làm được vài năm, làm trợ lý tuyển dụng | Đủ gần để sinh viên không ngại, đủ kinh nghiệm để lời khuyên có trọng lượng. |
| Ngoại hình | Tóc bob tím than, mắt màu hổ phách cam, hoodie xám, tai nghe cam vòng cổ, kẹp tóc hai vạch cam `//`, thẻ tên `GEN // 01` | Mọi điểm cam lặp lại màu Safety Orange của DD-10; kẹp tóc `//` lặp lại ký hiệu mã máy `BAY-01 // ACTIVE` của giao diện. |
| Phong cách vẽ | Anime 2D phẳng, viền mực đậm, đổ bóng cel | Viền mực đậm khớp viền cơ khí 2px của DD-10. Nhân vật có viền riêng nên đứng được trên mọi nền. |
| Xưng hô | Gen xưng **mình**, gọi sinh viên là **bạn**, gọi bằng tên (*"Chào Lộc!"*) | Ngôi thứ hai, câu ngắn: đúng đòn bẩy "giọng văn" ở `design.md` 4.9.1. |
| Giới hạn giọng | Không emoji, tối đa một dấu chấm than mỗi câu, không gạch ngang dài, nháy kép cong | Theo `design.md` 4.10 và 4.11. |

**Vì sao không dùng model 3D hay Live2D có sẵn.** (1) `design.md` 4.9.1 cấm *"minh họa người kiểu 3D bong bóng"*. (2) Model mẫu của bên thứ ba vướng điều khoản sử dụng thương mại và không mang nhận diện GenDA. (3) Một SVG tự vẽ nặng vài KB, render sắc ở mọi cỡ và đổi biểu cảm bằng cách thay vài nét, trong khi Live2D hay VRM kéo theo hàng trăm KB thư viện và texture. Nếu sau này muốn Gen chuyển động mượt như game, đường nâng cấp là thuê họa sĩ dựng Live2D **từ chính thiết kế này** (mục 9).

### Biểu cảm

| Biểu cảm | Dùng khi |
| :--- | :--- |
| `neutral` (mỉm cười) | Thông tin trung tính, giải thích |
| `happy` (mắt cười, má hồng) | Chào hỏi, chúc mừng, được nhận, dự án hoàn tất |
| `thinking` (mắt nhìn lên, môi thẳng) | Phân tích, chẩn đoán, tóm tắt |
| `concerned` (mày chau, giọt mồ hôi) | Tin không vui: bị từ chối, quá hạn, yêu cầu sửa |
| `surprised` (mắt tròn, tia sáng cam) | Tin mới bất ngờ: vào danh sách rút gọn, dự án mới, sắp tới hạn |
| `wink` (nháy mắt) | Câu chốt: lời động viên kèm bước làm tiếp |

Khi chữ đang chạy, khẩu hình đóng mở theo nhịp; câu mới thì Gen chớp mắt một lần.

## 4. Danh mục tình huống

Ngưỡng nằm trong `THRESHOLDS` ở `apps/web/features/assistant/engine.ts`; đổi ngưỡng thì sửa cả bảng này.

| Mã | Bậc | Khi nào | Gen nói gì | Bước gợi ý |
| :--- | :--- | :--- | :--- | :--- |
| `INTRO` | intro | Lần đầu gặp sinh viên | Giới thiệu Gen làm gì, chỉ đọc dữ liệu của chính bạn, gọi Gen ở đâu | Bắt đầu |
| `WELCOME_BACK` | welcome | Vắng **≥ 7 ngày** so với lần hoạt động trước | Chào lại, nói số ngày vắng, tóm tắt tối đa 3 thay đổi trong lúc vắng: đơn vào danh sách rút gọn / được nhận / có kết quả, mốc được nghiệm thu / bị yêu cầu sửa, số dự án mới khớp ≥ 67% | Nghe tiếp các việc đã xếp hạng |
| `CHANGES_REQUESTED` | urgent | Mốc của dự án đang làm bị yêu cầu sửa | Trích nguyên văn góp ý của doanh nghiệp, số ngày còn lại hoặc nhắc báo lại nếu đã quá hạn | Mở không gian làm việc |
| `DEADLINE_SOON` | urgent | Mốc chưa nộp còn **≤ 3 ngày** hoặc đã quá hạn | Hạn còn lại, tiêu chí nghiệm thu; quá hạn thì khuyên báo doanh nghiệp ngay | Mở không gian làm việc |
| `ACCEPTED_START` | news | Được nhận, dự án chưa mốc nào bắt đầu | Chúc mừng, mốc đầu tiên và hạn, nhắc đọc kỹ tiêu chí nghiệm thu | Vào không gian làm việc |
| `SHORTLISTED` | news | Đơn vào danh sách rút gọn | Báo tin, nhắc để ý email, đọc lại thư ngỏ đã gửi | Xem đơn của tôi |
| `PROJECT_COMPLETED` | news | Dự án được nghiệm thu toàn bộ | Chúc mừng, đọc điểm và nhận xét của doanh nghiệp nếu đã có | Cập nhật CV |
| `CV_MISSING` | coach | Chưa có CV | Cần CV PDF ≤ 2 MB trước khi ứng tuyển; một trang là đủ để bắt đầu | Nộp CV |
| `VERIFICATION` | coach / news | Chưa xác minh, bị từ chối (kèm lý do), hoặc đang chờ duyệt | Vì sao chưa ứng tuyển được và cách xác minh nhanh nhất | Mở hồ sơ |
| `REJECTION_STREAK` | coach | **≥ 2 đơn bị từ chối liên tiếp** tính từ đơn gần nhất (một lần được nhận làm chuỗi bắt đầu lại) | Tối đa 3 chẩn đoán, xem bảng dưới | Theo chẩn đoán đầu tiên |
| `LONG_WAIT` | coach | Đơn ở trạng thái "đã gửi" **≥ 7 ngày**; nhắc lại ở nấc 14 và 30 ngày | Số ngày chờ, doanh nghiệp nhỏ đọc đơn chậm, không nên chờ một đơn, số dự án khác đang khớp | Tìm dự án khác / Xem đơn đang chờ |
| `SKILLS_FEW` | coach | Hồ sơ có **< 3 kỹ năng** | Điểm phù hợp tính từ kỹ năng, thiếu kỹ năng thì gợi ý kém chính xác | Cập nhật kỹ năng |
| `MATCH_SUGGESTION` | discover | Đã xác minh, có CV, và: chưa gửi đơn nào, **hoặc** có dự án mới đăng từ lần trước khớp **≥ 67%** | Tên dự án, khớp mấy trên mấy kỹ năng, hạn | Xem dự án đang tuyển |

**Chẩn đoán "nộp mãi không được"** (`REJECTION_STREAK`), xét trên các đơn trong chuỗi:

| Chẩn đoán | Điều kiện | Lời khuyên |
| :--- | :--- | :--- |
| Nộp lệch kỹ năng | Điểm phù hợp trung bình **< 50%** | Tập trung vào dự án khớp từ 67% trở lên |
| Thiếu một kỹ năng lặp lại | Cùng một kỹ năng thiếu ở **≥ 2** dự án trượt | Đã biết thì thêm vào hồ sơ, chưa biết thì đây là kỹ năng đáng học tiếp |
| Thư ngỏ dùng lại hoặc sơ sài | Hai thư giống nhau **≥ 80%** (Jaccard trên tập từ), hoặc quá nửa số thư **< 200 ký tự** | Nhắc tới bài toán của doanh nghiệp và một việc từng làm gần giống |
| CV cũ | CV không cập nhật **> 90 ngày** | Thêm những gì làm được gần đây |

Không chẩn đoán nào khớp thì Gen nói thật: đơn khớp tốt, có thể lần đó doanh nghiệp có người hợp hơn, cứ tiếp tục nộp vào dự án khớp cao.

**Thứ tự ưu tiên:** `intro` → `welcome` → `urgent` → `news` → `coach` → `discover`; cùng bậc thì theo thứ tự quy tắc trong `engine.ts`.

**Khóa lời nhắc.** Mỗi lời nhắc có một khóa gắn với dữ liệu nền (ví dụ `streak:<đơn mới nhất>:<độ dài chuỗi>`, `wait:<đơn>:<nấc 7|14|30>`, `deadline:<mốc>:<soon|today|overdue>`). Nghe hết rồi thì không nhắc lại, **trừ khi tình huống đổi**: chuỗi dài thêm, đơn chờ sang nấc mới, mốc chuyển từ sắp tới hạn sang quá hạn.

## 5. Hiển thị: hộp thoại kiểu game

```text
                ┌──┐
              ╭─┴──┴─╮                                    ← chân dung Gen nhô lên khỏi mép hộp
              │ ◕  ◕ │
┌─────────────┤  ‿   ├──────────────────────────────────────────┐
│             │      │  [GEN] // TRỢ LÝ TÌM VIỆC          02/03 ✕│ ← bảng tên cam, mã máy, số câu
│   (bust)    │      │  4 đơn gần nhất của bạn đều chưa được    │
│             │      │  chọn. Mình đã xem lại các đơn đó...▍    │ ← chữ chạy, bấm để hiện hết
│             │      │                              [ TIẾP ▸ ]  │
└─────────────┴──────┴──────────────────────────────────────────┘
          câu cuối:   [1] Tìm dự án khớp hơn                       ← lựa chọn đánh số như game
                      [2] Nghe điều tiếp theo           CÒN 2
                      [3] Để sau
                      ▸ Vì sao Gen nói vậy?
```

| Hành vi | Quy định |
| :--- | :--- |
| Vị trí | Máy tính: giữa đáy màn hình, rộng tối đa 760px, chân dung đứng trong hộp ở góc trái và nhô lên khỏi mép trên. Điện thoại: phủ bề ngang phía trên thanh điều hướng đáy, chân dung đứng trên mép trên hộp. |
| Tự bật | Một lần mỗi phiên (một tab), chờ 1,2 giây sau khi trang vẽ xong, với điều quan trọng nhất chưa nghe. Không bật ở trang đăng nhập, đăng ký, xác minh email, quên mật khẩu. Tắt chế độ tự bật thì chỉ lời chào lần đầu còn tự bật. |
| Nút gọi | Phím vuông ở góc dưới phải có mặt Gen; huy hiệu cam ghi số điều chưa nghe. Bấm thì Gen hỏi *"Bạn muốn nghe điều nào trước?"* và liệt kê tối đa 4 việc. |
| Chữ chạy | 24ms mỗi ký tự. Bấm vào vùng chữ hoặc nút "Hiện hết" thì hiện cả câu ngay; bấm tiếp thì sang câu sau. Vùng chữ giữ sẵn chỗ cho cả câu nên bố cục không nhảy. |
| Lựa chọn | Câu cuối mở các lựa chọn đánh số; phím 1–4 chọn nhanh. Lựa chọn đầu là lựa chọn Gen đề xuất (ô số màu cam). Lựa chọn không dẫn đi đâu nghĩa là "nghe tiếp": còn điều chưa nghe thì Gen nói tiếp, hết thì khép lại. |
| Đã nghe | Một lời nhắc được tính là đã nghe khi câu cuối hiện đủ. Đóng giữa chừng thì lời nhắc vẫn là "mới". |
| Không chặn trang | Không lớp phủ, không bẫy tiêu điểm. Gen tự bật thì không giành tiêu điểm; người dùng tự mở thì tiêu điểm vào hộp thoại, đóng thì trả về nút gọi. |
| Trình đọc màn hình | `role="dialog"` không modal, tên "Gen". Chữ chạy ẩn với trình đọc màn hình; nguyên câu được đọc một lần qua vùng `aria-live="polite"`. |
| Giảm chuyển động | Với `prefers-reduced-motion`, chữ hiện ngay cả câu, khẩu hình đứng yên, không chớp mắt, không trượt vào. |

## 6. Trí nhớ và quyền riêng tư

- Gen chỉ đọc dữ liệu của chính sinh viên đang đăng nhập: hồ sơ, đơn, mốc bàn giao của dự án được giao, đánh giá nhận được, và danh sách dự án đang công khai. Gen không đọc đơn hay hồ sơ của sinh viên khác, và không tiết lộ ai được chọn thay bạn.
- Gen nhớ: đã chào chưa, lời nhắc nào đã nghe, lần hoạt động cuối, có tự bật hay không. Ở bản demo, trí nhớ nằm trong `localStorage` với tiền tố `genda-demo:`, nên "Đặt lại demo" xóa luôn.
- Mốc "lần trước" chốt một lần ở đầu phiên (`sessionStorage`), để tải lại trang không làm mất lời chào "lâu rồi không gặp".
- Không gửi dữ liệu nào ra ngoài. Không có mô hình AI nào đọc CV hay thư ngỏ ở MVP.

## 7. Kế hoạch backend (module `assistant`)

Bản demo chạy bộ quy tắc ngay trên trình duyệt vì ứng tuyển, milestone và xác thực vẫn đang là demo ledger ([`architecture.md`](./architecture.md)). Khi các module đó có API thật, quy tắc chuyển về backend để sinh viên nhận cùng một lời nhắc trên mọi thiết bị:

| Thành phần | Thiết kế |
| :--- | :--- |
| Module | `vn.skillbridge.assistant`, chỉ **đọc** qua facade của `users`, `applications`, `projects`, `milestones`, `reviews`. Không sửa dữ liệu của module khác. |
| Domain | Bộ quy tắc thuần như `engine.ts` hiện tại: đầu vào là ảnh chụp dữ liệu của một sinh viên và thời điểm hiện tại, đầu ra là danh sách lời nhắc. Unit test chuyển theo. |
| API | `GET /api/v1/students/me/insights` trả `{ data: Insight[] }` theo đúng kiểu `Insight` ở `features/assistant/types.ts`. `POST /api/v1/students/me/insights/{key}/acknowledgements` ghi nhận đã nghe. `PATCH /api/v1/students/me/assistant-preferences` bật/tắt tự bật. |
| Bảng | `assistant_acknowledgements (student_id, insight_key, acknowledged_at)` khóa chính `(student_id, insight_key)`; `assistant_preferences (student_id, auto_open, intro_done)`. Mốc "lần trước" lấy từ thời điểm đăng nhập/làm mới token gần nhất của module `auth`. |
| Frontend | `assistant-host.tsx` thay `buildStudentInsights` cục bộ bằng lời gọi API; hộp thoại, nhân vật và quy tắc tự bật giữ nguyên. |

**Đề xuất phụ thuộc (chưa chốt, xem OQ-08 ở `requirement.md`):** cho doanh nghiệp chọn một lý do có cấu trúc khi một đơn bị đóng (không khớp kỹ năng, đã chọn người nộp sớm hơn, lệch thời gian, khác). Hiện Gen chỉ *suy luận* nguyên nhân trượt từ dữ liệu; có lý do thật thì lời khuyên chính xác hơn hẳn.

## 8. Đo hiệu quả

Nền tảng chưa vận hành nên chưa có số liệu; các chỉ số dưới đây là **giả thuyết cần kiểm chứng** ở giai đoạn pilot, không phải cam kết.

| Chỉ số | Cách đo | Đọc thế nào |
| :--- | :--- | :--- |
| Tỷ lệ nghe hết | Lời nhắc được nghe tới câu cuối / lời nhắc đã hiện | Thấp nghĩa là lời nhắc dài hoặc không liên quan |
| Tỷ lệ làm theo | Lựa chọn có đường dẫn được bấm / lời nhắc nghe hết | Đo lời khuyên có dẫn tới hành động không |
| Tỷ lệ tắt tự bật | Sinh viên tắt chế độ tự bật / sinh viên đã gặp Gen | **Chỉ số rào chắn**: tăng nghĩa là Gen đang phiền |
| Hiệu quả huấn luyện | Tỷ lệ được nhận ở 3 đơn kế tiếp sau `REJECTION_STREAK`, so với nhóm chưa nhận lời khuyên | Câu hỏi cốt lõi: Gen có giúp sinh viên được nhận không |
| Quay lại | Tỷ lệ sinh viên vắng ≥ 7 ngày quay lại và gửi đơn trong phiên đó | Đo giá trị của lời chào lại |

## 9. Lộ trình

| Giai đoạn | Nội dung |
| :--- | :--- |
| **MVP (đã dựng)** | 13 quy tắc trên demo ledger, hộp thoại kiểu game, nhân vật 6 biểu cảm, trí nhớ trên trình duyệt, kịch bản demo. |
| **V1.1** | Module `assistant` ở backend (mục 7). Gen nhắc qua email khi sinh viên vắng ≥ 7 ngày mà có tin mới. Phía doanh nghiệp: nhắc SME khi có đơn chờ quá 7 ngày, để `LONG_WAIT` được giải quyết tận gốc. Lý do đóng đơn có cấu trúc. |
| **V2.0** | AI đọc CV PDF và thư ngỏ để góp ý cụ thể từng câu; trò chuyện tự do với Gen; gợi ý lộ trình học kỹ năng theo các dự án đã trượt. Nâng nhân vật lên Live2D dựng từ chính thiết kế hiện tại. |

## 10. Kịch bản demo cho ban giám khảo

Đăng nhập bằng nút **SINH VIÊN** ở `/login`, mở `/student/applications`. Lần đầu Gen tự chào. Sau đó bấm nút có mặt Gen ở góc dưới phải, chọn **Thử kịch bản demo**:

| Nút | Dựng tình huống | Gen sẽ nói |
| :--- | :--- | :--- |
| Nộp mãi không được | Thêm 3 đơn bị từ chối, lệch kỹ năng, cùng một thư ngỏ | `REJECTION_STREAK` với 3 chẩn đoán |
| Vắng 9 ngày rồi quay lại | Lùi mốc hoạt động 9 ngày, một đơn vào danh sách rút gọn, một dự án mới khớp 3/3 | `WELCOME_BACK`, rồi lần lượt `SHORTLISTED`, `MATCH_SUGGESTION` |
| Mốc bị yêu cầu sửa | Mốc đang làm bị yêu cầu sửa, còn 2 ngày tới hạn | `CHANGES_REQUESTED` trích nguyên văn góp ý |
| Gen chào lại từ đầu | Xóa trí nhớ của Gen | `INTRO` |

Kịch bản chỉ đổi dữ liệu demo trong trình duyệt đang dùng; "Đặt lại demo" ở trang hồ sơ đưa mọi thứ về ban đầu.

## 11. Mã nguồn

| Tệp | Vai trò |
| :--- | :--- |
| `apps/web/features/assistant/engine.ts` | Bộ quy tắc và ngưỡng (hàm thuần) |
| `apps/web/features/assistant/engine.spec.ts` | Unit test bộ quy tắc |
| `apps/web/features/assistant/types.ts` | Kiểu `Insight`, `DialogueLine`, bậc ưu tiên |
| `apps/web/features/assistant/memory.ts` | Trí nhớ của Gen, mốc phiên, giả lập vắng mặt |
| `apps/web/features/assistant/components/gen-portrait.tsx` | Nhân vật SVG, biểu cảm, khẩu hình, chớp mắt |
| `apps/web/features/assistant/components/gen-dialogue.tsx` | Hộp thoại kiểu game |
| `apps/web/features/assistant/components/assistant-host.tsx` | Điều phối: tự bật, nút gọi, menu, kịch bản demo |
| `apps/web/features/demo-ledger/store.ts` (`seedAssistantScenario`) | Dữ liệu cho kịch bản demo |
| `apps/web/app/components.css` (mục "TRỢ LÝ GEN") | Kiểu dáng hộp thoại và nút gọi |
| `apps/web/e2e/assistant.spec.ts` | Kiểm thử đầu cuối |
