"use client";

import Link from "next/link";
import { StatusBadge } from "../../../components/ui/status-badge";
import { formatVnd } from "../../../lib/utils/format";
import { ApplyButton } from "../../applications/components/apply-button";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";

export function LedgerPublishedProjects() {
  const ledger = useDemoLedger();
  const projects = ledger.projects.filter(
    (project) => project.status === "PUBLISHED" && project.createdAt !== "2026-09-01"
  );

  if (!projects.length) return null;

  return (
    <section className="stack" style={{ marginBottom: "var(--space-8)" }}>
      <div className="industrial-ruler">DỰ ÁN VỪA ĐƯỢC DUYỆT TRÊN LEDGER</div>
      {projects.map((project) => (
        <article
          key={project.id}
          className="module-bay stack stack--sm"
          style={{ padding: "var(--space-5)" }}
        >
          <div className="module-bay__header">
            <span className="module-bay__id">PROJECT // {project.id.toUpperCase()}</span>
            <StatusBadge status={project.status} />
          </div>
          <h2 style={{ fontSize: "var(--text-h3-size)", margin: "var(--space-1) 0" }}>
            <Link
              href={`/projects/${project.id}`}
              style={{ color: "inherit", textDecoration: "none" }}
              className="hover:underline"
            >
              {project.title}
            </Link>
          </h2>
          <p className="text-muted" style={{ margin: 0 }}>
            {project.summary}
          </p>
          <div className="cluster cluster--between" style={{ alignItems: "center", marginTop: "var(--space-3)" }}>
            <strong className="project-row__money" style={{ fontSize: "1.25rem" }}>
              {formatVnd(project.budget)}
            </strong>
            <div className="cluster" style={{ gap: "var(--space-3)" }}>
              <Link
                href={`/projects/${project.id}`}
                className="btn--tactile-zinc"
                style={{ fontSize: "12px", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
              >
                XEM CHI TIẾT
              </Link>
              <ApplyButton
                projectId={project.id}
                projectTitle={project.title}
                smeName={project.smeName}
                budget={project.budget}
              />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
