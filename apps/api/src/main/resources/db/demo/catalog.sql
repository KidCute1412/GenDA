INSERT INTO projects (id, public_id, title, sme_name, sme_industry, sme_size, sme_contact, budget, deadline, status, summary, problem, created_at, complexity, published_at) VALUES
('20000000-0000-0000-0000-000000000001', 'p-coffee-lab', 'Website giới thiệu và đặt hàng cà phê rang xay', 'The Coffee Lab', 'F&B', '11-50 nhân sự', 'hello@thecoffeelab.vn', 4000000, '2026-12-20', 'PUBLISHED', 'Thiết kế website responsive giới thiệu dòng cà phê rang xay mới, kể câu chuyện nguồn gốc, trình bày sản phẩm và thu hút khách hàng đăng ký nhận ưu đãi.', 'Khách hàng hiện phải tìm thông tin sản phẩm qua nhiều kênh rời rạc; doanh nghiệp cần một trang tập trung để giới thiệu sản phẩm, giải thích quy trình rang, tạo niềm tin về nguồn gốc hạt và chuyển đổi lượt quan tâm thành đăng ký nhận ưu đãi.', '2026-09-01T08:00:00Z', 'HIGH', '2026-09-01T08:00:00Z'),
('20000000-0000-0000-0000-000000000002', 'p-zen', 'Bộ nhận diện social cho Zen Yoga', 'Zen Yoga Studio', 'Sức khỏe', '1-10 nhân sự', 'studio@zenyoga.vn', 2500000, '2026-12-12', 'PUBLISHED', 'Xây dựng bộ template social và hướng dẫn sử dụng cho đội ngũ vận hành của studio.', 'Các bài đăng hiện thiếu tính nhất quán, khó tái sử dụng và chưa truyền tải được tinh thần thương hiệu.', '2026-09-03T08:00:00Z', 'MEDIUM', '2026-09-03T08:00:00Z'),
('20000000-0000-0000-0000-000000000003', 'p-minh-chau', 'Kế hoạch nội dung SEO quý I', 'Minh Châu Homestay', 'Du lịch', '1-10 nhân sự', 'contact@minhchauhomestay.vn', 3000000, '2027-01-05', 'PUBLISHED', 'Nghiên cứu từ khóa và xây dựng kế hoạch nội dung SEO thực thi được cho ba tháng.', 'Website có nội dung rời rạc và chưa có lộ trình từ khóa gắn với nhu cầu đặt phòng.', '2026-09-05T08:00:00Z', 'MEDIUM', '2026-09-05T08:00:00Z'),
('20000000-0000-0000-0000-000000000004', 'p-coffee-brand', 'Bộ nhận diện thương hiệu dòng Cold Brew mới', 'The Coffee Lab', 'F&B', '11-50 nhân sự', 'hello@thecoffeelab.vn', 2500000, '2026-12-28', 'PUBLISHED', 'Thiết kế bao bì chai thủy tinh, tem nhãn và bộ ấn phẩm POSM tại quầy cho dòng cà phê ủ lạnh.', 'Dòng sản phẩm mới sắp ra mắt vào dịp lễ nhưng chưa có nhãn chai và poster giới thiệu đồng bộ.', '2026-09-06T08:00:00Z', 'MEDIUM', '2026-09-06T08:00:00Z'),
('20000000-0000-0000-0000-000000000005', 'p-tiem-gom', 'Bộ bài viết truyền thông workshop gốm thủ công', 'Tiệm Gốm Mộc', 'Thủ công mỹ nghệ', '1-10 nhân sự', 'gommoc.saigon@gmail.com', 1200000, '2026-11-30', 'PUBLISHED', 'Soạn 10 bài viết fanpage và kịch bản video ngắn quảng bá cho workshop làm gốm cuối tuần.', 'Xưởng gốm mở lớp trải nghiệm nhưng trang mạng xã hội ít bài viết và chưa thu hút được giới trẻ.', '2026-09-08T08:00:00Z', 'BASIC', '2026-09-08T08:00:00Z'),
('20000000-0000-0000-0000-000000000006', 'p-tra-hoa', 'Thiết kế menu điện tử và bảng giá cho Trà Hoa Quán', 'Trà Hoa Cúc Quán', 'F&B', '1-10 nhân sự', 'trahoaquan@gmail.com', 1000000, '2026-11-25', 'PUBLISHED', 'Thiết kế menu hiển thị trên tablet tại bàn và bảng giá treo tường phong cách mộc mạc.', 'Quán đổi công thức và thêm 8 món trà thảo mộc mới cần cập nhật menu gấp.', '2026-09-10T08:00:00Z', 'BASIC', '2026-09-10T08:00:00Z'),
('20000000-0000-0000-0000-000000000007', 'p-nha-sach', 'Trang giới thiệu bộ sách thiếu nhi song ngữ', 'Sách Cũ Phương Nam', 'Xuất bản & Bán lẻ', '11-50 nhân sự', 'phuongnambooks@gmail.com', 2200000, '2026-12-25', 'PUBLISHED', 'Xây dựng trang landing page tương tác nhẹ giới thiệu bộ truyện tranh song ngữ cho trẻ em.', 'Bộ sách mới cần trang giới thiệu sinh động, có audio đọc thử các trang mẫu.', '2026-09-12T08:00:00Z', 'MEDIUM', '2026-09-12T08:00:00Z')
ON CONFLICT (id) DO NOTHING;

