# Đặc tả đề xuất: AI rà soát bàn giao theo tiêu chí milestone

**Trạng thái:** Đã triển khai milestone backend, workspace API và adapter Gemini cho pilot. Nghiệm thu local và giới hạn được ghi tại mục 15; chưa xác nhận dịch vụ hosted hoặc hiệu quả với người dùng thật.

**Kết luận về giá trị:** Có khả năng hữu ích vì AI đối chiếu sản phẩm với cam kết chung của hai bên. Chưa có dữ liệu người dùng để khẳng định hiệu quả; cần pilot trước khi đầu tư rộng.

## 1. Tóm tắt

GenDA thử nghiệm một trợ lý AI ở bước contributor gửi kết quả cho milestone. Trợ lý đối chiếu tiêu chí nghiệm thu đã chốt với bằng chứng trong lần bàn giao, chỉ ra tiêu chí đã có bằng chứng, chưa thấy bằng chứng, hoặc chưa đủ thông tin để kết luận.

AI không phê duyệt/từ chối bàn giao, không ra quyết định thanh toán và không thay đổi tiêu chí. Contributor và SME cùng xem một bản rà soát; SME vẫn chọn nghiệm thu hoặc yêu cầu sửa theo luồng milestone của GenDA.

### Đánh giá sơ bộ: có thật sự hữu ích?

| Điều kiện | Đánh giá |
| --- | --- |
| Pain point có nằm trong sản phẩm? | Có. MVP vận hành bằng milestone, bàn giao, yêu cầu sửa và nghiệm thu; hai bên cần hiểu cùng một tiêu chí. Nguồn hiện tại là tài liệu sản phẩm, chưa phải số liệu pilot. |
| LLM có đủ ngữ cảnh không? | Có thể đủ cho một câu hỏi hẹp nếu được cung cấp tiêu chí đã chốt và bằng chứng của lần bàn giao. Không cần kho tài liệu riêng của SME. |
| LLM có lợi thế hơn checklist thường? | Có thể phát hiện nội dung diễn đạt khác tiêu chí bằng từ ngữ, nhưng đây là giả thuyết phải thử. Kiểm tra định dạng, tệp có/không, hạn và trạng thái nên dùng quy tắc bình thường. |
| Rủi ro ảnh hưởng quyền lợi? | Có, nếu AI bị hiểu là giám khảo hoặc người quyết định tiền. Vì vậy kết quả chỉ mang tính tham khảo, phải nêu bằng chứng và giữ quyết định ở con người. |
| Có nên đưa vào MVP ngay? | Chỉ sau khi milestone và bàn giao có backend thật. AI trên dữ liệu demo không làm vòng đời sản phẩm đáng tin cậy hơn. |

**Quyết định đề xuất:** làm pilot giới hạn sau khi có một lát cắt milestone đầu-cuối chạy bằng dữ liệu backend thật. Nếu người dùng không thường xuyên thiếu rõ ràng khi nghiệm thu, bỏ AI và giữ checklist/rubric thông thường.

## 2. Pain point và bằng chứng hiện có

Trong dự án ngắn hạn, hoàn tất công việc và đáp ứng tiêu chí nghiệm thu là hai điều có thể bị hiểu khác nhau. Contributor có thể nghĩ đã bàn giao đủ; SME có thể chưa tìm thấy bằng chứng cho một tiêu chí đã thỏa thuận. Việc giải thích dựa trên trí nhớ hoặc hội thoại rời rạc có thể dẫn tới thêm vòng sửa và giảm niềm tin.

GenDA đã đặt vấn đề này vào luồng nghiệp vụ:

- [FR-MIL-01…05 trong requirement](requirement.md): mỗi milestone có kết quả/tiêu chí; contributor nộp; SME nghiệm thu hoặc yêu cầu sửa có lý do; lịch sử nộp được giữ lại.
- [Luồng thực hiện và nghiệm thu](mvp-usecase-flows.md): milestone là bước chính trước khi hoàn tất dự án và ghi nhận đánh giá.
- [Assistant Gen](assistant.md): nguyên tắc “chỉ nói khi dữ liệu cho phép” và giải thích căn cứ là tiền lệ về cách thiết kế trợ lý có thể kiểm chứng.

