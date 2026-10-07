"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import { seedAssistantScenario, type AssistantScenario } from "../../demo-ledger/store";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";
import { buildStudentInsights } from "../engine";
import {
  ASSISTANT_EVENT,
  beginVisit,
  forgetEverything,
  loadMemory,
  markAutoShown,
  simulateAbsence,
  touchActivity,
  updateMemory,
  type AssistantMemory,
  type AssistantVisit
} from "../memory";
import type { Insight } from "../types";
import { GenDialogue, type DialogueScript, type ScriptChoice } from "./gen-dialogue";
import { GenPortrait } from "./gen-portrait";

/** Trang xác thực là lúc người dùng đang nhập liệu, Gen không chen vào. */
const QUIET_ROUTES = ["/login", "/register", "/verify-email", "/quen-mat-khau"];
/** Chờ trang vẽ xong rồi Gen mới bước ra, để lời nhắc không giành chỗ với nội dung đang tải. */
const AUTO_OPEN_DELAY_MS = 1200;
/** Menu của Gen liệt kê tối đa bốn việc (design.md 4.9.2 D: danh sách quá 5 mục phải đổi dạng). */
const MENU_LIMIT = 4;

/**
 * Lời nhắc đang mở được giữ nguyên bản chụp, không tra lại theo khóa: nghe xong lời chào thì
 * quy tắc INTRO thôi sinh lời nhắc, nếu tra lại thì hộp thoại biến mất trước khi kịp chọn.
 */
type OpenState = { mode: "menu" } | { mode: "insight"; insight: Insight };

/**
 * Trợ lý Gen cho sinh viên: một nút gọi ở góc màn hình và hộp thoại kiểu game.
 *
 * Kỷ luật để trợ lý không thành phiền: mỗi phiên Gen tự bật nhiều nhất MỘT lần, với điều quan
 * trọng nhất chưa nghe; các điều còn lại nằm sau huy hiệu số trên nút gọi. Lời nhắc đã nghe
 * hết thì không nhắc lại cho tới khi tình huống đổi (khóa lời nhắc đổi theo dữ liệu).
 */
