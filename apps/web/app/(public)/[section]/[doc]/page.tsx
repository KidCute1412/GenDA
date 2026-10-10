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

      <main id="main-content" className="container">
        <nav aria-label="Đường dẫn phân cấp">
          <ol className="breadcrumbs">
            <li>
              <Link href="/">Trang chủ</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{entry.title}</li>
          </ol>
        </nav>

        <article className="section" style={{ maxWidth: "70ch" }}>
          <h1>{entry.title}</h1>
          <p className="lede" style={{ marginBlock: "var(--space-4) var(--space-8)" }}>
            {entry.summary}
          </p>

          <Alert variant="info" title="Nội dung đang được hoàn thiện">
            Văn bản này do {entry.owner} soạn và chưa được ban hành. Chúng tôi để trống thay vì đăng một
            bản nháp, vì đây là văn bản ràng buộc quyền lợi của bạn.
          </Alert>

          <p style={{ marginBlock: "var(--space-8)" }}>
            Trong lúc chờ, nếu bạn có câu hỏi về quyền lợi hoặc gặp vướng mắc với một dự án đang chạy, hãy
            liên hệ trực tiếp với đội vận hành. Chúng tôi trả lời trong giờ hành chính.
          </p>

          <ButtonLink href="/" variant="outline">
            Về trang chủ
          </ButtonLink>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
