/**
 * Dữ liệu mẫu cho bản dựng giao diện.
 *
 * Bốn quy ước, đều bắt nguồn từ kỷ luật ở docs/design.md 4.9:
 *  1. Tên người, tên doanh nghiệp và trường học đều là tên Việt Nam nghe được,
 *     đặt trong bối cảnh TP.HCM. Không có "Nguyễn Văn A", không có "Acme".
 *  2. Không có số liệu tăng trưởng bịa ra. Nền tảng chưa vận hành, nên mọi con
 *     số trên trang chủ đều là CAM KẾT SẢN PHẨM lấy từ requirement.md.
 *  3. Ngân sách luôn nằm trong khoảng 1.000.000 - 5.000.000 (BR-10) và tổng
 *     ngân sách các mốc luôn bằng đúng ngân sách dự án (FR-MIL-02).
 *  4. `TODAY` là hằng số, không phải `new Date()`: mốc thời gian phải giống hệt
 *     nhau giữa render trên máy chủ và trên trình duyệt.
 */

export const TODAY = "2026-09-18";

/** Danh mục kỹ năng chuẩn của hệ thống (FR-USR-05) — cấm nhập tự do. */
export const SKILL_CATALOG = [
  "React",
  "Next.js",
  "TypeScript",
  "Figma",
  "UI/UX",
  "Content Marketing",
  "SEO",
  "Copywriting",
  "Thiết kế đồ họa",
  "Dựng video",
  "Quảng cáo Meta",
  "Python"
] as const;

export const BUDGET_MIN = 1_000_000;
export const BUDGET_MAX = 5_000_000;

/* ==========================================================================
   Sinh viên đang đăng nhập
   ========================================================================== */

/**
 * Bốn trạng thái xác thực. Khai báo thành union rõ ràng thay vì để TypeScript
 * suy ra literal từ giá trị mẫu: màn hình hồ sơ phải dựng được banner cho CẢ
 * BỐN trạng thái, nếu kiểu bị thu hẹp về đúng giá trị đang dùng thì ba nhánh
 * còn lại sẽ bị báo là mã chết và dễ bị xóa nhầm.
 */
export type VerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";

export const CURRENT_STUDENT: {
  name: string;
  slug: string;
  school: string;
  major: string;
  year: string;
  verification: VerificationStatus;
  schoolEmail: string;
  skills: string[];
} = {
  name: "Nguyễn Hải Nam",
  slug: "nguyen-hai-nam",
  school: "ĐH Khoa học Tự nhiên, ĐHQG-HCM",
  major: "Công nghệ Thông tin",
  year: "Sinh viên năm 3",
  verification: "VERIFIED",
  schoolEmail: "namnh.2203@hcmus.edu.vn",
  skills: ["React", "Next.js", "TypeScript", "Figma"]
};

/* ==========================================================================
   Dự án
   ========================================================================== */

export type Milestone = {
  id: string;
  order: number;
  title: string;
  budget: number;
  deadline: string;
  status: "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "ACCEPTED" | "CHANGES_REQUESTED";
  escrow: "PENDING_FUNDING" | "FUNDED" | "RELEASED";
  criteria: string;
};

export type Project = {
  id: string;
  title: string;
  smeName: string;
  smeIndustry: string;
  smeSize: string;
  smeContact: string;
  budget: number;
  deadline: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  skills: string[];
  summary: string;
  problem: string;
  acceptance: string[];
  milestones: Milestone[];
  applicantCount: number;
};

