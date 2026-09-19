import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "../../../../components/layout/site-header";
import { SiteFooter } from "../../../../components/layout/site-footer";
import { Alert } from "../../../../components/ui/alert";
import { ButtonLink } from "../../../../components/ui/button";

/**
 * Các trang văn bản tĩnh: quy chế sàn, chính sách bảo mật, quy trình khiếu nại,
 * câu hỏi thường gặp.
 *
 * Bản dựng giao diện CỐ Ý không viết sẵn nội dung pháp lý. Quy chế sàn và chính
 * sách bảo mật là văn bản có hiệu lực ràng buộc với người dùng và phải do bộ
 * phận pháp lý soạn; sinh ra một bản nháp nghe có vẻ hợp lý rồi để nó lặng lẽ
 * đi vào bản chạy thật là rủi ro lớn hơn nhiều so với việc để trống.
 *
 * Vì thế trang dựng sẵn khung, tiêu đề, đường dẫn và nói thẳng nội dung đang
 * chờ hoàn thiện — đúng tinh thần Trust-First: thà nói rõ giới hạn còn hơn để
 * người dùng phát hiện ra sau.
 */
const DOCS: Record<string, { title: string; summary: string; owner: string }> = {
  "phap-ly/quy-che-san": {
    title: "Quy chế hoạt động sàn",
    summary:
      "Quyền và nghĩa vụ của sinh viên, doanh nghiệp và GenDA; quy định về đăng dự án, nhận việc, nghiệm thu và xử lý vi phạm.",
    owner: "bộ phận pháp lý"
  },
  "phap-ly/bao-mat": {
    title: "Chính sách bảo mật",
    summary:
      "Chúng tôi thu thập dữ liệu gì, dùng vào việc gì, lưu trong bao lâu, và bạn yêu cầu xóa dữ liệu của mình bằng cách nào.",
    owner: "bộ phận pháp lý"
  },
  "phap-ly/khieu-nai": {
    title: "Quy trình khiếu nại",
    summary:
      "Các bước xử lý khi hai bên không thống nhất được về kết quả nghiệm thu hoặc khoản thanh toán của một mốc.",
    owner: "đội vận hành"
  },
  "ho-tro/cau-hoi-thuong-gap": {
    title: "Câu hỏi thường gặp",
    summary: "Những thắc mắc hay gặp nhất của sinh viên và doanh nghiệp khi mới dùng GenDA.",
    owner: "đội vận hành"
  }
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((key) => {
    const [section, doc] = key.split("/");
    return { section, doc };
  });
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ section: string; doc: string }>;
}): Promise<Metadata> {
  const { section, doc } = await params;
  const entry = DOCS[`${section}/${doc}`];
  return entry ? { title: entry.title, description: entry.summary } : { title: "Không tìm thấy trang" };
}

export default async function DocPage({
  params
}: {
  params: Promise<{ section: string; doc: string }>;
}) {
  const { section, doc } = await params;
  const entry = DOCS[`${section}/${doc}`];

  if (!entry) notFound();

  return (
    <>
      <SiteHeader />

      <main id="main-content" className="industrial-canvas" style={{ paddingBottom: "var(--space-16)" }}>
        {/* THANH THƯỚC ĐO KỸ THUẬT & ĐIỀU HƯỚNG */}
        <div style={{ borderBottom: "2px solid var(--machinery-border)", backgroundColor: "var(--color-surface-card)" }}>
          <div className="container" style={{ paddingBlock: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <nav aria-label="Đường dẫn phân cấp" style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px" }}>
              <ol className="breadcrumbs" style={{ margin: 0, padding: 0 }}>
                <li>
                  <Link href="/" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>HOME</Link>
                </li>
                <li aria-hidden="true" style={{ color: "var(--color-text-muted)" }}>/</li>
                <li>
                  <span style={{ color: "var(--color-text-muted)" }}>{section.toUpperCase()}</span>
                </li>
                <li aria-hidden="true" style={{ color: "var(--color-text-muted)" }}>/</li>
                <li aria-current="page" style={{ fontWeight: 700, color: "var(--orange-500)" }}>{doc.toUpperCase()}</li>
              </ol>
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "ui-monospace, monospace", fontSize: "11px" }}>
              <span className="badge badge--verified" style={{ margin: 0 }}>
                DOC REF // 2026.09
              </span>
              <span style={{ color: "var(--color-text-muted)" }}>
                PHỤ TRÁCH: {entry.owner.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingTop: "var(--space-8)", maxWidth: "840px" }}>
          
          <article className="module-bay" style={{ padding: "var(--space-8)", backgroundColor: "var(--color-surface-card)" }}>
            <div className="module-bay__header">
              <span className="module-bay__id">LEGAL PROTOCOL // {section.toUpperCase()}</span>
              <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--color-text-muted)" }}>
                GENDA TRUST LAYER
              </span>
            </div>

            <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.25rem)", fontWeight: 900, textTransform: "uppercase", margin: "var(--space-2) 0" }}>
              {entry.title}
            </h1>

            <p style={{ margin: "0 0 var(--space-6)", fontSize: "14px", lineHeight: 1.6, color: "var(--color-text-body)" }}>
              {entry.summary}
            </p>

            {/* BANNER THÔNG BÁO CƠ KHÍ */}
            <div 
              style={{ 
                border: "2px solid var(--machinery-border)", 
                backgroundColor: "var(--color-surface-subtle)", 
                padding: "var(--space-4) var(--space-5)",
                boxShadow: "3px 3px 0px var(--machinery-shadow)",
                marginBottom: "var(--space-6)"
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
                <div style={{ backgroundColor: "var(--orange-500)", color: "#ffffff", padding: "4px 8px", borderRadius: "2px", fontFamily: "ui-monospace, monospace", fontSize: "11px", fontWeight: 800 }}>
                  INFO
                </div>
                <div>
                  <strong style={{ fontSize: "13px", textTransform: "uppercase", fontFamily: "ui-monospace, monospace", color: "var(--color-text-heading)", display: "block" }}>
                    Nội dung văn bản đang được hoàn thiện
                  </strong>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--color-text-body)", lineHeight: 1.5 }}>
                    Văn bản này do {entry.owner} soạn thảo và chuẩn bị ban hành chính thức. Theo nguyên tắc <em>Trust-First</em>, chúng tôi từ chối đăng tải bản nháp giả lập vì đây là văn bản ràng buộc trực tiếp quyền lợi và trách nhiệm pháp lý của người dùng.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px dashed var(--machinery-border)", paddingTop: "var(--space-4)", marginTop: "var(--space-6)" }}>
              <p style={{ margin: "0 0 var(--space-6)", fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                Trong thời gian chờ ban hành, nếu bạn có bất kỳ câu hỏi về quyền lợi hoặc cần giải quyết khiếu nại trong quá trình bàn giao dự án, vui lòng liên hệ với đội ngũ hỗ trợ qua Zalo hoặc Hotline trong giờ hành chính.
              </p>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link href="/" className="btn--tactile-zinc" style={{ height: "40px", fontSize: "12px", textDecoration: "none" }}>
                  ← VỀ TRANG CHỦ
                </Link>
                <Link href="/projects" className="btn--tactile-orange" style={{ height: "40px", fontSize: "12px", textDecoration: "none" }}>
                  KHÁM PHÁ DỰ ÁN
                </Link>
              </div>
            </div>
          </article>

        </div>
      </main>

      <SiteFooter />
    </>
  );
}
