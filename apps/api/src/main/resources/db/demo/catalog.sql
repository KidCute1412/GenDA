INSERT INTO projects (id, public_id, title, sme_name, sme_industry, sme_size, sme_contact, budget, deadline, status, summary, problem, created_at) VALUES
('20000000-0000-0000-0000-000000000001', 'p-coffee-lab', 'Landing page cho chiến dịch cà phê mới', 'The Coffee Lab', 'F&B', '11-50 nhân sự', 'hello@thecoffeelab.vn', 4000000, '2026-12-20', 'PUBLISHED', 'Thiết kế và phát triển landing page responsive cho chiến dịch ra mắt sản phẩm cà phê mới.', 'Doanh nghiệp cần một trang đích tải nhanh, dễ đo lường và nhất quán với bộ nhận diện hiện tại.', '2026-09-01T08:00:00Z'),
('20000000-0000-0000-0000-000000000002', 'p-zen', 'Bộ nhận diện social cho Zen Yoga', 'Zen Yoga Studio', 'Sức khỏe', '1-10 nhân sự', 'studio@zenyoga.vn', 2500000, '2026-12-12', 'PUBLISHED', 'Xây dựng bộ template social và hướng dẫn sử dụng cho đội ngũ vận hành của studio.', 'Các bài đăng hiện thiếu tính nhất quán, khó tái sử dụng và chưa truyền tải được tinh thần thương hiệu.', '2026-09-03T08:00:00Z'),
('20000000-0000-0000-0000-000000000003', 'p-minh-chau', 'Kế hoạch nội dung SEO quý I', 'Minh Châu Homestay', 'Du lịch', '1-10 nhân sự', 'contact@minhchauhomestay.vn', 3000000, '2027-01-05', 'PUBLISHED', 'Nghiên cứu từ khóa và xây dựng kế hoạch nội dung SEO thực thi được cho ba tháng.', 'Website có nội dung rời rạc và chưa có lộ trình từ khóa gắn với nhu cầu đặt phòng.', '2026-09-05T08:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO project_skills (project_id, position, skill_code) VALUES
('20000000-0000-0000-0000-000000000001', 0, 'react'),
('20000000-0000-0000-0000-000000000001', 1, 'typescript'),
('20000000-0000-0000-0000-000000000001', 2, 'figma'),
('20000000-0000-0000-0000-000000000002', 0, 'figma'),
('20000000-0000-0000-0000-000000000002', 1, 'graphic-design'),
('20000000-0000-0000-0000-000000000003', 0, 'seo'),
('20000000-0000-0000-0000-000000000003', 1, 'content-marketing'),
('20000000-0000-0000-0000-000000000003', 2, 'copywriting')
ON CONFLICT DO NOTHING;

INSERT INTO project_acceptance_criteria (project_id, position, criterion) VALUES
('20000000-0000-0000-0000-000000000001', 0, 'Hiển thị tốt từ màn hình 360px đến desktop.'),
('20000000-0000-0000-0000-000000000001', 1, 'Điểm Lighthouse Performance tối thiểu 85.'),
('20000000-0000-0000-0000-000000000002', 0, 'Bàn giao file Figma có component và style tái sử dụng.'),
('20000000-0000-0000-0000-000000000002', 1, 'Có tối thiểu 12 template cho ba định dạng social.'),
('20000000-0000-0000-0000-000000000003', 0, 'Bộ từ khóa có intent và độ ưu tiên rõ ràng.'),
('20000000-0000-0000-0000-000000000003', 1, 'Lịch nội dung bao phủ đủ ba tháng.')
ON CONFLICT DO NOTHING;

INSERT INTO project_milestone_plans (id, project_id, public_id, position, title, budget, deadline) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'm1', 1, 'Wireframe và UI', 1500000, '2026-11-20'),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'm2', 2, 'Frontend hoàn chỉnh', 2500000, '2026-12-20'),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'm1', 1, 'Định hướng hình ảnh', 1000000, '2026-11-25'),
('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'm2', 2, 'Bộ template hoàn chỉnh', 1500000, '2026-12-12'),
('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', 'm1', 1, 'Nghiên cứu từ khóa', 1200000, '2026-12-05'),
('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000003', 'm2', 2, 'Kế hoạch nội dung', 1800000, '2027-01-05')
ON CONFLICT (id) DO NOTHING;

INSERT INTO project_milestone_plan_criteria (milestone_plan_id, position, criterion) VALUES
('30000000-0000-0000-0000-000000000001', 0, 'Wireframe đủ các khối nội dung đã thống nhất.'),
('30000000-0000-0000-0000-000000000002', 0, 'Mã nguồn chạy được và có hướng dẫn cài đặt.'),
('30000000-0000-0000-0000-000000000003', 0, 'Moodboard và hai hướng thiết kế để lựa chọn.'),
('30000000-0000-0000-0000-000000000004', 0, 'Template dễ chỉnh sửa bởi đội vận hành.'),
('30000000-0000-0000-0000-000000000005', 0, 'Tối thiểu 50 từ khóa được phân nhóm.'),
('30000000-0000-0000-0000-000000000006', 0, 'Có brief rõ ràng cho từng nội dung ưu tiên.')
ON CONFLICT DO NOTHING;