export const PROJECTS: Project[] = [
  {
    id: "p-coffee-lab",
    title: "Landing page giới thiệu thực đơn mùa mới",
    smeName: "The Coffee Lab",
    smeIndustry: "F&B",
    smeSize: "8 nhân sự, 2 cửa hàng",
    smeContact: "Chị Trần Mai Anh",
    budget: 2_500_000,
    deadline: "2026-10-20",
    status: "PUBLISHED",
    skills: ["Next.js", "Figma", "UI/UX"],
    summary:
      "Một trang giới thiệu thực đơn mùa mới, chạy tốt trên điện thoại, có nút đặt bàn dẫn sang Zalo.",
    problem:
      "Quán đang có thực đơn mùa mới nhưng chỉ đăng ảnh rời trên fanpage, khách vào xem không thấy được toàn bộ. Cần một trang riêng để gắn vào bio Instagram và mã QR đặt trên bàn. Nội dung và ảnh món quán sẽ gửi đủ ngay khi bắt đầu.",
    acceptance: [
      "Trang chạy đúng trên Chrome và Safari, cả trên điện thoại lẫn máy tính",
      "Điểm Lighthouse phần Hiệu năng và Tiếp cận đều từ 90 trở lên",
      "Bàn giao mã nguồn qua GitHub kèm hướng dẫn chạy",
      "Quán tự sửa được tên món và giá mà không cần gọi lại cho bạn"
    ],
    milestones: [
      {
        id: "m1",
        order: 1,
        title: "Wireframe và thống nhất bố cục",
        budget: 800_000,
        deadline: "2026-09-30",
        status: "PENDING",
        escrow: "PENDING_FUNDING",
        criteria: "Bản wireframe cho cả điện thoại và máy tính, quán duyệt xong bố cục."
      },
      {
        id: "m2",
        order: 2,
        title: "Lập trình giao diện và đưa lên môi trường chạy thử",
        budget: 1_700_000,
        deadline: "2026-10-20",
        status: "PENDING",
        escrow: "PENDING_FUNDING",
        criteria: "Trang chạy được trên đường dẫn công khai, đủ các mục theo wireframe."
      }
    ],
    applicantCount: 4
  },
  {
    id: "p-zen",
    title: "Viết 10 bài chuẩn SEO cho chuyên mục phối đồ",
    smeName: "Thời trang Zen",
    smeIndustry: "Bán lẻ",
    smeSize: "12 nhân sự",
    smeContact: "Anh Huỳnh Gia Bảo",
    budget: 1_500_000,
    deadline: "2026-10-12",
    status: "PUBLISHED",
    skills: ["SEO", "Copywriting", "Content Marketing"],
    summary:
      "Mười bài viết cho chuyên mục phối đồ trên website, mỗi bài 800-1.000 chữ, có nghiên cứu từ khóa.",
    problem:
      "Website của shop gần như không có lượt truy cập tự nhiên. Shop muốn bắt đầu từ chuyên mục phối đồ vì đây là thứ khách hay tìm. Bộ từ khóa gợi ý shop đã có sẵn, bạn rà soát lại và bổ sung.",
    acceptance: [
      "Mỗi bài 800-1.000 chữ, có tiêu đề phụ rõ ràng, không sao chép",
      "Mỗi bài nhắm một từ khóa chính đã thống nhất trước",
      "Nộp dạng Google Docs, đã gắn sẵn thẻ tiêu đề đúng cấp"
    ],
    milestones: [
      {
        id: "m1",
        order: 1,
        title: "Nghiên cứu từ khóa và dàn ý 10 bài",
        budget: 500_000,
        deadline: "2026-09-26",
        status: "PENDING",
        escrow: "PENDING_FUNDING",
        criteria: "Bảng từ khóa kèm dàn ý từng bài, shop duyệt trước khi viết."
      },
      {
        id: "m2",
        order: 2,
        title: "Bàn giao trọn bộ 10 bài viết",
        budget: 1_000_000,
        deadline: "2026-10-12",
        status: "PENDING",
        escrow: "PENDING_FUNDING",
        criteria: "Đủ 10 bài đã biên tập, không lỗi chính tả."
      }
    ],
    applicantCount: 7
  },
  {
    id: "p-minh-chau",
    title: "Thiết kế bộ ảnh bìa và ảnh bài đăng cho fanpage",
    smeName: "Nha khoa Minh Châu",
    smeIndustry: "Dịch vụ",
    smeSize: "6 nhân sự",
    smeContact: "Chị Đặng Thu Hà",
    budget: 2_000_000,
    deadline: "2026-10-05",
    status: "PUBLISHED",
    skills: ["Figma", "Thiết kế đồ họa"],
    summary:
      "Một bộ mẫu ảnh đăng fanpage để phòng khám tự thay nội dung hằng tuần mà vẫn giữ được nhận diện.",
    problem:
      "Phòng khám đang tự làm ảnh bằng ứng dụng điện thoại nên mỗi bài một kiểu. Cần một bộ mẫu thống nhất trên Canva để bạn lễ tân tự thay chữ được.",
    acceptance: [
      "Ảnh bìa fanpage và 8 mẫu ảnh bài đăng",
      "Bàn giao dạng mẫu Canva đã phân quyền chỉnh sửa",
      "Dùng đúng hai màu và phông chữ trong nhận diện phòng khám"
    ],
    milestones: [
      {
        id: "m1",
        order: 1,
        title: "Đề xuất hai hướng thiết kế",
        budget: 700_000,
        deadline: "2026-09-24",
        status: "PENDING",
        escrow: "PENDING_FUNDING",
        criteria: "Hai hướng khác nhau rõ rệt, phòng khám chọn một."
      },
      {
        id: "m2",
        order: 2,
        title: "Hoàn thiện trọn bộ mẫu",
        budget: 1_300_000,
        deadline: "2026-10-05",
        status: "PENDING",
        escrow: "PENDING_FUNDING",
        criteria: "Đủ 9 mẫu theo hướng đã chọn, đã bàn giao quyền chỉnh sửa."
      }
    ],
    applicantCount: 2
  },
  {
    id: "p-eco",
    title: "Landing page giới thiệu nông sản sạch",
    smeName: "Nông sản Eco",
    smeIndustry: "Thương mại điện tử",
    smeSize: "15 nhân sự",
    smeContact: "Anh Lý Trọng Nghĩa",
    budget: 3_000_000,
    deadline: "2026-10-15",
    status: "IN_PROGRESS",
    skills: ["Next.js", "React", "UI/UX"],
    summary:
      "Trang giới thiệu vùng trồng và các dòng sản phẩm, dẫn khách sang gian hàng trên sàn thương mại điện tử.",
    problem:
      "Công ty bán hàng qua sàn nhưng không có trang riêng để kể chuyện vùng trồng. Cần một trang đặt trên tên miền của công ty, dẫn khách sang gian hàng.",
    acceptance: [
      "Chạy tốt trên Chrome và Safari, cả điện thoại lẫn máy tính",
      "Mã nguồn nộp qua GitHub, có hướng dẫn triển khai",
      "Ảnh tải nhanh, không vỡ bố cục khi màn hình hẹp"
    ],
    milestones: [
      {
        id: "m1",
        order: 1,
        title: "Wireframe và thống nhất bố cục",
        budget: 1_000_000,
        deadline: "2026-09-10",
        status: "ACCEPTED",
        escrow: "RELEASED",
        criteria: "Bản wireframe cho cả điện thoại và máy tính, công ty duyệt xong bố cục."
      },
      {
        id: "m2",
        order: 2,
        title: "Lập trình giao diện responsive",
        budget: 2_000_000,
        deadline: "2026-09-28",
        status: "SUBMITTED",
        escrow: "FUNDED",
        criteria:
          "Chạy tốt trên Chrome và Safari; mã nguồn nộp qua GitHub; cỡ chữ trên điện thoại từ 16px trở lên."
      }
    ],
    applicantCount: 5
  },
  {
    id: "p-tran-phu",
    title: "Chuẩn hóa catalogue sản phẩm dạng PDF",
    smeName: "Xưởng in Trần Phú",
    smeIndustry: "Sản xuất",
    smeSize: "20 nhân sự",
    smeContact: "Chú Bùi Văn Thịnh",
    budget: 4_000_000,
    deadline: "2026-11-02",
    status: "PENDING_REVIEW",
    skills: ["Thiết kế đồ họa", "Figma"],
    summary: "Dựng lại catalogue 40 trang theo một khung trình bày thống nhất, xuất bản in và bản đọc màn hình.",
    problem:
      "Catalogue hiện tại mỗi trang một kiểu do nhiều người làm qua các năm. Cần dựng lại theo một khung thống nhất, nội dung và ảnh sản phẩm xưởng cung cấp đủ.",
    acceptance: [
      "40 trang theo một khung trình bày thống nhất",
      "Xuất hai bản: bản in CMYK và bản đọc màn hình dung lượng nhẹ",
      "Bàn giao kèm tệp gốc để xưởng tự cập nhật về sau"
    ],
    milestones: [
      {
        id: "m1",
        order: 1,
        title: "Dựng khung trình bày và 5 trang mẫu",
        budget: 1_500_000,
        deadline: "2026-10-10",
        status: "PENDING",
        escrow: "PENDING_FUNDING",
        criteria: "Khung trình bày áp được cho mọi loại trang, xưởng duyệt 5 trang mẫu."
      },
      {
        id: "m2",
        order: 2,
        title: "Hoàn thiện 40 trang và xuất bản cuối",
        budget: 2_500_000,
        deadline: "2026-11-02",
        status: "PENDING",
        escrow: "PENDING_FUNDING",
        criteria: "Đủ 40 trang, hai bản xuất, kèm tệp gốc."
      }
    ],
    applicantCount: 0
  },
  {
    id: "p-sportline",
    title: "Dựng 6 video ngắn giới thiệu sản phẩm",
    smeName: "Sportline Quận 7",
    smeIndustry: "Bán lẻ",
    smeSize: "9 nhân sự",
    smeContact: "Anh Ngô Minh Khang",
    budget: 2_800_000,
    deadline: "2026-10-30",
    status: "DRAFT",
    skills: ["Dựng video"],
    summary: "Sáu video dọc 20-30 giây cho kênh bán hàng, dựng từ tư liệu cửa hàng quay sẵn.",
    problem: "Cửa hàng đã quay sẵn tư liệu nhưng chưa có ai dựng. Cần bản dựng có phụ đề và nhạc nền.",
    acceptance: [
      "Sáu video dọc tỷ lệ 9:16, mỗi video 20-30 giây",
      "Có phụ đề tiếng Việt gắn cứng",
      "Nhạc nền không vướng bản quyền"
    ],
    milestones: [
      {
        id: "m1",
        order: 1,
        title: "Dựng 2 video đầu để duyệt phong cách",
        budget: 900_000,
        deadline: "2026-10-08",
        status: "PENDING",
        escrow: "PENDING_FUNDING",
        criteria: "Cửa hàng duyệt phong cách dựng và cách làm phụ đề."
      },
      {
        id: "m2",
        order: 2,
        title: "Hoàn thiện 4 video còn lại",
        budget: 1_900_000,
        deadline: "2026-10-30",
        status: "PENDING",
        escrow: "PENDING_FUNDING",
        criteria: "Đủ 6 video, đã sửa theo góp ý ở mốc 1."
      }
    ],
    applicantCount: 0
  }
];

