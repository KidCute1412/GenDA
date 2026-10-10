import { SiteFooter } from "../../../components/layout/site-footer";
import { SiteHeader } from "../../../components/layout/site-header";
import { BottomNav } from "../../../components/layout/bottom-nav";
import { VerifyEmailResult } from "../../../features/auth/components/verify-email-result";

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <>
      <SiteHeader hideOnMobile />
      <main id="main-content" className="industrial-canvas has-bottom-nav">
        <div className="container" style={{ maxWidth: "680px", paddingBlock: "var(--space-16)" }}>
          <VerifyEmailResult initialEmail={email ?? ""} />
        </div>
      </main>
      <SiteFooter />
      <BottomNav />
    </>
  );
}
