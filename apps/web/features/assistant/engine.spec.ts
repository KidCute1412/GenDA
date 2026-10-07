import { describe, expect, it } from "vitest";
import { createSeedLedger } from "../demo-ledger/store";
import type { DemoApplication, DemoLedger, DemoProject } from "../demo-ledger/types";
import { buildStudentInsights, letterSimilarity, rejectionStreak, THRESHOLDS } from "./engine";
import type { InsightContext } from "./types";

const NOW = new Date("2026-10-07T09:00:00.000Z");
const STUDENT = "student-loc";
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86_400_000).toISOString();

function context(ledger: DemoLedger, overrides: Partial<InsightContext> = {}): InsightContext {
  return { ledger, userId: STUDENT, now: NOW, previousVisitAt: null, introDone: true, ...overrides };
}

function addClosedProject(ledger: DemoLedger, id: string, skills: string[]) {
  const project: DemoProject = { id, ownerId: "sme-coffee", title: `Dự án ${id}`, smeName: "Tiệm bánh Mây", budget: 2_000_000, deadline: "2026-11-30", skills, summary: "", problem: "", acceptance: [], status: "IN_PROGRESS", milestoneIds: [], createdAt: daysAgo(30) };
  ledger.projects.push(project);
  return project;
}

function addApplication(ledger: DemoLedger, application: Partial<DemoApplication> & Pick<DemoApplication, "id" | "projectId" | "status" | "submittedAt">) {
  ledger.applications.push({ studentId: STUDENT, coverLetter: "Em rất muốn tham gia dự án này, em chăm chỉ và ham học hỏi.", ...application });
}

const kinds = (ctx: InsightContext) => buildStudentInsights(ctx).map((insight) => insight.kind);