export function getProject(id: string) {
  return PROJECTS.find((project) => project.id === id);
}

/* ==========================================================================
   Đơn ứng tuyển
   ========================================================================== */

export type Application = {
  id: string;
  projectId: string;
  projectTitle: string;
  smeName: string;
  budget: number;
  submittedAt: string;
  status: "SUBMITTED" | "SHORTLISTED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
};

export const MY_APPLICATIONS: Application[] = [
  {
    id: "a-eco",
    projectId: "p-eco",
    projectTitle: "Landing page giới thiệu nông sản sạch",
    smeName: "Nông sản Eco",
    budget: 3_000_000,
    submittedAt: "2026-08-28",
    status: "ACCEPTED"
  },
  {
    id: "a-coffee",
    projectId: "p-coffee-lab",
    projectTitle: "Landing page giới thiệu thực đơn mùa mới",
    smeName: "The Coffee Lab",
    budget: 2_500_000,
    submittedAt: "2026-09-15",
    status: "SUBMITTED"
  },
  {
    id: "a-minh-chau",
    projectId: "p-minh-chau",
    projectTitle: "Thiết kế bộ ảnh bìa và ảnh bài đăng cho fanpage",
    smeName: "Nha khoa Minh Châu",
    budget: 2_000_000,
    submittedAt: "2026-09-08",
    status: "REJECTED"
  }
];

