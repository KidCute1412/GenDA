"use client";

import { useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { ErrorState } from "../../../components/ui/feedback";

export default function ProjectsError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const requestId = error.message.match(/\[requestId: ([^\]]+)\]/)?.[1];

  return (
    <main id="main-content" className="container" style={{ paddingBlock: "var(--space-12)" }}>
      <ErrorState
        detail="Kết nối tới dịch vụ dự án đang gián đoạn. Bạn có thể thử lại ngay."
        requestId={requestId}
        action={<Button onClick={reset}>Thử lại</Button>}
      />
    </main>
  );
}
