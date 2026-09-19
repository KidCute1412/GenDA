export type DemoRole = "STUDENT" | "SME" | "ADMIN";

export type DemoSession = {
  name: string;
  email: string;
  role: DemoRole;
  emailVerified: boolean;
  expiresAt: number;
};

const SESSION_KEY = "genda-demo:session";
const EVENT_NAME = "genda-demo:session-change";
const DEMO_KEY_PREFIX = "genda-demo:";

export function getDemoSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as DemoSession;
    if (session.expiresAt <= Date.now()) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function setDemoSession(session: Omit<DemoSession, "expiresAt">) {
  const saved: DemoSession = { ...session, expiresAt: Date.now() + 12 * 60 * 60 * 1000 };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(saved));
  window.dispatchEvent(new Event(EVENT_NAME));
  return saved;
}

export function activateDemoSession() {
  const current = getDemoSession();
  if (!current) return null;
  return setDemoSession({ ...current, emailVerified: true });
}

export function clearDemoSession() {
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(EVENT_NAME));
}

/** Clears every browser-only fixture and interaction record, then notifies client islands. */
export function resetDemoData() {
  if (typeof window === "undefined") return;
  for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
    const key = window.localStorage.key(index);
    if (key?.startsWith(DEMO_KEY_PREFIX)) window.localStorage.removeItem(key);
  }
  window.dispatchEvent(new Event(EVENT_NAME));
}

export const DEMO_SESSION_EVENT = EVENT_NAME;