UPDATE projects SET
    title = 'Website giới thiệu và đặt hàng cà phê rang xay',
    summary = 'Thiết kế website responsive giới thiệu dòng cà phê rang xay mới, kể câu chuyện nguồn gốc, trình bày sản phẩm và thu hút khách hàng đăng ký nhận ưu đãi.',
    problem = 'Khách hàng hiện phải tìm thông tin sản phẩm qua nhiều kênh rời rạc; doanh nghiệp cần một trang tập trung để giới thiệu sản phẩm, giải thích quy trình rang, tạo niềm tin về nguồn gốc hạt và chuyển đổi lượt quan tâm thành đăng ký nhận ưu đãi.',
    updated_at = CURRENT_TIMESTAMP
WHERE id = '20000000-0000-0000-0000-000000000001';

INSERT INTO projects (id, public_id, owner_id, title, sme_name, sme_industry, sme_size, sme_contact,
                     budget, deadline, status, summary, problem, created_at, complexity, updated_at, published_at)
VALUES
('20000000-0000-0000-0000-000000000008', 'p-coffee-subscription', '40000000-0000-0000-0000-000000000002', 'Trang đăng ký gói cà phê định kỳ', 'The Coffee Lab', 'F&B', '11-50 nhân sự', 'hello@thecoffeelab.vn', 4500000, '2027-02-28', 'PUBLISHED', 'Thiết kế và phát triển website giới thiệu các gói cà phê giao định kỳ, cho phép khách chọn khẩu vị, tần suất giao và gửi yêu cầu tư vấn.', 'Khách hàng hiện đặt lại qua tin nhắn thủ công, đội vận hành khó theo dõi lựa chọn và lịch giao. Cần trải nghiệm rõ ràng để khách hiểu các gói, chọn cấu hình phù hợp và gửi thông tin liên hệ có xác nhận.', '2026-10-11T08:00:00Z', 'HIGH', '2026-10-11T08:00:00Z', '2026-10-11T08:00:00Z'),
('20000000-0000-0000-0000-000000000009', 'p-coffee-social-kit', '40000000-0000-0000-0000-000000000002', 'Bộ nội dung social cho mùa cà phê cuối năm', 'The Coffee Lab', 'F&B', '11-50 nhân sự', 'hello@thecoffeelab.vn', 3000000, '2027-01-31', 'PUBLISHED', 'Xây dựng bộ nội dung social trong 6 tuần gồm lịch đăng, caption, hướng dẫn hình ảnh và template để đội marketing tự chỉnh sửa.', 'Các kênh social đăng bài không đều và thông điệp sản phẩm thiếu nhất quán. Đội ngũ cần bộ nội dung triển khai ngay, phù hợp chiến dịch quà tặng và có hướng dẫn tái sử dụng.', '2026-10-11T08:00:00Z', 'MEDIUM', '2026-10-11T08:00:00Z', '2026-10-11T08:00:00Z'),
('20000000-0000-0000-0000-000000000010', 'p-zen-class-booking', '40000000-0000-0000-0000-000000000009', 'Trang lịch lớp và đăng ký trải nghiệm yoga', 'Zen Yoga Studio', 'Sức khỏe', '1-10 nhân sự', 'studio@zenyoga.vn', 4000000, '2027-03-15', 'PUBLISHED', 'Tạo trang lịch lớp yoga responsive với bộ lọc theo cấp độ, khung giờ, huấn luyện viên và form đăng ký buổi trải nghiệm.', 'Lịch lớp hiện được gửi dưới dạng ảnh và nhanh lỗi thời; người mới khó biết lớp phù hợp và nhân viên phải xác nhận thủ công. Studio cần lịch dễ cập nhật cùng form ghi nhận lựa chọn và thông tin liên hệ.', '2026-10-11T08:00:00Z', 'HIGH', '2026-10-11T08:00:00Z', '2026-10-11T08:00:00Z'),
('20000000-0000-0000-0000-000000000011', 'p-zen-wellness-content', '40000000-0000-0000-0000-000000000009', 'Lịch nội dung chăm sóc sức khỏe tinh thần', 'Zen Yoga Studio', 'Sức khỏe', '1-10 nhân sự', 'studio@zenyoga.vn', 2500000, '2027-02-15', 'PUBLISHED', 'Lập lịch nội dung 8 tuần cho Instagram và Facebook, kèm chủ đề, caption nháp, định hướng visual và lời kêu gọi đăng ký lớp.', 'Bài đăng của studio tập trung vào thông báo lớp, chưa giải đáp câu hỏi của người mới và thiếu nội dung duy trì tương tác. Cần kế hoạch nhất quán, đúng giọng thương hiệu và triển khai được với nguồn lực nhỏ.', '2026-10-11T08:00:00Z', 'MEDIUM', '2026-10-11T08:00:00Z', '2026-10-11T08:00:00Z'),
('20000000-0000-0000-0000-000000000012', 'p-coffee-loyalty-page', '40000000-0000-0000-0000-000000000002', 'Trang giới thiệu chương trình khách hàng thân thiết', 'The Coffee Lab', 'F&B', '11-50 nhân sự', 'hello@thecoffeelab.vn', 3500000, '2027-02-10', 'PUBLISHED', 'Phát triển trang giới thiệu quyền lợi thành viên, các hạng tích điểm và quy trình đăng ký nhận ưu đãi qua email.', 'Khách mua thường xuyên chưa biết quyền lợi tích điểm và nhân viên giải thích chương trình không đồng nhất. Doanh nghiệp cần nguồn thông tin chính thức, dễ xem trên điện thoại và có lời mời đăng ký rõ ràng.', '2026-10-11T08:00:00Z', 'MEDIUM', '2026-10-11T08:00:00Z', '2026-10-11T08:00:00Z')
ON CONFLICT (id) DO UPDATE SET
    owner_id = EXCLUDED.owner_id, title = EXCLUDED.title, sme_name = EXCLUDED.sme_name,
    sme_industry = EXCLUDED.sme_industry, sme_size = EXCLUDED.sme_size, sme_contact = EXCLUDED.sme_contact,
    budget = EXCLUDED.budget, deadline = EXCLUDED.deadline, status = EXCLUDED.status,
    summary = EXCLUDED.summary, problem = EXCLUDED.problem, complexity = EXCLUDED.complexity,
    updated_at = CURRENT_TIMESTAMP, published_at = EXCLUDED.published_at;

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
WHERE id IN ('20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004');