/* ==========================================================================
   Ứng viên của một dự án (màn hình SME chọn người)
   ========================================================================== */

export type Applicant = {
  id: string;
  name: string;
  school: string;
  major: string;
  year: string;
  verified: boolean;
  skills: string[];
  coverLetter: string;
  portfolioUrl: string;
  portfolioLabel: string;
  shortlisted: boolean;
};

export const APPLICANTS: Applicant[] = [
  {
    id: "s-nam",
    name: "Nguyễn Hải Nam",
    school: "ĐH Khoa học Tự nhiên, ĐHQG-HCM",
    major: "Công nghệ Thông tin",
    year: "Năm 3",
    verified: true,
    skills: ["Next.js", "Figma", "UI/UX"],
    coverLetter:
      "Em đã làm một trang tương tự cho một hợp tác xã rau ở Củ Chi hồi hè, nên phần kể chuyện vùng trồng em hình dung được ngay. Em làm được cả phần thiết kế nên anh chị không cần tìm thêm người dựng giao diện. Em rảnh buổi tối các ngày trong tuần và cả ngày cuối tuần.",
    portfolioUrl: "https://github.com/hainam-nguyen",
    portfolioLabel: "GitHub cá nhân",
    shortlisted: true
  },
  {
    id: "s-truc",
    name: "Lê Thanh Trúc",
    school: "ĐH Kinh tế - Luật, ĐHQG-HCM",
    major: "Thương mại điện tử",
    year: "Năm 4",
    verified: true,
    skills: ["Figma", "UI/UX"],
    coverLetter:
      "Em mạnh phần thiết kế giao diện và đã làm 4 trang bán hàng trên Figma. Phần lập trình em làm được ở mức cơ bản với Next.js, nếu anh chị cần tối ưu sâu thì em xin nói trước là em chưa chắc tay.",
    portfolioUrl: "https://www.behance.net/lethanhtruc",
    portfolioLabel: "Behance",
    shortlisted: false
  },
  {
    id: "s-dat",
    name: "Phạm Quốc Đạt",
    school: "ĐH Bách khoa, ĐHQG-HCM",
    major: "Khoa học Máy tính",
    year: "Năm 3",
    verified: true,
    skills: ["React", "Next.js"],
    coverLetter:
      "Em làm React khoảng một năm rưỡi, chủ yếu là các trang quản trị nội bộ. Phần giao diện đẹp mắt em cần anh chị đưa bản thiết kế sẵn, em không tự dựng được phần thẩm mỹ.",
    portfolioUrl: "https://github.com/datpq-dev",
    portfolioLabel: "GitHub cá nhân",
    shortlisted: false
  },
  {
    id: "s-diep",
    name: "Võ Ngọc Diệp",
    school: "ĐH Sư phạm Kỹ thuật TP.HCM",
    major: "Thiết kế Đồ họa",
    year: "Năm 2",
    verified: false,
    skills: ["Figma"],
    coverLetter:
      "Em đang học năm 2 và đây là dự án thật đầu tiên em ứng tuyển. Em làm Figma khá ổn, phần lập trình thì em chưa làm được.",
    portfolioUrl: "https://drive.google.com/drive/folders/vongocdiep",
    portfolioLabel: "Thư mục Drive",
    shortlisted: false
  }
];