describe("trợ lý Gen: bộ quy tắc", () => {
  it("chào lần đầu trước mọi lời nhắc khác", () => {
    const insights = buildStudentInsights(context(createSeedLedger(), { introDone: false }));
    expect(insights[0].kind).toBe("INTRO");
    expect(insights[0].lines[0].text).toContain("Lộc");
  });

  it("không nói gì với tài khoản không phải sinh viên", () => {
    expect(buildStudentInsights(context(createSeedLedger(), { userId: "sme-coffee" }))).toEqual([]);
  });

  it("nhắc đơn chờ lâu chưa có phản hồi, theo nấc 7 / 14 / 30 ngày", () => {
    const insights = buildStudentInsights(context(createSeedLedger()));
    const wait = insights.find((insight) => insight.kind === "LONG_WAIT");
    // Đơn mẫu a-coffee gửi 15/09, tới 07/10 là 22 ngày
    expect(wait?.key).toBe("wait:a-coffee:14");
    expect(wait?.lines[0].text).toContain("22 ngày");
  });

  it("không coi đơn đã vào danh sách rút gọn là đang chờ", () => {
    const ledger = createSeedLedger();
    ledger.applications.find((application) => application.id === "a-coffee")!.status = "SHORTLISTED";
    expect(kinds(context(ledger))).not.toContain("LONG_WAIT");
    expect(kinds(context(ledger))).toContain("SHORTLISTED");
  });

  describe("nộp mãi không được", () => {
    it("một lần bị từ chối chưa phải là chuỗi", () => {
      expect(kinds(context(createSeedLedger()))).not.toContain("REJECTION_STREAK");
    });

    it("chẩn đoán lệch kỹ năng, kỹ năng hay thiếu và thư ngỏ dùng lại", () => {
      const ledger = createSeedLedger();
      addClosedProject(ledger, "p-a", ["Figma", "Thiết kế đồ họa"]);
      addClosedProject(ledger, "p-b", ["Figma", "Quảng cáo Meta"]);
      addApplication(ledger, { id: "a-1", projectId: "p-a", status: "REJECTED", submittedAt: daysAgo(10) });
      addApplication(ledger, { id: "a-2", projectId: "p-b", status: "REJECTED", submittedAt: daysAgo(5) });

      const coach = buildStudentInsights(context(ledger)).find((insight) => insight.kind === "REJECTION_STREAK");
      // Hai đơn mới cộng đơn mẫu a-minh-chau (cũng thiếu Figma) = chuỗi 3
      expect(coach?.key).toBe("streak:a-2:3");
      const text = coach!.lines.map((line) => line.text).join(" ");
      expect(text).toContain("trung bình 0%");
      expect(text).toContain("Figma có mặt ở 3/3");
      expect(text).toContain("giống hệt nhau");
      expect(coach!.choices[0].href).toBe("/projects");
    });

    it("chuỗi bắt đầu lại sau một lần được nhận", () => {
      const ledger = createSeedLedger();
      addClosedProject(ledger, "p-a", ["Figma"]);
      addClosedProject(ledger, "p-b", ["Next.js"]);
      addApplication(ledger, { id: "a-1", projectId: "p-a", status: "REJECTED", submittedAt: daysAgo(10) });
      addApplication(ledger, { id: "a-2", projectId: "p-b", status: "ACCEPTED", submittedAt: daysAgo(5) });
      expect(rejectionStreak(ledger.applications.filter((application) => application.studentId === STUDENT))).toHaveLength(0);
      expect(kinds(context(ledger))).not.toContain("REJECTION_STREAK");
    });
  });

  describe("quay lại sau thời gian vắng", () => {
    it("tóm tắt những gì đổi trong lúc vắng và đứng trước việc khác", () => {
      const ledger = createSeedLedger();
      ledger.applications.find((application) => application.id === "a-coffee")!.status = "SHORTLISTED";
      ledger.audits.unshift({ id: "x", at: daysAgo(3), actorId: "sme-coffee", action: "SHORTLISTED", targetId: "a-coffee" });
      const insights = buildStudentInsights(context(ledger, { previousVisitAt: daysAgo(9) }));
      expect(insights[0].kind).toBe("WELCOME_BACK");
      expect(insights[0].lines[0].text).toContain("9 ngày");
      expect(insights[0].lines[1].text).toContain("danh sách rút gọn");
    });

    it(`vắng dưới ${THRESHOLDS.awayDays} ngày thì không chào lại`, () => {
      expect(kinds(context(createSeedLedger(), { previousVisitAt: daysAgo(2) }))).not.toContain("WELCOME_BACK");
    });

    it("gợi ý dự án mới đăng khớp kỹ năng kể từ lần trước", () => {
      const ledger = createSeedLedger();
      ledger.projects.push({ ...ledger.projects[0], id: "p-new", title: "Landing page quán bún bò", skills: ["Next.js", "React", "UI/UX"], status: "PUBLISHED", createdAt: daysAgo(1) });
      const suggestion = buildStudentInsights(context(ledger, { previousVisitAt: daysAgo(3) })).find((insight) => insight.kind === "MATCH_SUGGESTION");
      expect(suggestion?.choices[0].href).toBe("/projects");
      expect(suggestion?.lines[1].text).toContain("3/3");
    });
  });

  describe("việc gấp ở mốc bàn giao", () => {
    it("yêu cầu sửa đứng đầu và trích nguyên văn góp ý", () => {
      const ledger = createSeedLedger();
      const milestone = ledger.milestones.find((candidate) => candidate.id === "p-eco:m2")!;
      milestone.status = "CHANGES_REQUESTED";
      ledger.submissions.push({ id: "s1", milestoneId: milestone.id, studentId: STUDENT, files: [], note: "", submittedAt: daysAgo(2), feedback: "Cỡ chữ còn nhỏ" });
      const insights = buildStudentInsights(context(ledger));
      expect(insights[0].kind).toBe("CHANGES_REQUESTED");
      expect(insights[0].lines[1].text).toContain("“Cỡ chữ còn nhỏ”");
      expect(insights[0].choices[0].href).toBe("/workspace/p-eco");
    });

    it("mốc quá hạn có khóa riêng để vẫn được nhắc khi chuyển từ sắp tới hạn sang quá hạn", () => {
      const ledger = createSeedLedger();
      const milestone = ledger.milestones.find((candidate) => candidate.id === "p-eco:m2")!;
      milestone.status = "PENDING";
      milestone.deadline = "2026-10-05";
      const deadline = buildStudentInsights(context(ledger)).find((insight) => insight.kind === "DEADLINE_SOON");
      expect(deadline?.key).toBe("deadline:p-eco:m2:overdue");
      expect(deadline?.lines[0].text).toContain("quá hạn 2 ngày");
    });
  });

  it("sinh viên chưa xác minh được nhắc xác minh, không được gợi ý dự án", () => {
    const ledger = createSeedLedger();
    const result = kinds(context(ledger, { userId: "student-unverified" }));
    expect(result).toContain("VERIFICATION");
    expect(result).toContain("SKILLS_FEW");
    expect(result).not.toContain("MATCH_SUGGESTION");
  });

  it("đo được thư ngỏ dùng lại", () => {
    expect(letterSimilarity("Em rất muốn tham gia dự án này", "Em rất muốn tham gia dự án này.")).toBe(1);
    expect(letterSimilarity("Em từng làm landing page cho quán cà phê", "Em mạnh SEO và viết bài chuẩn từ khóa")).toBeLessThan(0.2);
  });

  it("không có gạch ngang dài hay nháy thẳng trong lời thoại", () => {
    const ledger = createSeedLedger();
    const milestone = ledger.milestones.find((candidate) => candidate.id === "p-eco:m2")!;
    milestone.status = "CHANGES_REQUESTED";
    const all = [
      ...buildStudentInsights(context(ledger, { introDone: false, previousVisitAt: daysAgo(10) })),
      ...buildStudentInsights(context(ledger, { userId: "student-unverified" }))
    ];
    const strings = all.flatMap((insight) => [insight.title, insight.reason, ...insight.lines.map((line) => line.text), ...insight.choices.map((choice) => choice.label)]);
    strings.forEach((text) => expect(text).not.toMatch(/[—–"]/));
  });
});
