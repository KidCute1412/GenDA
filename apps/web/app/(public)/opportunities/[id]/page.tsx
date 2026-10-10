import type { Metadata } from "next";
import { SiteHeader } from "../../../../components/layout/site-header";
import { SiteFooter } from "../../../../components/layout/site-footer";
import { BottomNav } from "../../../../components/layout/bottom-nav";
import { OpportunityDetail } from "../../../../features/opportunities/components/opportunity-detail";

export const metadata: Metadata = {
  title: "Chi tiết cơ hội",
  description: "Lịch, thù lao, địa điểm và điều kiện tham gia của tin cộng tác viên hoặc sự kiện."
};

/** Chi tiết cơ hội ngắn (docs/opportunities.md). Dữ liệu ở ledger demo nên phần thân là một hòn đảo client. */
export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <SiteHeader hideOnMobile />
      <main id="main-content" className="container has-bottom-nav" style={{ paddingTop: "var(--space-8)" }}>
        <OpportunityDetail id={id} />
      </main>
      <SiteFooter />
      <BottomNav />
    </>
  );
}
