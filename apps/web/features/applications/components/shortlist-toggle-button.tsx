"use client";

import { useDemoPersistedState } from "../../../lib/hooks/use-demo-persisted-state";
import { Button } from "../../../components/ui/button";

export function ShortlistToggleButton({ applicantId, initiallyShortlisted }: { applicantId: string; initiallyShortlisted: boolean }) {
  const [shortlisted, setShortlisted] = useDemoPersistedState(`applicant:${applicantId}:shortlisted`, initiallyShortlisted);
  return (
    <Button type="button" variant="outline" size="sm" onClick={() => setShortlisted((value) => !value)}>
      {shortlisted ? "BỎ KHỎI RÚT GỌN" : "ĐÁNH DẤU RÚT GỌN"}
    </Button>
  );
}
