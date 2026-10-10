-- Demo-only history: finished projects behind the three demo contributors' tiers.
--   Lê Tuấn Lộc   (SILVER, 14 XP): 10 BASIC + 2 MEDIUM
--   Trần Minh Anh (BRONZE,  7 XP): 7 BASIC
--   Phạm Gia Huy  (GOLD,   33 XP): 12 BASIC (the last 2 exceed the BASIC cap) + 10 MEDIUM + 1 HIGH
-- The projects are COMPLETED, have no owner account and never appear in the public catalog.

INSERT INTO projects (id, public_id, title, sme_name, sme_industry, sme_size, sme_contact, budget, deadline, status,
                      summary, problem, created_at, complexity, submitted_at, published_at, updated_at)
WITH planned AS (
    SELECT '40000000-0000-0000-0000-000000000001'::uuid AS contributor_id, 'BASIC' AS level, 1 AS level_order, n FROM generate_series(1, 10) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000001'::uuid, 'MEDIUM', 2, n FROM generate_series(1, 2) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000004'::uuid, 'BASIC', 1, n FROM generate_series(1, 7) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000005'::uuid, 'BASIC', 1, n FROM generate_series(1, 12) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000005'::uuid, 'MEDIUM', 2, n FROM generate_series(1, 10) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000005'::uuid, 'HIGH', 3, n FROM generate_series(1, 1) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000006'::uuid, 'BASIC', 1, n FROM generate_series(1, 10) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000006'::uuid, 'MEDIUM', 2, n FROM generate_series(1, 8) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000006'::uuid, 'HIGH', 3, n FROM generate_series(1, 2) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000007'::uuid, 'BASIC', 1, n FROM generate_series(1, 10) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000007'::uuid, 'MEDIUM', 2, n FROM generate_series(1, 4) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000008'::uuid, 'BASIC', 1, n FROM generate_series(1, 8) n
), history AS (
    SELECT row_number() OVER (ORDER BY contributor_id, level_order, n) AS seq,
           row_number() OVER (PARTITION BY contributor_id ORDER BY level_order, n) AS step,
           contributor_id, level
    FROM planned
), catalog AS (
    SELECT h.seq, h.level,
           TIMESTAMPTZ '2025-09-01 10:00:00+07' + (h.step * 12) * INTERVAL '1 day' AS completed_at,
           CASE h.level
               WHEN 'BASIC' THEN (ARRAY['Thiết kế banner khuyến mãi tháng', 'Viết 10 bài đăng fanpage',
                   'Chỉnh sửa ảnh sản phẩm cho shop online', 'Nhập danh mục sản phẩm lên website',
                   'Thiết kế menu cho quán', 'Viết mô tả sản phẩm cho cửa hàng online',
                   'Làm slide giới thiệu doanh nghiệp', 'Dựng video ngắn giới thiệu cửa hàng',
                   'Khảo sát khách hàng bằng biểu mẫu trực tuyến', 'Cập nhật hồ sơ doanh nghiệp trên bản đồ'])[1 + (h.seq % 10)]
               WHEN 'MEDIUM' THEN (ARRAY['Dựng landing page cho sự kiện', 'Kế hoạch nội dung video ngắn một tháng',
                   'Bộ nhận diện social cho cửa hàng', 'Bảng báo cáo bán hàng trên Google Sheets',
                   'Website giới thiệu homestay', 'Nghiên cứu từ khóa SEO cho blog'])[1 + (h.seq % 6)]
               ELSE 'Ứng dụng đặt bàn cho chuỗi quán cà phê'
           END AS title,
           (ARRAY['Bếp Nhà Mây', 'Tiệm Hoa Cỏ May', 'Gốm Lam Studio', 'Sách Cũ Phương Nam', 'Trà Mộc',
                  'Xưởng In Kim Ngân', 'Homestay Đồi Mơ', 'Nha khoa An Tâm'])[1 + (h.seq % 8)] AS sme_name
    FROM history h
)
SELECT ('21000000-0000-0000-0000-' || lpad(seq::text, 12, '0'))::uuid,
       'p-done-' || lpad(seq::text, 3, '0'),
       title, sme_name, 'Dịch vụ', '1-10 nhân sự', 'demo-history@genda.vn',
       CASE level WHEN 'BASIC' THEN 1200000 WHEN 'MEDIUM' THEN 2500000 ELSE 4500000 END,
       completed_at::date, 'COMPLETED',
       'Dự án đã hoàn thành, dùng làm lịch sử mẫu cho bản demo.',
       'Dữ liệu mẫu: dự án đã nghiệm thu toàn bộ các mốc.',
       completed_at - INTERVAL '21 days', level, completed_at - INTERVAL '20 days',
       completed_at - INTERVAL '19 days', completed_at
FROM catalog
ON CONFLICT (id) DO NOTHING;

INSERT INTO contributor_experience_records (contributor_id, project_id, project_title, sme_name, complexity,
                                            completed_at)
WITH planned AS (
    SELECT '40000000-0000-0000-0000-000000000001'::uuid AS contributor_id, 'BASIC' AS level, 1 AS level_order, n FROM generate_series(1, 10) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000001'::uuid, 'MEDIUM', 2, n FROM generate_series(1, 2) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000004'::uuid, 'BASIC', 1, n FROM generate_series(1, 7) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000005'::uuid, 'BASIC', 1, n FROM generate_series(1, 12) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000005'::uuid, 'MEDIUM', 2, n FROM generate_series(1, 10) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000005'::uuid, 'HIGH', 3, n FROM generate_series(1, 1) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000006'::uuid, 'BASIC', 1, n FROM generate_series(1, 10) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000006'::uuid, 'MEDIUM', 2, n FROM generate_series(1, 8) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000006'::uuid, 'HIGH', 3, n FROM generate_series(1, 2) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000007'::uuid, 'BASIC', 1, n FROM generate_series(1, 10) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000007'::uuid, 'MEDIUM', 2, n FROM generate_series(1, 4) n
    UNION ALL SELECT '40000000-0000-0000-0000-000000000008'::uuid, 'BASIC', 1, n FROM generate_series(1, 8) n
), history AS (
    SELECT row_number() OVER (ORDER BY contributor_id, level_order, n) AS seq, contributor_id
    FROM planned
)
SELECT h.contributor_id, p.id, p.title, p.sme_name, p.complexity, p.updated_at
FROM history h
JOIN projects p ON p.id = ('21000000-0000-0000-0000-' || lpad(h.seq::text, 12, '0'))::uuid
ON CONFLICT DO NOTHING;
