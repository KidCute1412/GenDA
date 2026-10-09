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
 'SUBMITTED', 'SELF', '2026-10-02T03:00:00Z', '2026-10-02T03:00:00Z')
ON CONFLICT DO NOTHING;