UPDATE projects SET owner_id = '40000000-0000-0000-0000-000000000009'
WHERE id = '20000000-0000-0000-0000-000000000002' AND owner_id IS NULL;

-- Replace demo project detail collections so every run yields the same complete sample data.
DELETE FROM project_skills WHERE project_id IN (
    '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008',
    '20000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000010',
    '20000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000012');
DELETE FROM project_acceptance_criteria WHERE project_id IN (
    '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008',
    '20000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000010',
    '20000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000012');
DELETE FROM project_milestone_plans WHERE project_id IN (
    '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008',
    '20000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000010',
    '20000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000012');

INSERT INTO project_skills (project_id, position, skill_code) VALUES
('20000000-0000-0000-0000-000000000001', 0, 'react'), ('20000000-0000-0000-0000-000000000001', 1, 'typescript'), ('20000000-0000-0000-0000-000000000001', 2, 'figma'), ('20000000-0000-0000-0000-000000000001', 3, 'seo'), ('20000000-0000-0000-0000-000000000001', 4, 'content-marketing'),
('20000000-0000-0000-0000-000000000008', 0, 'react'), ('20000000-0000-0000-0000-000000000008', 1, 'typescript'), ('20000000-0000-0000-0000-000000000008', 2, 'figma'), ('20000000-0000-0000-0000-000000000008', 3, 'seo'),
('20000000-0000-0000-0000-000000000009', 0, 'content-marketing'), ('20000000-0000-0000-0000-000000000009', 1, 'copywriting'), ('20000000-0000-0000-0000-000000000009', 2, 'figma'), ('20000000-0000-0000-0000-000000000009', 3, 'meta-ads'),
('20000000-0000-0000-0000-000000000010', 0, 'react'), ('20000000-0000-0000-0000-000000000010', 1, 'typescript'), ('20000000-0000-0000-0000-000000000010', 2, 'ui-ux'), ('20000000-0000-0000-0000-000000000010', 3, 'figma'),
('20000000-0000-0000-0000-000000000011', 0, 'content-marketing'), ('20000000-0000-0000-0000-000000000011', 1, 'copywriting'), ('20000000-0000-0000-0000-000000000011', 2, 'meta-ads'),
('20000000-0000-0000-0000-000000000012', 0, 'react'), ('20000000-0000-0000-0000-000000000012', 1, 'nextjs'), ('20000000-0000-0000-0000-000000000012', 2, 'typescript'), ('20000000-0000-0000-0000-000000000012', 3, 'ui-ux');

