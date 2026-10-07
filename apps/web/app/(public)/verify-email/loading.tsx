export default function VerifyEmailLoading() {
  return (
    <main id="main-content" className="industrial-canvas">
      <div className="container" style={{ maxWidth: "680px", paddingBlock: "var(--space-16)" }}>
        <section className="module-bay stack" aria-live="polite" style={{ padding: "var(--space-8)" }}>
          <p className="module-bay__id">EMAIL-OTP // LOADING</p>
          <h1 style={{ margin: 0 }}>Đang chuẩn bị bước xác minh</h1>
          <p className="text-muted">Hệ thống đang tải biểu mẫu OTP.</p>
        </section>
      </div>
    </main>
  );
}
