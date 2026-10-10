import { SiteFooter } from "../../../components/layout/site-footer";
import { SiteHeader } from "../../../components/layout/site-header";
import { BottomNav } from "../../../components/layout/bottom-nav";
import { VerifyEmailResult } from "../../../features/auth/components/verify-email-result";

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; token?: string }>;
}) {
  const { next, token } = await searchParams;
  const destination = next?.startsWith("/") ? next : "/";

  return (
    <>
      <SiteHeader hideOnMobile />
      <main id="main-content" className="industrial-canvas has-bottom-nav">
        <div className="container" style={{ maxWidth: "680px", paddingBlock: "var(--space-16)" }}>
          <VerifyEmailResult token={token} next={destination} />
        </div>
      </main>
      <SiteFooter />
      <BottomNav />
    </>
  );
}