export function AssistantHost() {
  const pathname = usePathname();
  const { session, hydrated } = useDemoSession();
  const ledger = useDemoLedger();
  const user = session?.role === "STUDENT" ? ledger.users.find((candidate) => candidate.email === session.email) : undefined;
  const userId = user?.id;
  const quiet = QUIET_ROUTES.some((route) => pathname?.startsWith(route));

  const [visit, setVisit] = useState<AssistantVisit | null>(null);
  const [memory, setMemory] = useState<AssistantMemory | null>(null);
  const [open, setOpen] = useState<OpenState | null>(null);
  const [userOpened, setUserOpened] = useState(false);
  const [openNextAfterChange, setOpenNextAfterChange] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  /** Nút gọi chỉ hiện lại SAU khi hộp thoại đóng, nên trả tiêu điểm cho nó ở lượt vẽ kế tiếp. */
  const restoreFocus = useRef(false);

  // Đầu phiên: chốt mốc "lần trước", đọc trí nhớ. Kịch bản demo phát sự kiện để đọc lại.
  useEffect(() => {
    if (!userId) { setVisit(null); setMemory(null); return; }
    const sync = () => {
      setVisit(beginVisit(userId, new Date()));
      setMemory(loadMemory(userId));
    };
    sync();
    window.addEventListener(ASSISTANT_EVENT, sync);
    return () => window.removeEventListener(ASSISTANT_EVENT, sync);
  }, [userId]);

  // Ghi nhận hoạt động khi đổi trang và khi rời tab, làm mốc cho lần quay lại sau
  useEffect(() => {
    if (!userId) return;
    touchActivity(userId, new Date());
    const onHide = () => { if (document.visibilityState === "hidden") touchActivity(userId, new Date()); };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [userId, pathname]);

  const insights = useMemo<Insight[]>(() => {
    if (!userId || !visit || !memory) return [];
    return buildStudentInsights({ ledger, userId, now: new Date(), previousVisitAt: visit.previousVisitAt, introDone: memory.introDone });
  }, [ledger, userId, visit, memory]);

  const unseen = useMemo(() => insights.filter((insight) => !memory?.seen[insight.key]), [insights, memory]);
  const active = open?.mode === "insight" ? open.insight : undefined;

  const remember = useCallback((change: (current: AssistantMemory) => AssistantMemory) => {
    if (userId) setMemory(updateMemory(userId, change));
  }, [userId]);

  const close = useCallback(() => {
    restoreFocus.current = userOpened;
    setOpen(null);
  }, [userOpened]);

  useEffect(() => {
    if (open || !restoreFocus.current) return;
    restoreFocus.current = false;
    launcherRef.current?.focus({ preventScroll: true });
  }, [open]);

  // Tự bật một lần mỗi phiên, với điều quan trọng nhất chưa nghe
  useEffect(() => {
    if (!hydrated || quiet || !userId || !visit || !memory || open || visit.autoShown) return;
    const first = unseen[0];
    if (!first || (!memory.autoOpen && first.kind !== "INTRO")) return;
    const timer = window.setTimeout(() => {
      markAutoShown(userId, visit);
      setVisit({ ...visit, autoShown: true });
      setUserOpened(false);
      setOpen({ mode: "insight", insight: first });
    }, AUTO_OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [hydrated, quiet, userId, visit, memory, open, unseen]);

  // Sau khi chạy kịch bản demo: mở ngay điều mới quan trọng nhất
  useEffect(() => {
    if (!openNextAfterChange || !unseen[0]) return;
    setOpenNextAfterChange(false);
    setOpen({ mode: "insight", insight: unseen[0] });
  }, [openNextAfterChange, unseen]);

  if (!hydrated || quiet || !user || !memory) return null;

  const nextUnseen = (exceptKey?: string) => unseen.find((insight) => insight.key !== exceptKey);

  function openInsight(insight: Insight) {
    setOpen({ mode: "insight", insight });
  }

  function insightScript(insight: Insight): DialogueScript {
    const following = nextUnseen(insight.key);
    const proceed = () => (following ? openInsight(following) : close());
    const choices: ScriptChoice[] = insight.choices.map((choice) => ({
      label: choice.label,
      href: choice.href,
      // Lựa chọn không dẫn đi đâu nghĩa là "nghe tiếp": còn điều chưa nghe thì nói tiếp, hết thì khép lại
      onSelect: choice.href ? () => setOpen(null) : proceed
    }));
    const hasContinue = insight.choices.some((choice) => !choice.href);
    if (!hasContinue && following) choices.push({ label: "Nghe điều tiếp theo", tag: `CÒN ${unseen.filter((item) => item.key !== insight.key).length}`, onSelect: proceed });
    if (!hasContinue) choices.push({ label: "Để sau", onSelect: close });
    return { id: insight.key, lines: insight.lines, choices, reason: insight.reason };
  }

  function menuScript(): DialogueScript {
    const listed = insights.slice(0, MENU_LIMIT);
    const text = unseen.length
      ? `Mình có ${unseen.length} điều muốn nói với bạn. Bạn muốn nghe điều nào trước?`
      : listed.length
        ? "Chưa có gì mới kể từ lần trước. Bạn muốn nghe lại điều nào?"
        : "Hiện mọi thứ đều ổn, chưa có gì cần bạn để ý. Có tin mới là mình lên tiếng ngay.";
    return {
      id: `menu:${unseen.length}:${listed.map((insight) => insight.key).join("|")}`,
      lines: [{ expression: unseen.length ? "happy" : "neutral", text }],
      choices: [
        ...listed.map((insight) => ({ label: insight.title, tag: memory?.seen[insight.key] ? undefined : "MỚI", onSelect: () => openInsight(insight) })),
        { label: "Để sau", onSelect: close }
      ]
    };
  }

  function runScenario(scenario: AssistantScenario | "away" | "forget") {
    if (!session || !userId) return;
    if (scenario === "forget") { forgetEverything(userId); setOpen(null); return; }
    if (scenario === "away") {
      seedAssistantScenario(session.email, "away-news");
      // Phiên mới với mốc "lần trước" lùi 9 ngày: Gen tự bật lời chào như khi sinh viên quay lại thật
      simulateAbsence(userId, 9, new Date());
      setOpen(null);
      return;
    }
    const result = seedAssistantScenario(session.email, scenario);
    if (!result.ok) { window.alert(result.message); return; }
    setOpen(null);
    setOpenNextAfterChange(true);
  }

  const footer = (
    <div className="gen-dialog__footer">
      <label className="gen-dialog__toggle">
        <input
          type="checkbox"
          checked={memory.autoOpen}
          onChange={(event) => { const autoOpen = event.target.checked; remember((current) => ({ ...current, autoOpen })); }}
        />
        Gen tự lên tiếng khi có điều mới
      </label>
      <details className="gen-dialog__demo">
        <summary>Thử kịch bản demo</summary>
        <p>Dựng nhanh những tình huống ngoài đời phải chờ nhiều ngày. Chỉ đổi dữ liệu demo trong trình duyệt này.</p>
        <div className="gen-dialog__demo-actions">
          <button type="button" className="btn btn--outline btn--sm" onClick={() => runScenario("rejections")}>Nộp mãi không được</button>
          <button type="button" className="btn btn--outline btn--sm" onClick={() => runScenario("away")}>Vắng 9 ngày rồi quay lại</button>
          <button type="button" className="btn btn--outline btn--sm" onClick={() => runScenario("changes")}>Mốc bị yêu cầu sửa</button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => runScenario("forget")}>Gen chào lại từ đầu</button>
        </div>
      </details>
    </div>
  );

  const script = open?.mode === "menu" ? menuScript() : active ? insightScript(active) : null;

  return (
    <div className="gen-assistant">
      {script ? (
        <GenDialogue
          key={script.id}
          script={script}
          takeFocus={userOpened}
          onClose={close}
          onReachEnd={active ? () => remember((current) => ({
            ...current,
            introDone: current.introDone || active.kind === "INTRO",
            seen: { ...current.seen, [active.key]: new Date().toISOString() }
          })) : undefined}
          footer={open?.mode === "menu" ? footer : undefined}
        />
      ) : (
        <button
          ref={launcherRef}
          type="button"
          className="gen-launcher"
          onClick={() => { setUserOpened(true); setOpen({ mode: "menu" }); }}
          aria-label={unseen.length ? `Mở trợ lý Gen, có ${unseen.length} điều mới` : "Mở trợ lý Gen"}
        >
          <GenPortrait framing="face" className="gen-launcher__face" />
          {unseen.length ? <span className="gen-launcher__badge" aria-hidden="true">{unseen.length}</span> : null}
        </button>
      )}
    </div>
  );
}
