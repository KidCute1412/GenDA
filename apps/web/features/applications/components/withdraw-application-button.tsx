"use client";

import { useDemoPersistedState } from "../../../lib/hooks/use-demo-persisted-state";
import { Button } from "../../../components/ui/button";

export function WithdrawApplicationButton({ applicationId }: { applicationId: string }) {
  const [withdrawn, setWithdrawn] = useDemoPersistedState(`application:${applicationId}:withdrawn`, false);

  return withdrawn ? (
    <span className="badge badge--neutral">ĐÃ RÚT ĐƠN</span>
  ) : (
    <Button type="button" variant="outline" size="sm" onClick={() => setWithdrawn(true)}>
      RÚT ĐƠN NÀY
    </Button>
  );
}
