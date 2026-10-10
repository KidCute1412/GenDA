import type { Metadata } from "next";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";
import { BottomNav } from "../../../components/layout/bottom-nav";
import { LedgerWorkspace } from "../../../features/workspace/components/ledger-workspace";
import { ApiWorkspace } from "../../../features/workspace/components/api-workspace";

export const metadata: Metadata = { title: "Không gian làm việc" };

export default async function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "demo") return <LedgerWorkspace />;
  return <><SiteHeader hideOnMobile /><main id="main-content" className="container has-bottom-nav section--tight"><ApiWorkspace projectId={id} /></main><SiteFooter /><BottomNav /></>;
}