/* ==========================================================================
   Lịch sử bàn giao của mốc đang mở (FR-MIL-05 — không được xóa, chỉ nối thêm)
   ========================================================================== */

export type DeliveryEvent = {
  id: string;
  date: string;
  kind: "submitted" | "changes" | "accepted";
  actor: string;
  note: string;
};

export const DELIVERY_HISTORY: DeliveryEvent[] = [
  {
    id: "d1",
    date: "2026-09-12",
    kind: "submitted",
    actor: "Nguyễn Hải Nam",
    note: "Đã dựng xong các mục theo wireframe, đưa lên đường dẫn chạy thử để anh chị xem."
  },
  {
    id: "d2",
    date: "2026-09-13",
    kind: "changes",
    actor: "Nông sản Eco",
    note: "Cỡ chữ phần mô tả trên điện thoại nhỏ hơn 16px, đọc rất khó. Nhờ em chỉnh lại giúp."
  },
  {
    id: "d3",
    date: "2026-09-16",
    kind: "submitted",
    actor: "Nguyễn Hải Nam",
    note: "Em đã nâng cỡ chữ mô tả lên 16px và giãn dòng rộng ra cho dễ đọc. Nhờ anh chị xem lại."
  }
];

/* ==========================================================================
   Portfolio xác thực (FR-CERT-01..05)
   ========================================================================== */

export type PortfolioEntry = {
  id: string;
  title: string;
  smeName: string;
  smeNote: string;
  period: string;
  role: string;
  skills: string[];
  rating: number;
  review: string;
  demoUrl: string;
  sourceUrl: string;
  visible: boolean;
};

