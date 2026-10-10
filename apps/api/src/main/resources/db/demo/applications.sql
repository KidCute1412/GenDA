-- Demo-only applications so both sides have something to look at after login.
--   Phạm Gia Huy (GOLD) applied to the HIGH project of The Coffee Lab, which the demo SME owns.
--   Lê Tuấn Lộc (SILVER) applied to the MEDIUM Zen Yoga project.
INSERT INTO applications (id, project_id, contributor_id, cover_letter, status, eligibility_source, submitted_at,
                          updated_at)
VALUES
('50000000-0000-0000-0000-000000000001', 'p-coffee-lab', '40000000-0000-0000-0000-000000000005',
 'Em đã làm 10 dự án Trung bình trên GenDA, trong đó có hai landing page cho quán cà phê và một trang đặt bàn. Em có thể bàn giao bản thiết kế trong tuần đầu và đo Lighthouse trước mỗi mốc.',
 'SUBMITTED', 'SELF', '2026-10-01T02:00:00Z', '2026-10-01T02:00:00Z'),
('50000000-0000-0000-0000-000000000002', 'p-zen', '40000000-0000-0000-0000-000000000001',
 'Em từng làm bộ template social cho hai cửa hàng nhỏ và quen làm component trong Figma. Em rảnh các buổi tối trong tuần và có thể gửi bản nháp đầu tiên sau năm ngày.',
 'SUBMITTED', 'SELF', '2026-10-02T03:00:00Z', '2026-10-02T03:00:00Z'),
('50000000-0000-0000-0000-000000000003', 'p-coffee-lab', '40000000-0000-0000-0000-000000000006',
 'Em đã có 3 năm kinh nghiệm thiết kế UI/UX và phát triển ứng dụng front-end với React/TypeScript. Em từng làm landing page cho chuỗi đồ uống, cam kết bàn giao đúng hạn và tối ưu Lighthouse.',
 'SUBMITTED', 'SELF', '2026-10-01T04:00:00Z', '2026-10-01T04:00:00Z'),
('50000000-0000-0000-0000-000000000004', 'p-coffee-brand', '40000000-0000-0000-0000-000000000001',
 'Em từng thiết kế bao bì và bộ ấn phẩm marketing cho chuỗi cà phê sinh viên, thành thạo Figma và am hiểu kỹ thuật in ấn. Em có thể gửi bản nháp đầu tiên sau 3 ngày làm việc.',
 'SUBMITTED', 'SELF', '2026-10-02T02:00:00Z', '2026-10-02T02:00:00Z'),
('50000000-0000-0000-0000-000000000005', 'p-coffee-brand', '40000000-0000-0000-0000-000000000007',
 'Em đã tham gia 4 dự án Medium về thiết kế và phát triển nhận diện số. Em cam kết phối hợp chặt chẽ với team The Coffee Lab để bàn giao đúng tiêu chuẩn nhận diện thương hiệu.',
 'SUBMITTED', 'SELF', '2026-10-02T05:00:00Z', '2026-10-02T05:00:00Z'),
('50000000-0000-0000-0000-000000000006', 'p-tiem-gom', '40000000-0000-0000-0000-000000000004',
 'Em rất yêu thích các sản phẩm thủ công mỹ nghệ và có kinh nghiệm viết bài fanpage đạt tương tác cao. Em có thể lên kế hoạch nội dung chi tiết theo đúng phong cách mộc mạc của tiệm.',
 'SUBMITTED', 'SELF', '2026-10-03T01:00:00Z', '2026-10-03T01:00:00Z'),
('50000000-0000-0000-0000-000000000007', 'p-tiem-gom', '40000000-0000-0000-0000-000000000008',
 'Em có kinh nghiệm sáng tạo nội dung mạng xã hội và xây dựng kịch bản video ngắn triệu view. Em sẽ gửi 3 bài mẫu để tiệm duyệt văn phong trước khi bắt đầu.',
 'SUBMITTED', 'SELF', '2026-10-03T03:00:00Z', '2026-10-03T03:00:00Z')
ON CONFLICT DO NOTHING;
