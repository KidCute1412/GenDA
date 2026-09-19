"use client";

import { useDemoPersistedState } from "../../../lib/hooks/use-demo-persisted-state";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import { StatusBadge } from "../../../components/ui/status-badge";
import { formatVnd } from "../../../lib/utils/format";

export type CreatedProject = { id: string; title: string; budget: number; deadline: string; createdAt: string; ownerEmail: string; status: "PENDING_REVIEW" };

export function CreatedProjectsPanel() {
  const [projects] = useDemoPersistedState<CreatedProject[]>("projects:created", []);
  const { session, hydrated } = useDemoSession();
  if (!hydrated || session?.role !== "SME") return null;
  const mine = projects.filter((project) => project.ownerEmail === session?.email);
  if (mine.length === 0) return null;
  return (
    <section className="stack" style={{ marginBottom: "var(--space-6)" }}>
      <div className="industrial-ruler">DỰ ÁN VỪA TẠO // LƯU 7 NGÀY</div>
      {mine.map((project) => (
        <article key={project.id} className="module-bay" style={{ padding: "var(--space-5)" }}>
          <div className="module-bay__header"><span className="module-bay__id">PROJECT // {project.id.toUpperCase()}</span><span>TẠO LÚC {project.createdAt}</span></div>
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{project.title}</h2>
          <p className="text-muted">Hạn {project.deadline} · <strong className="num">{formatVnd(project.budget)}</strong></p>
          <StatusBadge status={project.status} />
        </article>
      ))}
    </section>
  );
}