**Giới hạn bằng chứng:** tài liệu mô tả vấn đề và ý định sản phẩm, chưa ghi nhận tần suất tranh chấp, số vòng sửa hoặc thời gian review từ người dùng thật. Không được trình bày pain point này như đã được nghiên cứu thị trường xác nhận.

## 3. Vì sao chọn rà soát bàn giao thay vì viết dự án bằng AI?

Upwork hiện quảng bá AI gợi ý mô tả công việc, đề xuất milestone, so sánh proposal và tóm tắt tiến độ; các chức năng này làm ý tưởng “LLM tự viết plan” ít khác biệt hơn. [Uma trên Upwork](https://www.upwork.com/uma/) [Upwork Spring 2026](https://www.upwork.com/press/releases/upwork-updates-spring-2026-ai-powered-innovations-to-help-small-businesses-get-ambitious-work-done)

Fiverr cũng có milestone, bàn giao, cửa sổ yêu cầu sửa và nghiệm thu theo milestone. Điều đó cho thấy workflow cơ bản đã quen thuộc trong thị trường; cơ hội GenDA không phải chỉ thêm milestone hay một chatbot. [Fiverr: Working with Milestones](https://help.fiverr.com/hc/en-us/articles/360010560178-Working-with-Milestones)

Hướng rà soát sau bàn giao có ngữ cảnh riêng của giao dịch GenDA: **cam kết đã chốt + bản nộp hiện tại + lịch sử sửa của chính milestone**. Giá trị có thể đến từ việc gắn nhận xét AI với đúng tiêu chí và cùng lưu trong tiến trình làm việc, không phải từ một model độc quyền.

Rà soát nguồn công khai ở trên không chứng minh đối thủ không có tính năng tương tự. Khác biệt cạnh tranh vẫn cần được kiểm chứng.

## 4. Người dùng và thời điểm sử dụng

| Người dùng | Việc cần làm |
| --- | --- |
| Contributor được giao dự án | Nộp kết quả và kiểm tra xem phần mô tả/bằng chứng đã giúp SME đối chiếu tiêu chí chưa. |
| SME sở hữu dự án | Xem bằng chứng theo từng tiêu chí trước khi tự quyết định nghiệm thu hoặc gửi yêu cầu sửa. |

**Điểm vào:** trong trang milestone sau khi contributor gửi một lần bàn giao. AI chạy trên yêu cầu rõ ràng của người dùng, không tự bật hoặc tự gửi tin nhắn.

## 5. Luồng sản phẩm

```text
Hai bên dùng tiêu chí milestone đã chốt
    → Contributor gửi note và bằng chứng bàn giao
    → Hệ thống kiểm tra quyền truy cập và định dạng
    → AI đối chiếu lần bàn giao với từng tiêu chí
    → Backend kiểm tra cấu trúc và nguồn trích dẫn
    → Cùng hiển thị kết quả cho contributor và SME
    → SME tự nghiệm thu hoặc yêu cầu sửa có lý do
    → Lưu kết quả AI cùng phiên bản bàn giao để xem lại
```

Nếu AI không khả dụng, luồng bàn giao và review thông thường vẫn hoạt động. Kết quả AI không làm chậm hoặc khóa thao tác của hai bên.

## 6. Phạm vi chức năng

### Trong pilot đầu tiên

- Đối chiếu từng tiêu chí trong milestone với note bàn giao và nội dung bằng chứng mà phiên bản đầu hỗ trợ đọc.
- Trả một trong ba trạng thái cho mỗi tiêu chí:
  - `EVIDENCE_FOUND`: tìm được bằng chứng liên quan trong nội dung đã nhận.
  - `NOT_SHOWN`: nội dung đã nhận chưa cho thấy bằng chứng rõ.
  - `CANNOT_ASSESS`: tiêu chí mơ hồ, bằng chứng không đọc được hoặc cần SME đánh giá chủ quan.
- Kèm đoạn trích ngắn và nguồn (ghi chú, tên file/trang nếu parser cung cấp), hoặc nêu rõ không tìm thấy trích dẫn.
- Nêu câu hỏi làm rõ ngắn cho contributor/SME khi có thể giải quyết bằng việc bổ sung thông tin.
- Hiển thị nguyên văn tiêu chí gốc để người dùng so sánh; giữ rõ rằng đây là góp ý của AI.
- SME vẫn quyết định `ACCEPTED` hoặc `CHANGES_REQUESTED`; yêu cầu sửa vẫn phải có lý do của SME.
- Lưu kết quả gắn với đúng milestone và revision. Bàn giao mới cần lượt phân tích mới; không ghi đè kết quả cũ.

### Ngoài phạm vi

- Tự động nghiệm thu/từ chối milestone, chấm điểm contributor, mở khóa hoặc giữ tiền.
- Dự đoán trung thực, thái độ, năng lực tổng quát hoặc xác suất được nhận việc.
- Đổi tiêu chí sau khi công việc bắt đầu hay tự giải quyết bất đồng giữa hai bên.
- Chatbot tự do, AI matching tuyển dụng, viết proposal hoặc huấn luyện model riêng.
- Tự truy cập mọi URL do người dùng nhập, đăng nhập vào sản phẩm ngoài, chạy mã/ZIP, hoặc giả định một prototype thẩm mỹ chỉ có một đáp án đúng.

## 7. Ngữ cảnh AI cần nhận

Chỉ gửi ngữ cảnh thuộc đúng dự án và milestone đang được bàn giao:

1. Tiêu chí nghiệm thu phiên bản đã chốt trước khi bắt đầu milestone.
2. Mô tả/ngân sách/hạn của milestone khi thực sự cần để phân biệt phạm vi.
3. Note contributor nhập cho revision hiện tại.
4. Nội dung văn bản trích xuất được từ file bằng chứng thuộc revision hiện tại.
5. Kết quả AI trước đó chỉ khi đang phân tích revision mới và cần so sánh thay đổi; nếu không cần thì bỏ qua.

Không cần CV, thư ứng tuyển, dữ liệu ứng viên khác, lịch sử riêng của SME hoặc tài liệu ngoài dự án. Không đưa dữ liệu này vào prompt “để context tốt hơn”.

Model không được tự mở rộng hợp đồng từ bài giới thiệu dự án. **Tiêu chí đã chốt là căn cứ review.** Nếu tiêu chí thiếu hoặc bản thân tiêu chí mơ hồ, trạng thái phải là `CANNOT_ASSESS` kèm câu hỏi, không tự bịa yêu cầu mới.

## 8. Đầu ra và ví dụ

Report mới có phần tóm tắt điều hành và danh sách phát hiện, sau đó trình bày từng tiêu chí với phân tích, trích dẫn, khoảng trống chưa xác minh và bước kiểm tra tiếp theo. `EVIDENCE_FOUND` chỉ mô tả bằng chứng liên quan; không phải kết luận đạt. Report không có điểm tổng và không quyết định nghiệm thu.

```json
{
  "summary": "Nguồn có bằng chứng về các trường trong form; chưa xác minh được dữ liệu gửi đi sau khi khách đặt bàn.",
  "findings": ["Ghi chú bàn giao nêu tên, số điện thoại và khung giờ."],
  "limitations": ["Chưa kiểm tra form đang chạy hoặc nơi lưu đơn."],
  "items": [
    {
      "criterionId": "criterion-1",
      "status": "EVIDENCE_FOUND",
      "evidence": [{"source": "handoff-note", "quote": "Đã thêm tên, số điện thoại và khung giờ."}],
      "analysis": "Ghi chú có nhắc đủ ba trường được yêu cầu.",
      "gap": "Nguồn văn bản chưa chứng minh form hoạt động trên sản phẩm.",
      "nextStep": "SME mở form và kiểm tra các trường trên giao diện.",
      "question": null
    },
    {
      "criterionId": "criterion-2",
      "status": "CANNOT_ASSESS",
      "evidence": [],
      "analysis": "Nguồn hiện có không mô tả điểm nhận hoặc lưu thông tin đặt bàn.",
      "gap": "Chưa xác minh được thông tin được gửi tới đâu.",
      "nextStep": "SME gửi thử một đơn và kiểm tra email nhận hoặc hệ thống lưu đơn.",
      "question": "Bản bàn giao chưa cho biết thông tin được gửi tới đâu; SME kiểm tra email nhận hoặc hệ thống lưu đơn giúp nhé."
    }
  ],
  "overallNote": "Đây là rà soát dựa trên nội dung bàn giao đã cung cấp, không phải quyết định nghiệm thu."
}
```

Backend yêu cầu đủ đúng một item mỗi tiêu chí, trường report mới không rỗng/vượt giới hạn, các criterion IDs thuộc revision hiện tại, trạng thái hợp lệ và mọi quote phải là đoạn con của nội dung đầu vào. Nếu output sai, attempt thất bại thay vì hiện report thiếu hoặc trích dẫn do model bịa. Structured output không tự chứng minh nội dung đúng. Report cũ thiếu các trường mới vẫn được deserialize và hiển thị bằng bố cục tương thích; không gọi lại Gemini tự động. [Google: structured outputs](https://ai.google.dev/gemini-api/docs/structured-output)

## 9. AI được triển khai ra sao?

### Pipeline inference

Đây là pipeline xử lý cho mỗi revision bàn giao, **không phải pipeline huấn luyện**:

1. Backend xác thực contributor, quyền trên assignment/milestone, trạng thái milestone và revision hiện tại.
2. Đọc tiêu chí phiên bản đã chốt và submission thuộc revision đó.
3. Lấy nội dung từ các loại bằng chứng đã cho phép. Loại không hỗ trợ được thông báo rõ và không đưa cho model giả vờ đã đọc.
4. Cắt nội dung theo giới hạn; dữ liệu trong file/ghi chú được coi là dữ liệu cần phân tích, không phải chỉ thị cho model.
5. Gọi một lần tới model với nhiệm vụ hẹp và yêu cầu JSON theo schema.
6. Parse, validate IDs/quotes/status/size; nếu lỗi thì không lưu bản kết quả có vẻ hợp lệ.
7. Lưu revision ID, phiên bản tiêu chí, provider/model, thời điểm, trạng thái xử lý và kết quả cần thiết để audit.
8. Trả kết quả chung cho hai bên; SME thao tác acceptance qua API workflow riêng.

Không cần agent, vòng gọi tool, RAG, vector database, fine-tuning hay queue trong pilot nhỏ. Nếu latency/tải thật sau này cần xử lý nền, khi đó mới thêm hàng đợi.

### API key và nhà cung cấp

- Nếu dùng LLM hosted, chủ vận hành GenDA cấu hình key ở secret của backend (local env bị ignore, Render secret ở backend). Không đặt trong browser, localStorage, `NEXT_PUBLIC_*` hoặc mã nguồn.
- Người dùng không phải nhập API key riêng. Theo quyết định triển khai, bấm “Phân tích bằng AI” là yêu cầu gửi bằng chứng revision đó tới Gemini; giao diện có thông báo ngắn ngay cạnh nút, không có checkbox/hộp thoại hoặc bước chờ hai bên đồng ý.
- Nhà cung cấp đã chốt: Gemini, mặc định `gemini-3.5-flash-lite`, cấu hình được bằng `GEMINI_MODEL`. Key/quota và chính sách tài khoản provider phải được kiểm tra khi nghiệm thu dịch vụ thật.
- Nếu SME cần dữ liệu không rời môi trường riêng, tích hợp endpoint của model do doanh nghiệp quản lý là một hướng sau pilot; không hứa hỗ trợ mọi LLM trong bản đầu.
- Model lỗi, timeout, vượt quota hoặc output không hợp lệ: báo AI chưa sẵn sàng, vẫn cho SME/contributor dùng chức năng thường.

NIST nêu nguy cơ LLM tạo nội dung sai nhưng tự tin, đặc biệt cần chú ý khi đầu ra có thể ảnh hưởng quyết định. Hướng dẫn Gemini cũng khuyến nghị test an toàn, theo dõi phản hồi và giữ oversight phù hợp. Bởi vậy, không biến AI thành bên nghiệm thu. [NIST AI RMF GenAI Profile](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=958388) [Gemini safety guidance](https://ai.google.dev/gemini-api/docs/safety-guidance)

## 10. Trạng thái code trước triển khai và phần phụ thuộc

| Thành phần | Hiện trạng quan sát | Tác động đến feature |
| --- | --- | --- |
| Backend `milestones` | Architecture chỉ nêu ownership; chưa thấy API milestone production tương ứng | Cần hoàn thiện nghiệp vụ milestone trước để AI nhận dữ liệu thật và quyền đúng |
| Workspace | Route và nhiều thao tác dùng mock hoặc `demo-ledger` | Kết quả AI trên ledger không chứng minh luồng thật; UI cần chuyển sang API backend |
| Bàn giao hiện tại | Component dùng state trình duyệt và timeout giả lập; chấp nhận tệp/liên kết | Chưa có revision lưu bền vững, đồng bộ hai bên hay API phân quyền |
| CV/PDF | PDFBox có để kiểm tra khả năng đọc CV, nhưng hiện không trích văn bản | Không thể coi dependency hiện có là đã có khả năng đọc file bàn giao |
| Lưu file bàn giao | FR-MIL-09 yêu cầu object storage riêng tư; chưa thấy adapter upload/download bàn giao | Cần đáp ứng storage và authorization trước khi AI phân tích attachment |
| Matching và Gen | Matching là rule-based; Gen là quy tắc demo | Feature này độc lập với AI matching/chatbot; không thay các rule MVP |
| OpenAPI/client | Cơ chế contract/client đã có | Endpoint/action mới cần cập nhật OpenAPI và sinh lại client |

Liên quan: [workspace route](../apps/web/app/workspace/[id]/page.tsx), [handoff form demo](../apps/web/features/milestones/components/deliverable-form.tsx), [CV PDF inspector](../apps/api/src/main/java/vn/skillbridge/users/infrastructure/pdf/PdfBoxInspector.java), [module ownership](architecture.md).

**Kết luận triển khai:** nếu milestone API, versioned handoff và storage còn thiếu, làm các phần này trước. AI chỉ có thể có ích khi đọc đúng bằng chứng thật và kết quả tồn tại cho cả hai bên.

## 11. Kế hoạch thực hiện đề xuất

### Giai đoạn A — Nền tảng milestone thật

- Implement trạng thái milestone, submit revision, yêu cầu sửa có lý do, nghiệm thu và audit bằng PostgreSQL.
- Lưu/đọc submission an toàn, kiểm tra ownership/assignment; đáp ứng FR-MIL-09 với object storage riêng tư.
- Thay demo ledger của workspace bằng API. Kiểm tra SME và contributor thấy cùng dữ liệu ở hai phiên đăng nhập.
- Hoàn tất state transitions trước khi nối AI.

### Giai đoạn B — Pilot AI có giới hạn

- Chọn một nhóm loại bàn giao có thể trích nội dung rõ, ví dụ note văn bản và PDF có text. Chưa đọc ZIP, Figma, website URL, hay file không hỗ trợ.
- Tạo một endpoint review riêng; phân quyền theo đúng dự án và revision; một lần gọi model cho một yêu cầu review.
- Hiển thị ba trạng thái, nguồn trích dẫn và thông báo AI chưa thể kết luận; AI lỗi không chặn review thông thường.
- Ghi lại feedback hữu ích/không hữu ích và quyết định cuối của SME. Không dùng phản hồi để tự huấn luyện model.
- Chỉ mở rộng sang ảnh/vision hay nhiều định dạng khi có use case thật và kiểm tra privacy/chi phí tương ứng.

### Giai đoạn C — Quyết định tiếp tục hay bỏ

- So sánh thời gian review, số vòng yêu cầu sửa và số lần contributor phải hỏi lại trước/sau pilot.
- Đo tỷ lệ nhận định AI mà hai bên cho là có ích; tách riêng lỗi trích dẫn, nhầm tiêu chí và trường hợp AI tự tạo yêu cầu.
- Phỏng vấn cả contributor lẫn SME; một bên thấy hữu ích nhưng bên kia mất tin tưởng thì chưa đạt.
- Tiếp tục chỉ khi AI giảm công sức mà không làm tăng hiểu lầm. Nếu checklist deterministic cho kết quả tương đương, bỏ LLM.

## 12. Tiêu chí nghiệm thu pilot

- Chỉ người contributor được phân công mới submit; chỉ SME sở hữu dự án mới quyết định acceptance/revision.
- Review chỉ dùng tiêu chí đã chốt và bằng chứng đúng revision; tiêu chí sau đó thay đổi không âm thầm sửa lịch sử.
- Mỗi kết luận có quote/source hợp lệ hoặc ghi rõ không tìm thấy bằng chứng.
- Model không có quyền gọi nghiệp vụ, sửa milestone, gửi yêu cầu sửa, chấp nhận hoặc đổi payment status.
- Không có key trong frontend/network browser bundle/log. Chỉ gửi bằng chứng sau thao tác bấm phân tích, có thông báo ngay cạnh nút; không tự chạy sau submit.
- Unsupported file, prompt injection trong tài liệu, file lỗi, timeout, quota, response schema lỗi và sai project ID đều xử lý an toàn.
- AI không sẵn sàng thì submit/review thường vẫn chạy; không mất revision hoặc quyết định của người dùng.
- Chạy thử với trường hợp đạt, thiếu, mơ hồ, nội dung mâu thuẫn và subjective; có contributor và SME review kết quả trước khi mở rộng.
- Kết quả và feedback của pilot được báo cáo cùng baseline; không tuyên bố cải thiện nếu chưa có dữ liệu so sánh.

## 13. Rủi ro và cách giữ niềm tin

| Rủi ro | Cách xử lý |
| --- | --- |
| AI gắn nhãn thiếu dù sản phẩm đạt | Dùng “chưa thấy bằng chứng”, không dùng “không đạt”; trích nguồn; SME tự xem sản phẩm |
| Contributor nghĩ AI đứng về phía SME | Cùng một kết quả cho hai bên, cùng xem tiêu chí và evidence; thu feedback cả hai phía |
| SME dùng AI làm lý do từ chối tự động | Không có nút/API auto-reject; decision API vẫn yêu cầu con người và lý do nếu yêu cầu sửa |
| Model bịa quote hoặc tạo tiêu chí mới | Backend xác thực quote; output chỉ được nhắc lại criterion ID thuộc phiên bản gốc |
| File chứa prompt injection hoặc dữ liệu riêng | Treat file text as untrusted input; bỏ tool execution, giới hạn nội dung gửi, consent và giới hạn loại tệp |
| Tài liệu bị chuyển ra nhà cung cấp ngoài | Thông báo cạnh nút, chỉ gửi khi bấm phân tích, gửi đúng project evidence tối thiểu, kiểm tra chính sách/quota khi nghiệm thu provider thật |
| AI lặp vô ích/chi phí cao | Chỉ gọi theo nút bấm sau submit; rate limit; một lần mỗi revision; log usage không chứa secret/nội dung nhạy cảm |
| Tranh chấp bị AI làm trầm trọng | Không dùng kết quả AI làm phán quyết hay bằng chứng pháp lý; giữ nguyên trao đổi và quyết định người dùng |

## 14. Nguồn và giả định

### Nguồn trong repo

- [requirement.md](requirement.md), mục 3.6–3.7: milestone, bàn giao, review và object storage.
- [mvp-usecase-flows.md](mvp-usecase-flows.md): vòng đời MVP và trạng thái backend.
- [architecture.md](architecture.md): module ownership và modular monolith.
- [assistant.md](assistant.md): nguyên tắc giải thích, quyền kiểm soát của người dùng, Gen hiện là hệ quy tắc.
- Mã nguồn UI/infra dẫn ở mục 10.

### Nguồn nghiên cứu ngoài

- [Upwork Uma](https://www.upwork.com/uma/) và [Upwork Spring 2026](https://www.upwork.com/press/releases/upwork-updates-spring-2026-ai-powered-innovations-to-help-small-businesses-get-ambitious-work-done): nguồn first-party về các AI feature của Upwork.
- [Fiverr: Working with Milestones](https://help.fiverr.com/hc/en-us/articles/360010560178-Working-with-Milestones): nguồn first-party về giao, sửa và nghiệm thu milestone.
- [NIST AI RMF: Generative AI Profile](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=958388): rủi ro nội dung AI sai và tự tin.
- [Gemini safety guidance](https://ai.google.dev/gemini-api/docs/safety-guidance): tham khảo an toàn, theo dõi feedback và kiểm thử; không phải quyết định chọn provider.

### Giả định chưa được xác nhận

- Tần suất sửa đi sửa lại do hiểu tiêu chí khác nhau đủ lớn để cần AI.
- Định dạng bàn giao của pilot có thể trích xuất để phân tích an toàn.
- Người dùng hiểu giới hạn nhận xét AI và thông báo gửi bằng chứng tới Gemini khi bấm phân tích.
- Đầu ra AI có thể tăng tính rõ ràng so với checklist/copy của tiêu chí đã có.

## 15. Phạm vi triển khai đã chốt

- Luồng thật: chọn contributor → snapshot milestone → upload/nộp → AI theo nút bấm → SME yêu cầu sửa → revision mới → nghiệm thu tuần tự → `COMPLETED` khi mọi mốc accepted. Không có `SUBMITTED` ở cấp dự án.
- `milestones` sở hữu revision, bằng chứng, audit, AI report/feedback và quỹ mô phỏng. `projects` sở hữu kế hoạch và trạng thái dự án; `applications` điều phối tạo snapshot cùng transaction chấp nhận người thực hiện.
- Hai vai trò đọc `/workspace/[id]` qua API. `/workspace/demo` giữ dữ liệu demo riêng; không tự nhập browser ledger vào PostgreSQL.
- Upload PDF/TXT tối đa 5 MB/tệp, 5 tệp/revision. PDF tối đa 100 trang, không mật khẩu; PDF scan vẫn bàn giao được nhưng AI chưa hỗ trợ OCR. TXT phải UTF-8. Link HTTP/HTTPS là tham chiếu, không fetch.
- AI chỉ gửi tiêu chí snapshot, note và văn bản revision; tối đa 60.000 ký tự. Quote/source được đối chiếu với đúng phần văn bản đã gửi. JSON sai, quote bịa và criterion ID sai làm attempt thất bại.
- Không có key thì backend vẫn khởi động. AI lỗi không chặn quyết định SME. Thành công được cache theo revision; attempt lỗi có thể thử lại bằng nút bấm. Tối đa 10 attempt/người/giờ, một attempt đang xử lý/revision; không giữ transaction khi gọi Gemini.
- Supabase Storage dùng bucket private `milestone-deliverables`; tải tệp qua backend có kiểm tra assignment. PostgreSQL lưu metadata/object key; source text gửi AI được giữ trong snapshot audit có giới hạn. Tệp tạm không submit được dọn sau 24 giờ.
- Quỹ mô phỏng được SME đánh dấu thủ công; admin hỗ trợ phải có lý do/audit. Chỉ ghi nhận release sau nghiệm thu, không chuyển tiền hoặc dùng AI để quyết định quỹ.
- Feedback hữu ích/không hữu ích lưu riêng theo người và AI report. Audit/revision/timestamps/usage hỗ trợ đo số vòng sửa và thời gian review; chưa có baseline người dùng thật để khẳng định cải thiện.
- Đánh giá SME sau dự án, ghi nhận XP và triển khai hosted không thuộc đợt này. Project `COMPLETED` chưa tự thêm experience record; không thay đổi policy XP/hạng hiện có.

### Cấu hình để chạy

Trong local Compose, đặt secrets tại `apps/api/.env`; trên Render đặt trong backend environment:

```dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_BACKEND_STORAGE_KEY
DELIVERABLES_BUCKET=milestone-deliverables
GEMINI_API_KEY=YOUR_GEMINI_KEY
GEMINI_MODEL=gemini-3.5-flash-lite
```

Tạo bucket private trước khi upload. JDBC PostgreSQL không thay thế credentials Storage. Sau khi storage được cấu hình, chỉ cần thêm key Gemini và restart/redeploy backend để bật AI; quyền model/quota và lời gọi thật vẫn phải smoke test.

### Nghiệm thu

Xem [kiểm chứng milestone](milestone-review-verification.md) để phân biệt test local với dịch vụ provider thật. Test HTTP fixture chỉ dùng trong môi trường test, không có fallback giả trong production.