INSERT INTO project_acceptance_criteria (project_id, position, criterion) VALUES
('20000000-0000-0000-0000-000000000001', 0, 'Hiển thị tốt từ màn hình 360px đến desktop.'),
('20000000-0000-0000-0000-000000000001', 1, 'Điểm Lighthouse Performance tối thiểu 85 trên mobile.'),
('20000000-0000-0000-0000-000000000001', 2, 'Form đăng ký nhận ưu đãi có trạng thái thành công và thông báo lỗi dễ hiểu.'),
('20000000-0000-0000-0000-000000000001', 3, 'Mã nguồn, biến môi trường mẫu và hướng dẫn chạy được bàn giao.'),
('20000000-0000-0000-0000-000000000008', 0, 'Trang giải thích rõ quyền lợi, giá và lịch giao của từng gói.'), ('20000000-0000-0000-0000-000000000008', 1, 'Form chọn khẩu vị, tần suất và thông tin liên hệ có kiểm tra dữ liệu.'), ('20000000-0000-0000-0000-000000000008', 2, 'Giao diện hoạt động tốt ở chiều rộng 360px và desktop.'), ('20000000-0000-0000-0000-000000000008', 3, 'Bàn giao mã nguồn, hướng dẫn cài đặt và checklist kiểm thử.'),
('20000000-0000-0000-0000-000000000009', 0, 'Lịch nội dung bao phủ đủ 6 tuần và có định dạng đăng đề xuất.'), ('20000000-0000-0000-0000-000000000009', 1, 'Mỗi bài có caption, CTA và gợi ý hình ảnh nhất quán.'), ('20000000-0000-0000-0000-000000000009', 2, 'Template bàn giao có thể chỉnh sửa bằng Figma.'),
('20000000-0000-0000-0000-000000000010', 0, 'Lịch lọc được theo cấp độ, ngày và huấn luyện viên.'), ('20000000-0000-0000-0000-000000000010', 1, 'Form đăng ký báo trạng thái thành công và lỗi xác thực.'), ('20000000-0000-0000-0000-000000000010', 2, 'Có trạng thái rỗng khi không tìm thấy lớp phù hợp.'),
('20000000-0000-0000-0000-000000000011', 0, 'Kế hoạch có tối thiểu 3 bài mỗi tuần trong 8 tuần.'), ('20000000-0000-0000-0000-000000000011', 1, 'Nội dung có nguồn tham khảo và tránh tuyên bố y tế không kiểm chứng.'), ('20000000-0000-0000-0000-000000000011', 2, 'Bàn giao lịch ở định dạng dễ cập nhật bởi đội studio.'),
('20000000-0000-0000-0000-000000000012', 0, 'Quyền lợi và cách tính điểm được mô tả nhất quán, dễ hiểu.'), ('20000000-0000-0000-0000-000000000012', 1, 'Trang hiển thị rõ trên mobile và có CTA đăng ký.'), ('20000000-0000-0000-0000-000000000012', 2, 'Form đăng ký có xác nhận thành công và thông báo lỗi rõ ràng.');