export const PORTFOLIO: PortfolioEntry[] = [
  {
    id: "c-eco-phase-1",
    title: "Trang giới thiệu vùng trồng cho hợp tác xã rau Củ Chi",
    smeName: "HTX Rau an toàn Tân Phú Trung",
    smeNote: "Hợp tác xã tại Củ Chi, TP.HCM",
    period: "12/06/2026 - 04/07/2026",
    role: "Lập trình giao diện",
    skills: ["Next.js", "React", "UI/UX"],
    rating: 5,
    review:
      "Nam chủ động hỏi lại những chỗ đề bài của bên mình viết chưa rõ, nên không phải làm lại lần nào. Trang chạy nhanh, các cô chú trong hợp tác xã tự vào xem trên điện thoại được.",
    demoUrl: "https://rau-tanphutrung.vercel.app",
    sourceUrl: "https://github.com/hainam-nguyen/htx-tanphutrung",
    visible: true
  },
  {
    id: "c-menu-board",
    title: "Bảng thực đơn điện tử cho quán ăn gia đình",
    smeName: "Quán Cơm Nhà Bảy Hiền",
    smeNote: "Quán ăn tại Tân Bình, TP.HCM",
    period: "02/05/2026 - 20/05/2026",
    role: "Thiết kế và lập trình",
    skills: ["Figma", "React"],
    rating: 4,
    review:
      "Bản giao đúng hạn và đúng yêu cầu. Có một đợt bạn phản hồi tin nhắn hơi chậm vào tuần thi giữa kỳ, nhưng bạn có báo trước nên bên quán chủ động được.",
    demoUrl: "https://thucdon-bayhien.vercel.app",
    sourceUrl: "https://github.com/hainam-nguyen/menu-bayhien",
    visible: true
  }
];

/* ==========================================================================
   Hàng đợi quản trị (FR-ADM-01..04)
   ========================================================================== */

export const PENDING_VERIFICATIONS = [
  {
    id: "v-diep",
    name: "Võ Ngọc Diệp",
    school: "ĐH Sư phạm Kỹ thuật TP.HCM",
    method: "Ảnh thẻ sinh viên",
    submittedAt: "2026-09-17"
  },
  {
    id: "v-huy",
    name: "Trần Đức Huy",
    school: "ĐH FPT TP.HCM",
    method: "Email trường (@fpt.edu.vn)",
    submittedAt: "2026-09-17"
  },
  {
    id: "v-quyen",
    name: "Đinh Bảo Quyên",
    school: "ĐH Ngoại thương CS2",
    method: "Ảnh thẻ sinh viên",
    submittedAt: "2026-09-16"
  }
];

export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  role: "SINH VIÊN" | "DOANH NGHIỆP" | "QUẢN TRỊ";
  action: string;
  target: string;
  reason: string;
};

export const AUDIT_LOG: AuditEntry[] = [
  {
    id: "l1",
    at: "18/09/2026 09:42",
    actor: "Đỗ Minh Triết",
    role: "QUẢN TRỊ",
    action: "Duyệt xuất bản dự án",
    target: "Thiết kế bộ ảnh bìa - Nha khoa Minh Châu",
    reason: "Đề bài và tiêu chí nghiệm thu đã đủ rõ"
  },
  {
    id: "l2",
    at: "17/09/2026 16:05",
    actor: "Nông sản Eco",
    role: "DOANH NGHIỆP",
    action: "Yêu cầu chỉnh sửa mốc 2",
    target: "Landing page nông sản sạch",
    reason: "Cỡ chữ trên điện thoại nhỏ hơn 16px"
  },
  {
    id: "l3",
    at: "17/09/2026 10:18",
    actor: "Nguyễn Hải Nam",
    role: "SINH VIÊN",
    action: "Nộp kết quả bàn giao",
    target: "Mốc 2 - Landing page nông sản sạch",
    reason: "Nộp lại sau khi sửa cỡ chữ"
  },
  {
    id: "l4",
    at: "16/09/2026 14:51",
    actor: "Đỗ Minh Triết",
    role: "QUẢN TRỊ",
    action: "Từ chối minh chứng sinh viên",
    target: "Hồ sơ Đinh Bảo Quyên",
    reason: "Ảnh thẻ mờ, không đọc được ngày hết hạn"
  },
  {
    id: "l5",
    at: "15/09/2026 08:30",
    actor: "The Coffee Lab",
    role: "DOANH NGHIỆP",
    action: "Gửi duyệt dự án",
    target: "Landing page thực đơn mùa mới",
    reason: "Hoàn tất khai báo 2 mốc bàn giao"
  }
];
