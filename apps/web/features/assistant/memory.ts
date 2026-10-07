"use client";

/**
 * Trí nhớ của Gen trong trình duyệt: đã chào chưa, đã nói điều gì, lần cuối gặp là khi nào.
 *
 * Khóa mang tiền tố `genda-demo:` nên "Đặt lại demo" xóa luôn. Khi có backend, trí nhớ này
 * chuyển thành bảng `assistant_acknowledgements` (docs/assistant.md mục 7): lời nhắc đã nghe
 * trên điện thoại thì máy tính cũng không nhắc lại.
 */
export type AssistantMemory = {
  version: 1;
  introDone: boolean;
  /** Khóa lời nhắc -> thời điểm sinh viên nghe hết. */
  seen: Record<string, string>;
  /** Lần cuối sinh viên hoạt động, cập nhật suốt phiên. */
  lastActiveAt: string | null;
  /** Gen tự bật lời nhắc khi có điều mới. Tắt thì Gen chỉ nói khi được gọi. */
  autoOpen: boolean;
};

/** Thông tin cố định trong một phiên (một tab): mốc "lần trước" để so sánh và đã tự bật chưa. */
export type AssistantVisit = { previousVisitAt: string | null; autoShown: boolean };

export const ASSISTANT_EVENT = "genda-demo:assistant-change";
const memoryKey = (userId: string) => `genda-demo:assistant:${userId}`;
const visitKey = (userId: string) => `genda-demo:assistant-visit:${userId}`;
const EMPTY: AssistantMemory = { version: 1, introDone: false, seen: {}, lastActiveAt: null, autoOpen: true };

function read<T>(storage: Storage | undefined, key: string): T | null {
  try {
    const raw = storage?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(storage: Storage | undefined, key: string, value: unknown) {
  try {
    storage?.setItem(key, JSON.stringify(value));
  } catch {
    /* Hết chỗ hoặc bị chặn: Gen vẫn chạy, chỉ quên sau khi tải lại trang. */
  }
}

const local = () => (typeof window === "undefined" ? undefined : window.localStorage);
const session = () => (typeof window === "undefined" ? undefined : window.sessionStorage);

export function loadMemory(userId: string): AssistantMemory {
  const stored = read<AssistantMemory>(local(), memoryKey(userId));
  return stored?.version === 1 ? { ...EMPTY, ...stored } : { ...EMPTY };
}

export function saveMemory(userId: string, next: AssistantMemory) {
  write(local(), memoryKey(userId), next);
}

export function updateMemory(userId: string, change: (current: AssistantMemory) => AssistantMemory) {
  const next = change(loadMemory(userId));
  saveMemory(userId, next);
  return next;
}

/**
 * Mốc "lần trước" chốt một lần ở đầu phiên rồi giữ nguyên tới khi đóng tab. Nếu đọc thẳng
 * `lastActiveAt` thì chỉ cần tải lại trang là lời chào "lâu rồi không gặp" biến mất.
 */
export function beginVisit(userId: string, now: Date): AssistantVisit {
  const existing = read<AssistantVisit>(session(), visitKey(userId));
  const visit = existing ?? { previousVisitAt: loadMemory(userId).lastActiveAt, autoShown: false };
  if (!existing) write(session(), visitKey(userId), visit);
  updateMemory(userId, (memory) => ({ ...memory, lastActiveAt: now.toISOString() }));
  return visit;
}

export function markAutoShown(userId: string, visit: AssistantVisit) {
  write(session(), visitKey(userId), { ...visit, autoShown: true });
}

export function touchActivity(userId: string, now: Date) {
  updateMemory(userId, (memory) => ({ ...memory, lastActiveAt: now.toISOString() }));
}

export function notifyAssistantChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ASSISTANT_EVENT));
}

/* --------------------------------------------------------------------------
   Kịch bản demo cho ban giám khảo: dựng lại các tình huống cần nhiều ngày mới xảy ra
   -------------------------------------------------------------------------- */

/** Giả lập sinh viên vắng `days` ngày: lùi mốc hoạt động và mở phiên mới. */
export function simulateAbsence(userId: string, days: number, now: Date) {
  const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
  updateMemory(userId, (memory) => ({ ...memory, introDone: true, lastActiveAt: past }));
  session()?.removeItem(visitKey(userId));
  notifyAssistantChange();
}

/** Gen quên hết: chào lại từ đầu. */
export function forgetEverything(userId: string) {
  local()?.removeItem(memoryKey(userId));
  session()?.removeItem(visitKey(userId));
  notifyAssistantChange();
}