INSERT INTO project_milestone_plans (id, project_id, public_id, position, title, budget, deadline) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'm1', 1, 'Khám phá yêu cầu, wireframe và UI', 1500000, '2026-11-20'),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'm2', 2, 'Phát triển website, kiểm thử và bàn giao', 2500000, '2026-12-20'),
('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000008', 'm1', 1, 'Phân tích gói dịch vụ và thiết kế UI', 1500000, '2027-01-20'), ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000008', 'm2', 2, 'Phát triển, kiểm thử và bàn giao', 3000000, '2027-02-28'),
('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000009', 'm1', 1, 'Thông điệp chiến dịch và lịch nội dung', 1200000, '2026-12-20'), ('30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000009', 'm2', 2, 'Caption, visual guide và template', 1800000, '2027-01-31'),
('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000010', 'm1', 1, 'Luồng trải nghiệm và prototype lịch lớp', 1600000, '2027-01-31'), ('30000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000010', 'm2', 2, 'Phát triển giao diện và kiểm thử form', 2400000, '2027-03-15'),
('30000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000011', 'm1', 1, 'Định hướng chủ đề và lịch 8 tuần', 1000000, '2027-01-10'), ('30000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000011', 'm2', 2, 'Caption, visual guide và bàn giao', 1500000, '2027-02-15'),
('30000000-0000-0000-0000-000000000016', '20000000-0000-0000-0000-000000000012', 'm1', 1, 'Nội dung chương trình và wireframe', 1200000, '2027-01-10'), ('30000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000012', 'm2', 2, 'Phát triển trang và bàn giao', 2300000, '2027-02-10');

INSERT INTO project_milestone_plan_criteria (milestone_plan_id, position, criterion) VALUES
('30000000-0000-0000-0000-000000000001', 0, 'Wireframe đầy đủ các trang và trạng thái chính đã thống nhất.'), ('30000000-0000-0000-0000-000000000001', 1, 'Thiết kế mobile và desktop thể hiện rõ hệ thống phân cấp nội dung.'), ('30000000-0000-0000-0000-000000000002', 0, 'Website responsive, form được kiểm tra với dữ liệu hợp lệ và không hợp lệ.'), ('30000000-0000-0000-0000-000000000002', 1, 'Mã nguồn chạy được, có hướng dẫn cài đặt và checklist bàn giao.'),
('30000000-0000-0000-0000-000000000008', 0, 'Sitemap và wireframe được SME duyệt trước khi phát triển.'), ('30000000-0000-0000-0000-000000000008', 1, 'Prototype bao gồm lựa chọn gói và trạng thái form.'), ('30000000-0000-0000-0000-000000000009', 0, 'Các trang responsive và form vượt qua checklist kiểm thử.'), ('30000000-0000-0000-0000-000000000009', 1, 'Mã nguồn cùng hướng dẫn chạy được bàn giao.'),
('30000000-0000-0000-0000-000000000010', 0, 'Thông điệp và lịch đăng được duyệt theo mục tiêu chiến dịch.'), ('30000000-0000-0000-0000-000000000011', 0, 'Bàn giao caption và gợi ý hình ảnh cho toàn bộ lịch.'), ('30000000-0000-0000-0000-000000000011', 1, 'Template Figma có hướng dẫn thay ảnh và nội dung.'),
('30000000-0000-0000-0000-000000000012', 0, 'Prototype hiển thị lịch lớp và luồng đăng ký trên mobile.'), ('30000000-0000-0000-0000-000000000013', 0, 'Bộ lọc và form hoạt động trên các kích thước màn hình.'), ('30000000-0000-0000-0000-000000000013', 1, 'Có hướng dẫn cập nhật lịch và checklist bàn giao.'),
('30000000-0000-0000-0000-000000000014', 0, 'Chủ đề nội dung được chia theo mục tiêu từng tuần.'), ('30000000-0000-0000-0000-000000000015', 0, 'Caption có CTA phù hợp và được kiểm tra thông tin.'), ('30000000-0000-0000-0000-000000000015', 1, 'Lịch và visual guide có thể tiếp tục chỉnh sửa.'),
('30000000-0000-0000-0000-000000000016', 0, 'Quy tắc tích điểm và quyền lợi được xác nhận với SME.'), ('30000000-0000-0000-0000-000000000017', 0, 'Trang responsive, CTA và form được kiểm thử.'), ('30000000-0000-0000-0000-000000000017', 1, 'Mã nguồn và tài liệu bàn giao có thể chạy theo hướng dẫn.');
