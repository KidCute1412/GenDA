-- ==============================================================================
-- GENDA / SKILLBRIDGE: RESET & INITIAL DEMO DATA SEED SCRIPT
-- ==============================================================================
-- Dùng file này để dọn dẹp sạch dữ liệu rác và khôi phục lại dữ liệu ban đầu
-- trên bất kỳ môi trường nào (Supabase SQL Editor hoặc Local PostgreSQL).
--
-- Lưu ý: Mật khẩu mặc định của các tài khoản là: Demo@12345
-- ==============================================================================

-- 1. Xóa dữ liệu động (bảng danh mục 'skills' giữ nguyên không xóa)
TRUNCATE TABLE projects, app_users CASCADE;

-- 2. Seed 5 tài khoản đăng nhập (password: Demo@12345)
INSERT INTO app_users (
    id, email, password_hash, display_name, role, account_state,
    sme_approval_status, tax_code, company_website,
    created_at, updated_at
) VALUES
(
    '40000000-0000-0000-0000-000000000001',
    'letuanloc.2203@hcmus.edu.vn',
    '$2a$12$HTAkRo5AM1ytl5bc3VpDR.1o8aFVSEM4mh8xRUHU5V2WiRE55d4h.',
    'Lê Tuấn Lộc',
    'CONTRIBUTOR',
    'ACTIVE',
    NULL,
    NULL,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '40000000-0000-0000-0000-000000000002',
    'contact@coffeelab.vn',
    '$2a$12$HXRLy9U39JvTE99Zwg7M2.K5a6oqOqM6O/hmoltReT7HaGpJZan3u',
    'The Coffee Lab',
    'SME',
    'ACTIVE',
    'APPROVED',
    '0316789012',
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '40000000-0000-0000-0000-000000000003',
    'admin@genda.vn',
    '$2a$12$QMqy5Djyn57pHWJojxlRuOlPMwaUNuQuhwHsGJUL2twWQEBR2gD.y',
    'Đỗ Minh Triết',
    'ADMIN',
    'ACTIVE',
    NULL,
    NULL,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '40000000-0000-0000-0000-000000000004',
    'tranminhanh@demo.genda.vn',
    '$2a$12$QMqy5Djyn57pHWJojxlRuOlPMwaUNuQuhwHsGJUL2twWQEBR2gD.y',
    'Trần Minh Anh',
    'CONTRIBUTOR',
    'ACTIVE',
    NULL,
    NULL,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '40000000-0000-0000-0000-000000000005',
    'phamgiahuy@demo.genda.vn',
    '$2a$12$QMqy5Djyn57pHWJojxlRuOlPMwaUNuQuhwHsGJUL2twWQEBR2gD.y',
    'Phạm Gia Huy',
    'CONTRIBUTOR',
    'ACTIVE',
    NULL,
    NULL,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role,
    account_state = EXCLUDED.account_state,
    sme_approval_status = EXCLUDED.sme_approval_status,
    tax_code = EXCLUDED.tax_code,
    company_website = EXCLUDED.company_website;

-- 3. Seed hồ sơ cộng tác viên cho tài khoản Lê Tuấn Lộc
INSERT INTO contributor_profiles (user_id, background_type, specialization, created_at, updated_at) VALUES
(
    '40000000-0000-0000-0000-000000000001',
    'STUDENT',
    'Phát triển web front-end',
    '2026-09-01T08:00:00Z',
    '2026-09-01T08:00:00Z'
)
ON CONFLICT (user_id) DO UPDATE SET
    background_type = EXCLUDED.background_type,
    specialization = EXCLUDED.specialization;

INSERT INTO contributor_profile_skills (user_id, position, skill_code) VALUES
('40000000-0000-0000-0000-000000000001', 0, 'react'),
('40000000-0000-0000-0000-000000000001', 1, 'nextjs'),
('40000000-0000-0000-0000-000000000001', 2, 'typescript'),
('40000000-0000-0000-0000-000000000001', 3, 'figma')
ON CONFLICT DO NOTHING;

-- 4. Seed danh mục dự án ban đầu
INSERT INTO projects (
    id, public_id, title, sme_name, sme_industry, sme_size, sme_contact,
    budget, deadline, status, summary, problem, created_at, complexity, published_at, owner_id
) VALUES
(
    '20000000-0000-0000-0000-000000000001', 'p-coffee-lab', 'Landing page cho chiến dịch cà phê mới',
    'The Coffee Lab', 'F&B', '11-50 nhân sự', 'hello@thecoffeelab.vn',
    4000000, '2026-12-20', 'PUBLISHED',
    'Thiết kế và phát triển landing page responsive cho chiến dịch ra mắt sản phẩm cà phê mới.',
    'Doanh nghiệp cần một trang đích tải nhanh, dễ đo lường và nhất quán với bộ nhận diện hiện tại.',
    '2026-09-01T08:00:00Z', 'HIGH', '2026-09-01T08:00:00Z', '40000000-0000-0000-0000-000000000002'
),
(
    '20000000-0000-0000-0000-000000000002', 'p-zen', 'Bộ nhận diện social cho Zen Yoga',
    'Zen Yoga Studio', 'Sức khỏe', '1-10 nhân sự', 'studio@zenyoga.vn',
    2500000, '2026-12-12', 'PUBLISHED',
    'Xây dựng bộ template social và hướng dẫn sử dụng cho đội ngũ vận hành của studio.',
    'Các bài đăng hiện thiếu tính nhất quán, khó tái sử dụng và chưa truyền tải được tinh thần thương hiệu.',
    '2026-09-03T08:00:00Z', 'MEDIUM', '2026-09-03T08:00:00Z', NULL
),
(
    '20000000-0000-0000-0000-000000000003', 'p-minh-chau', 'Kế hoạch nội dung SEO quý I',
    'Minh Châu Homestay', 'Du lịch', '1-10 nhân sự', 'contact@minhchauhomestay.vn',
    3000000, '2027-01-05', 'PUBLISHED',
    'Nghiên cứu từ khóa và xây dựng kế hoạch nội dung SEO thực thi được cho ba tháng.',
    'Website có nội dung rời rạc và chưa có lộ trình từ khóa gắn với nhu cầu đặt phòng.',
    '2026-09-05T08:00:00Z', 'MEDIUM', '2026-09-05T08:00:00Z', NULL
)
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
