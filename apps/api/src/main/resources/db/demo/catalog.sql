INSERT INTO projects (id, public_id, title, sme_name, sme_industry, sme_size, sme_contact, budget, deadline, status, summary, problem, created_at, complexity, published_at) VALUES
('20000000-0000-0000-0000-000000000001', 'p-coffee-lab', 'Landing page cho chiến dịch cà phê mới', 'The Coffee Lab', 'F&B', '11-50 nhân sự', 'hello@thecoffeelab.vn', 4000000, '2026-12-20', 'PUBLISHED', 'Thiết kế và phát triển landing page responsive cho chiến dịch ra mắt sản phẩm cà phê mới.', 'Doanh nghiệp cần một trang đích tải nhanh, dễ đo lường và nhất quán với bộ nhận diện hiện tại.', '2026-09-01T08:00:00Z', 'HIGH', '2026-09-01T08:00:00Z'),
('20000000-0000-0000-0000-000000000002', 'p-zen', 'Bộ nhận diện social cho Zen Yoga', 'Zen Yoga Studio', 'Sức khỏe', '1-10 nhân sự', 'studio@zenyoga.vn', 2500000, '2026-12-12', 'PUBLISHED', 'Xây dựng bộ template social và hướng dẫn sử dụng cho đội ngũ vận hành của studio.', 'Các bài đăng hiện thiếu tính nhất quán, khó tái sử dụng và chưa truyền tải được tinh thần thương hiệu.', '2026-09-03T08:00:00Z', 'MEDIUM', '2026-09-03T08:00:00Z'),
('20000000-0000-0000-0000-000000000003', 'p-minh-chau', 'Kế hoạch nội dung SEO quý I', 'Minh Châu Homestay', 'Du lịch', '1-10 nhân sự', 'contact@minhchauhomestay.vn', 3000000, '2027-01-05', 'PUBLISHED', 'Nghiên cứu từ khóa và xây dựng kế hoạch nội dung SEO thực thi được cho ba tháng.', 'Website có nội dung rời rạc và chưa có lộ trình từ khóa gắn với nhu cầu đặt phòng.', '2026-09-05T08:00:00Z', 'MEDIUM', '2026-09-05T08:00:00Z'),
('20000000-0000-0000-0000-000000000004', 'p-coffee-brand', 'Bộ nhận diện thương hiệu dòng Cold Brew mới', 'The Coffee Lab', 'F&B', '11-50 nhân sự', 'hello@thecoffeelab.vn', 2500000, '2026-12-28', 'PUBLISHED', 'Thiết kế bao bì chai thủy tinh, tem nhãn và bộ ấn phẩm POSM tại quầy cho dòng cà phê ủ lạnh.', 'Dòng sản phẩm mới sắp ra mắt vào dịp lễ nhưng chưa có nhãn chai và poster giới thiệu đồng bộ.', '2026-09-06T08:00:00Z', 'MEDIUM', '2026-09-06T08:00:00Z'),
('20000000-0000-0000-0000-000000000005', 'p-tiem-gom', 'Bộ bài viết truyền thông workshop gốm thủ công', 'Tiệm Gốm Mộc', 'Thủ công mỹ nghệ', '1-10 nhân sự', 'gommoc.saigon@gmail.com', 1200000, '2026-11-30', 'PUBLISHED', 'Soạn 10 bài viết fanpage và kịch bản video ngắn quảng bá cho workshop làm gốm cuối tuần.', 'Xưởng gốm mở lớp trải nghiệm nhưng trang mạng xã hội ít bài viết và chưa thu hút được giới trẻ.', '2026-09-08T08:00:00Z', 'BASIC', '2026-09-08T08:00:00Z'),
('20000000-0000-0000-0000-000000000006', 'p-tra-hoa', 'Thiết kế menu điện tử và bảng giá cho Trà Hoa Quán', 'Trà Hoa Cúc Quán', 'F&B', '1-10 nhân sự', 'trahoaquan@gmail.com', 1000000, '2026-11-25', 'PUBLISHED', 'Thiết kế menu hiển thị trên tablet tại bàn và bảng giá treo tường phong cách mộc mạc.', 'Quán đổi công thức và thêm 8 món trà thảo mộc mới cần cập nhật menu gấp.', '2026-09-10T08:00:00Z', 'BASIC', '2026-09-10T08:00:00Z'),
('20000000-0000-0000-0000-000000000007', 'p-nha-sach', 'Trang giới thiệu bộ sách thiếu nhi song ngữ', 'Sách Cũ Phương Nam', 'Xuất bản & Bán lẻ', '11-50 nhân sự', 'phuongnambooks@gmail.com', 2200000, '2026-12-25', 'PUBLISHED', 'Xây dựng trang landing page tương tác nhẹ giới thiệu bộ truyện tranh song ngữ cho trẻ em.', 'Bộ sách mới cần trang giới thiệu sinh động, có audio đọc thử các trang mẫu.', '2026-09-12T08:00:00Z', 'MEDIUM', '2026-09-12T08:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO project_skills (project_id, position, skill_code) VALUES
('20000000-0000-0000-0000-000000000001', 0, 'react'),
('20000000-0000-0000-0000-000000000001', 1, 'typescript'),
('20000000-0000-0000-0000-000000000001', 2, 'figma'),
('20000000-0000-0000-0000-000000000002', 0, 'figma'),
('20000000-0000-0000-0000-000000000002', 1, 'graphic-design'),
('20000000-0000-0000-0000-000000000003', 0, 'seo'),
('20000000-0000-0000-0000-000000000003', 1, 'content-marketing'),
('20000000-0000-0000-0000-000000000003', 2, 'copywriting'),
('20000000-0000-0000-0000-000000000004', 0, 'figma'),
('20000000-0000-0000-0000-000000000004', 1, 'graphic-design'),
('20000000-0000-0000-0000-000000000004', 2, 'ui-ux'),
('20000000-0000-0000-0000-000000000005', 0, 'content-marketing'),
('20000000-0000-0000-0000-000000000005', 1, 'copywriting'),
('20000000-0000-0000-0000-000000000006', 0, 'figma'),
('20000000-0000-0000-0000-000000000006', 1, 'graphic-design'),
('20000000-0000-0000-0000-000000000007', 0, 'react'),
('20000000-0000-0000-0000-000000000007', 1, 'nextjs'),
('20000000-0000-0000-0000-000000000007', 2, 'typescript')
ON CONFLICT DO NOTHING;

INSERT INTO project_acceptance_criteria (project_id, position, criterion) VALUES
('20000000-0000-0000-0000-000000000001', 0, 'Hiển thị tốt từ màn hình 360px đến desktop.'),
('20000000-0000-0000-0000-000000000001', 1, 'Điểm Lighthouse Performance tối thiểu 85.'),
('20000000-0000-0000-0000-000000000002', 0, 'Bàn giao file Figma có component và style tái sử dụng.'),
('20000000-0000-0000-0000-000000000002', 1, 'Có tối thiểu 12 template cho ba định dạng social.'),
('20000000-0000-0000-0000-000000000003', 0, 'Bộ từ khóa có intent và độ ưu tiên rõ ràng.'),
('20000000-0000-0000-0000-000000000003', 1, 'Lịch nội dung bao phủ đủ ba tháng.'),
('20000000-0000-0000-0000-000000000004', 0, 'Bàn giao file vector hoàn chỉnh cho nhà in.'),
('20000000-0000-0000-0000-000000000004', 1, 'Có mockup 3D hiển thị chai thực tế.'),
('20000000-0000-0000-0000-000000000005', 0, '10 bài viết kèm gợi ý visual.'),
('20000000-0000-0000-0000-000000000005', 1, 'Tone giọng ấm cúng, gần gũi.'),
('20000000-0000-0000-0000-000000000006', 0, 'File Figma dễ thay giá và hình ảnh.'),
('20000000-0000-0000-0000-000000000006', 1, 'Xuất được định dạng chuẩn cho màn hình 16:9.'),
('20000000-0000-0000-0000-000000000007', 0, 'Tải trang dưới 2 giây, không giật lag.'),
('20000000-0000-0000-0000-000000000007', 1, 'Giao diện bắt mắt, thân thiện với phụ huynh và trẻ nhỏ.')
ON CONFLICT DO NOTHING;

INSERT INTO project_milestone_plans (id, project_id, public_id, position, title, budget, deadline) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'm1', 1, 'Wireframe và UI', 1500000, '2026-11-20'),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'm2', 2, 'Frontend hoàn chỉnh', 2500000, '2026-12-20'),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'm1', 1, 'Định hướng hình ảnh', 1000000, '2026-11-25'),
('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'm2', 2, 'Bộ template hoàn chỉnh', 1500000, '2026-12-12'),
('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', 'm1', 1, 'Nghiên cứu từ khóa', 1200000, '2026-12-05'),
('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000003', 'm2', 2, 'Kế hoạch nội dung', 1800000, '2027-01-05'),
('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000004', 'm1', 1, 'Moodboard và nhãn chai mẫu', 1000000, '2026-11-28'),
('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000004', 'm2', 2, 'Bộ POSM và file in ấn', 1500000, '2026-12-28'),
('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000005', 'm1', 1, '5 bài viết đầu tiên', 600000, '2026-11-15'),
('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000005', 'm2', 2, '5 bài viết và kịch bản video', 600000, '2026-11-30'),
('30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000006', 'm1', 1, 'Menu hoàn chỉnh', 1000000, '2026-11-25'),
('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000007', 'm1', 1, 'Giao diện mẫu', 1000000, '2026-12-05'),
('30000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000007', 'm2', 2, 'Hoàn thiện tính năng audio thử', 1200000, '2026-12-25')
ON CONFLICT (id) DO NOTHING;

INSERT INTO project_milestone_plan_criteria (milestone_plan_id, position, criterion) VALUES
('30000000-0000-0000-0000-000000000001', 0, 'Wireframe đủ các khối nội dung đã thống nhất.'),
('30000000-0000-0000-0000-000000000002', 0, 'Mã nguồn chạy được và có hướng dẫn cài đặt.'),
('30000000-0000-0000-0000-000000000003', 0, 'Moodboard và hai hướng thiết kế để lựa chọn.'),
('30000000-0000-0000-0000-000000000004', 0, 'Template dễ chỉnh sửa bởi đội vận hành.'),
('30000000-0000-0000-0000-000000000005', 0, 'Tối thiểu 50 từ khóa được phân nhóm.'),
('30000000-0000-0000-0000-000000000006', 0, 'Có brief rõ ràng cho từng nội dung ưu tiên.'),
('30000000-0000-0000-0000-000000000007', 0, '3 hướng nhãn chai khác biệt để chọn.'),
('30000000-0000-0000-0000-000000000008', 0, 'File in đúng chuẩn màu CMYK và kích thước thực tế.'),
('30000000-0000-0000-0000-000000000009', 0, 'Bài viết có lời dẫn hấp dẫn và thông tin workshop chi tiết.'),
('30000000-0000-0000-0000-000000000010', 0, 'Kịch bản video ngắn dưới 60 giây dễ quay.'),
('30000000-0000-0000-0000-000000000011', 0, 'Bố cục menu khoa học, dễ đọc.'),
('30000000-0000-0000-0000-000000000012', 0, 'Layout minh họa sinh động, tương thích mobile.'),
('30000000-0000-0000-0000-000000000013', 0, 'Tính năng đọc thử hoạt động trơn tru trên mọi trình duyệt.')
ON CONFLICT DO NOTHING;

-- Demo SMEs own their catalog projects so their applicants can be reviewed after login:
UPDATE projects SET owner_id = '40000000-0000-0000-0000-000000000002'
WHERE id IN ('20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004') AND owner_id IS NULL;

UPDATE projects SET owner_id = '40000000-0000-0000-0000-000000000009'
WHERE id = '20000000-0000-0000-0000-000000000002' AND owner_id IS NULL;
