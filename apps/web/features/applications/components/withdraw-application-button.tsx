"use client";

import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";
import { setApplicationStatus } from "../../demo-ledger/store";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import { Button } from "../../../components/ui/button";

export function WithdrawApplicationButton({ applicationId }: { applicationId: string }) {
  const ledger = useDemoLedger();
  const { session } = useDemoSession();
  const withdrawn = ledger.applications.find((application) => application.id === applicationId)?.status === "WITHDRAWN";

  return withdrawn ? (
    <span className="badge badge--neutral">ĐÃ RÚT ĐƠN</span>
  ) : (
    <Button type="button" variant="outline" size="sm" onClick={() => setApplicationStatus(session?.email ?? "", applicationId, "WITHDRAWN")}>
      RÚT ĐƠN NÀY
    </Button>
  );
}
