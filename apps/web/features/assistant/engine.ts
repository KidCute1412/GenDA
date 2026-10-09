import { daysUntil, formatDate, matchScore } from "../../lib/utils/format";
import type { DemoApplication, DemoMilestone, DemoProject } from "../demo-ledger/types";
import { INSIGHT_TIERS, type Insight, type InsightContext } from "./types";

/**
 * Bộ máy "đọc tình trạng" của Gen: từ dữ liệu của chính sinh viên suy ra những điều đáng nói,
 * xếp theo mức quan trọng. Hàm thuần, không đọc đồng hồ hay bộ nhớ trình duyệt, để mọi quy tắc
 * kiểm thử được bằng unit test (cùng tinh thần FR-MAT-01: quy tắc tường minh, không AI).
 *
 * Ngưỡng nằm ở đây thay vì rải trong từng quy tắc: đổi ngưỡng là đổi hành vi sản phẩm, nên nó
 * phải đọc được một chỗ và khớp với bảng ở docs/assistant.md.
 */
export const THRESHOLDS = {
  /** Vắng bao nhiêu ngày thì Gen chào "lâu rồi không gặp". */
  awayDays: 7,
  /** Đơn chờ bao nhiêu ngày chưa có phản hồi thì coi là chờ lâu. */
  longWaitDays: 7,
  /** Số đơn bị từ chối liên tiếp (tính từ đơn gần nhất) để Gen xem lại cùng sinh viên. */
  rejectionStreak: 2,
  /** Mốc còn bao nhiêu ngày thì nhắc hạn. */
  deadlineWarnDays: 3,
  /** Điểm phù hợp được coi là "khớp tốt" để gợi ý. */
  goodMatchPercent: 67,
  /** Điểm phù hợp trung bình dưới mức này thì coi là đang nộp lệch kỹ năng. */
  lowMatchPercent: 50,
  /** Thư ngỏ ngắn hơn số ký tự này thì coi là sơ sài. */
  shortLetterChars: 200,
  /** Hai thư ngỏ giống nhau từ mức này trở lên (Jaccard trên tập từ) thì coi là dùng lại. */
  reusedLetterSimilarity: 0.8,
  /** CV không cập nhật quá số ngày này thì gợi ý làm mới. */
  staleCvDays: 90,
  /** Hồ sơ ít hơn số kỹ năng này thì gợi ý bổ sung. */
  minSkills: 3
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;

const quote = (text: string) => `“${text}”`;
const daysSince = (iso: string, now: Date) => Math.floor((now.getTime() - Date.parse(iso)) / DAY_MS);
const todayOf = (now: Date) => now.toISOString().slice(0, 10);

/** "Lê Tuấn Lộc" -> "Lộc": tiếng Việt gọi nhau bằng tên, không bằng họ. */
export function firstName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] || fullName;
}

/** "a", "a và b", "a, b và c". */
function joinVi(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} và ${items[items.length - 1]}`;
}

function wordSet(text: string) {
  return new Set(text.toLowerCase().normalize("NFC").split(/[^\p{L}\p{N}]+/u).filter((word) => word.length > 1));
}

/** Độ giống nhau giữa hai thư ngỏ (Jaccard trên tập từ), 0 tới 1. */
export function letterSimilarity(a: string, b: string) {
  const left = wordSet(a);
  const right = wordSet(b);
  if (!left.size || !right.size) return 0;
  let shared = 0;
  left.forEach((word) => { if (right.has(word)) shared += 1; });
  return shared / (left.size + right.size - shared);
}

function scope(ctx: InsightContext) {
  const { ledger, userId } = ctx;
  const user = ledger.users.find((candidate) => candidate.id === userId);
  const skills = user?.skills ?? [];
  const applications = ledger.applications.filter((application) => application.studentId === userId);
  const projectOf = (id: string) => ledger.projects.find((project) => project.id === id);
  const milestonesOf = (project: DemoProject) =>
    project.milestoneIds
      .map((id) => ledger.milestones.find((milestone) => milestone.id === id))
      .filter((milestone): milestone is DemoMilestone => Boolean(milestone))
      .sort((a, b) => a.order - b.order);
  const assigned = applications
    .filter((application) => application.status === "ACCEPTED")
    .map((application) => projectOf(application.projectId))
    .filter((project): project is DemoProject => Boolean(project));
  const score = (project: DemoProject) => matchScore(project.skills, skills);
  return { ...ctx, user, skills, applications, projectOf, milestonesOf, assigned, score, today: todayOf(ctx.now) };
}

type Scope = ReturnType<typeof scope>;
type Rule = (s: Scope) => Insight | null;

/* --------------------------------------------------------------------------
   Lần đầu gặp và lúc quay lại
   -------------------------------------------------------------------------- */

const intro: Rule = (s) => {
  if (s.introDone || !s.user) return null;
  return {
    kind: "INTRO",
    key: "intro",
    tier: "intro",
    title: "Gen là ai?",
    lines: [
      { expression: "happy", text: `Chào ${firstName(s.user.name)}! Mình là Gen, trợ lý tìm việc của bạn trên GenDA.` },
      { expression: "neutral", text: "Mình theo dõi hồ sơ, đơn ứng tuyển và các mốc bàn giao của bạn, rồi lên tiếng đúng lúc: khi có dự án hợp với bạn, khi đơn chờ quá lâu, hay khi có chỗ nên sửa." },
      { expression: "wink", text: "Mình chỉ đọc dữ liệu của chính bạn trên GenDA. Cần mình thì bấm vào góc dưới bên phải màn hình nhé." }
    ],
    choices: [{ label: "Bắt đầu thôi" }],
    reason: "Đây là lần đầu bạn gặp Gen trên trình duyệt này."
  };
};

const welcomeBack: Rule = (s) => {
  if (!s.previousVisitAt || !s.user) return null;
  const away = daysSince(s.previousVisitAt, s.now);
  if (away < THRESHOLDS.awayDays) return null;

  const since = Date.parse(s.previousVisitAt);
  const recent = s.ledger.audits.filter((audit) => Date.parse(audit.at) > since);
  const news: string[] = [];

  for (const application of s.applications) {
    const project = s.projectOf(application.projectId);
    if (!project) continue;
    const touched = recent.some((audit) => audit.targetId === application.id && ["SHORTLISTED", "ACCEPTED"].includes(audit.action));
    const closedByOther = application.status === "REJECTED" && recent.some((audit) =>
      audit.action === "ACCEPTED" && s.ledger.applications.find((other) => other.id === audit.targetId)?.projectId === project.id);
    if (application.status === "SHORTLISTED" && touched) news.push(`đơn ${quote(project.title)} đã vào danh sách rút gọn`);
    else if (application.status === "ACCEPTED" && touched) news.push(`đơn ${quote(project.title)} đã được nhận`);
    else if (closedByOther) news.push(`đơn ${quote(project.title)} đã có kết quả`);
  }

  for (const project of s.assigned) {
    for (const milestone of s.milestonesOf(project)) {
      const review = recent.find((audit) => audit.targetId === milestone.id && ["ACCEPT_MILESTONE", "REQUEST_CHANGES"].includes(audit.action));
      if (review) news.push(`mốc ${quote(milestone.title)} ${review.action === "ACCEPT_MILESTONE" ? "đã được nghiệm thu" : "được yêu cầu sửa"}`);
    }
  }

  const applied = new Set(s.applications.map((application) => application.projectId));
  const freshMatches = s.ledger.projects.filter((project) =>
    project.status === "PUBLISHED" && !applied.has(project.id) && Date.parse(project.createdAt) > since && s.score(project).percent >= THRESHOLDS.goodMatchPercent);
  if (freshMatches.length) news.push(`có ${freshMatches.length} dự án mới khớp tốt với kỹ năng của bạn`);

  return {
    kind: "WELCOME_BACK",
    key: `welcome:${s.previousVisitAt.slice(0, 10)}`,
    tier: "welcome",
    title: "Trong lúc bạn vắng",
    lines: [
      { expression: "happy", text: `${firstName(s.user.name)}, lâu rồi không gặp! Bạn vắng ${away} ngày rồi đó.` },
      news.length
        ? { expression: "thinking", text: `Trong lúc bạn vắng, ${joinVi(news.slice(0, 3))}.` }
        : { expression: "neutral", text: "Trong lúc bạn vắng, đơn ứng tuyển và dự án của bạn chưa có thay đổi nào." },
      { expression: "wink", text: "Mình đã xếp các việc cần xem theo thứ tự quan trọng, mình nói lần lượt nhé." }
    ],
    choices: [{ label: "Nghe Gen nói tiếp" }],
    reason: `Lần hoạt động trước của bạn là ngày ${formatDate(s.previousVisitAt.slice(0, 10))}. Gen so trạng thái đơn, mốc bàn giao và dự án mới kể từ hôm đó.`
  };
};

/* --------------------------------------------------------------------------
   Việc gấp: mốc bàn giao
   -------------------------------------------------------------------------- */

const changesRequested: Rule = (s) => {
  for (const project of s.assigned) {
    if (project.status !== "IN_PROGRESS") continue;
    const milestone = s.milestonesOf(project).find((candidate) => candidate.status === "CHANGES_REQUESTED");
    if (!milestone) continue;
    const submissions = s.ledger.submissions.filter((submission) => submission.milestoneId === milestone.id);
    const feedback = [...submissions].reverse().find((submission) => submission.feedback)?.feedback;
    const left = daysUntil(milestone.deadline, s.today);
    return {
      kind: "CHANGES_REQUESTED",
      key: `changes:${milestone.id}:${submissions.length}`,
      tier: "urgent",
      title: `Sửa mốc ${quote(milestone.title)}`,
      lines: [
        { expression: "concerned", text: `${project.smeName} vừa yêu cầu sửa mốc ${quote(milestone.title)}.` },
        feedback
          ? { expression: "thinking", text: `Góp ý của họ: ${quote(feedback)}` }
          : { expression: "thinking", text: "Họ chưa ghi chi tiết, bạn đối chiếu lại tiêu chí nghiệm thu của mốc này nhé." },
        {
          expression: "wink",
          text: left >= 0
            ? `Sửa đúng góp ý rồi nộp lại là được, mốc này còn ${left} ngày. Các lần nộp trước vẫn được giữ trong lịch sử.`
            : "Mốc này đã quá hạn, nên báo doanh nghiệp ngày bạn nộp lại. Các lần nộp trước vẫn được giữ trong lịch sử."
        }
      ],
      choices: [{ label: "Mở không gian làm việc", href: `/workspace/${project.id}` }],
      reason: `Mốc ${quote(milestone.title)} của dự án ${quote(project.title)} đang ở trạng thái ${quote("cần sửa")}, hạn ${formatDate(milestone.deadline)}.`
    };
  }
  return null;
};

const deadlineSoon: Rule = (s) => {
  const due = s.assigned
    .filter((project) => project.status === "IN_PROGRESS")
    .flatMap((project) => s.milestonesOf(project)
      .filter((milestone) => milestone.status === "PENDING")
      .map((milestone) => ({ project, milestone, left: daysUntil(milestone.deadline, s.today) })))
    .filter((item) => item.left <= THRESHOLDS.deadlineWarnDays)
    .sort((a, b) => a.left - b.left)[0];
  if (!due) return null;
  const { project, milestone, left } = due;
  const bucket = left < 0 ? "overdue" : left === 0 ? "today" : "soon";
  const headline = left < 0
    ? `Mốc ${quote(milestone.title)} đã quá hạn ${-left} ngày.`
    : left === 0
      ? `Mốc ${quote(milestone.title)} hết hạn hôm nay.`
      : `Mốc ${quote(milestone.title)} còn ${left} ngày là tới hạn (${formatDate(milestone.deadline)}).`;
  return {
    kind: "DEADLINE_SOON",
    key: `deadline:${milestone.id}:${bucket}`,
    tier: "urgent",
    title: `Hạn mốc ${quote(milestone.title)}`,
    lines: [
      { expression: left < 0 ? "concerned" : "surprised", text: headline },
      left < 0
        ? { expression: "neutral", text: "Nếu cần thêm thời gian, hãy báo doanh nghiệp ngay. Báo sớm luôn giữ được lòng tin hơn là im lặng." }
        : { expression: "neutral", text: `Tiêu chí nghiệm thu: ${quote(milestone.criteria)}. Nộp sớm một chút để còn thời gian sửa nếu doanh nghiệp góp ý.` }
    ],
    choices: [{ label: "Mở không gian làm việc", href: `/workspace/${project.id}` }],
    reason: `Mốc ${milestone.order} của dự án ${quote(project.title)} chưa nộp, hạn ${formatDate(milestone.deadline)}.`
  };
};

/* --------------------------------------------------------------------------
   Tin mới về đơn và dự án
   -------------------------------------------------------------------------- */

const acceptedStart: Rule = (s) => {
  const application = s.applications.find((candidate) => {
    const project = candidate.status === "ACCEPTED" ? s.projectOf(candidate.projectId) : undefined;
    return project?.status === "IN_PROGRESS" && s.milestonesOf(project).every((milestone) => milestone.status === "PENDING");
  });
  const project = application && s.projectOf(application.projectId);
  if (!application || !project) return null;
  const first = s.milestonesOf(project)[0];
  return {
    kind: "ACCEPTED_START",
    key: `accepted:${application.id}`,
    tier: "news",
    title: "Bạn đã được nhận",
    lines: [
      { expression: "happy", text: `Chúc mừng! ${project.smeName} đã chọn bạn cho dự án ${quote(project.title)}.` },
      first
        ? { expression: "neutral", text: `Mốc đầu tiên là ${quote(first.title)}, hạn ${formatDate(first.deadline)}.` }
        : { expression: "neutral", text: "Doanh nghiệp sẽ chia dự án thành các mốc bàn giao, bạn theo dõi trong không gian làm việc." },
      { expression: "wink", text: "Đọc kỹ tiêu chí nghiệm thu trước khi bắt tay vào làm. Chỗ nào chưa rõ thì hỏi lại ngay từ đầu." }
    ],
    choices: [{ label: "Vào không gian làm việc", href: `/workspace/${project.id}` }],
    reason: `Đơn của bạn cho dự án ${quote(project.title)} ở trạng thái ${quote("được nhận")} và chưa mốc nào bắt đầu bàn giao.`
  };
};

const shortlisted: Rule = (s) => {
  const application = [...s.applications]
    .filter((candidate) => candidate.status === "SHORTLISTED")
    .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt))[0];
  const project = application && s.projectOf(application.projectId);
  if (!application || !project) return null;
  return {
    kind: "SHORTLISTED",
    key: `shortlist:${application.id}`,
    tier: "news",
    title: "Đơn vào danh sách rút gọn",
    lines: [
      { expression: "surprised", text: `Tin tốt: đơn ${quote(project.title)} của bạn đã vào danh sách rút gọn.` },
      { expression: "neutral", text: `${project.smeName} đang cân nhắc những người cuối cùng và có thể liên hệ hỏi thêm. Bạn để ý email nhé.` },
      { expression: "wink", text: "Đọc lại thư ngỏ bạn đã gửi để trả lời cho khớp những gì mình đã hứa." }
    ],
    choices: [{ label: "Xem đơn của tôi", href: "/student/applications?status=pending" }],
    reason: `Đơn cho dự án ${quote(project.title)} đang ở trạng thái ${quote("vào danh sách rút gọn")}.`
  };
};

const projectCompleted: Rule = (s) => {
  const project = s.assigned.find((candidate) => candidate.status === "COMPLETED");
  if (!project) return null;
  const review = s.ledger.reviews.find((candidate) => candidate.projectId === project.id && candidate.studentId === s.userId);
  return {
    kind: "PROJECT_COMPLETED",
    key: `completed:${project.id}:${review?.id ?? "pending"}`,
    tier: "news",
    title: "Dự án đã hoàn tất",
    lines: [
      { expression: "happy", text: `Dự án ${quote(project.title)} đã được nghiệm thu toàn bộ. Bạn làm tốt lắm!` },
      review
        ? { expression: "surprised", text: `${project.smeName} chấm bạn ${review.rating}/5: ${quote(review.comment)}` }
        : { expression: "neutral", text: `${project.smeName} sẽ gửi đánh giá, và đánh giá đó hiện trên hồ sơ của bạn.` },
      { expression: "wink", text: "Thêm dự án này vào CV ngay khi còn nhớ rõ việc mình đã làm. Dự án đã nghiệm thu là bằng chứng mạnh nhất cho đơn sau." }
    ],
    choices: [{ label: "Cập nhật CV", href: "/student/cv" }],
    reason: `Dự án ${quote(project.title)} bạn được nhận đã chuyển sang ${quote("hoàn tất")}.`
  };
};

/* --------------------------------------------------------------------------
   Hồ sơ chưa sẵn sàng
   -------------------------------------------------------------------------- */

const cvMissing: Rule = (s) => {
  if (!s.user || s.user.cv) return null;
  return {
    kind: "CV_MISSING",
    key: "cv:missing",
    tier: "coach",
    title: "Nộp CV để bắt đầu",
    lines: [
      { expression: "neutral", text: "Bạn xem được mọi dự án, nhưng cần CV dạng PDF để gửi đơn. Tệp tối đa 2 MB." },
      { expression: "wink", text: "Chưa có CV cũng đừng lo: một trang, ghi rõ kỹ năng và một hai việc bạn từng làm là đủ để bắt đầu." }
    ],
    choices: [{ label: "Nộp CV", href: "/student/cv" }],
    reason: "Hồ sơ của bạn chưa có CV."
  };
};

/* --------------------------------------------------------------------------
   Huấn luyện: nộp mãi không được, chờ quá lâu, hồ sơ mỏng
   -------------------------------------------------------------------------- */

/**
 * Chuỗi từ chối tính từ đơn GẦN NHẤT đã có kết quả trở về trước, dừng ở đơn được nhận đầu tiên.
 * Một lần được nhận ở giữa nghĩa là cách nộp vẫn đang hiệu quả, nên chuỗi bắt đầu lại.
 */
export function rejectionStreak(applications: DemoApplication[]) {
  const resolved = applications
    .filter((application) => application.status === "ACCEPTED" || application.status === "REJECTED")
    .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt));
  const streak: DemoApplication[] = [];
  for (const application of resolved) {
    if (application.status !== "REJECTED") break;
    streak.push(application);
  }
  return streak;
}

type Diagnosis = { line: string; choice: { label: string; href: string } };

function diagnoseRejections(s: Scope, streak: DemoApplication[]): Diagnosis[] {
  const projects = streak.map((application) => s.projectOf(application.projectId)).filter((project): project is DemoProject => Boolean(project));
  const found: Diagnosis[] = [];

  const scores = projects.map((project) => s.score(project));
  const average = scores.length ? Math.round(scores.reduce((sum, score) => sum + score.percent, 0) / scores.length) : 100;
  if (average < THRESHOLDS.lowMatchPercent) {
    found.push({
      line: `Các dự án đó chỉ khớp trung bình ${average}% kỹ năng trong hồ sơ của bạn. Doanh nghiệp thường chọn người làm được ngay, nên thử tập trung vào dự án khớp từ ${THRESHOLDS.goodMatchPercent}% trở lên.`,
      choice: { label: "Tìm dự án khớp hơn", href: "/projects" }
    });
  }

  const missing = new Map<string, number>();
  projects.forEach((project) => project.skills.filter((skill) => !s.skills.includes(skill)).forEach((skill) => missing.set(skill, (missing.get(skill) ?? 0) + 1)));
  const [gapSkill, gapCount] = [...missing.entries()].sort((a, b) => b[1] - a[1])[0] ?? ["", 0];
  if (gapCount >= 2) {
    found.push({
      line: `${gapSkill} có mặt ở ${gapCount}/${projects.length} dự án bạn chưa được chọn, mà hồ sơ của bạn chưa có. Nếu bạn đã biết dùng thì thêm vào hồ sơ; nếu chưa, đây là kỹ năng đáng học tiếp.`,
      choice: { label: "Cập nhật kỹ năng", href: "/student/profile" }
    });
  }

  const letters = streak.map((application) => application.coverLetter.trim());
  const short = letters.filter((letter) => letter.length < THRESHOLDS.shortLetterChars).length;
  const reused = letters.some((letter, index) => letters.slice(index + 1).some((other) => letterSimilarity(letter, other) >= THRESHOLDS.reusedLetterSimilarity));
  if (reused || short * 2 > letters.length) {
    found.push({
      line: reused
        ? "Thư ngỏ ở các đơn đó gần như giống hệt nhau. Chủ doanh nghiệp nhỏ đọc từng thư và muốn thấy bạn hiểu đúng bài toán của họ. Hãy nhắc tới bài toán đó và một việc bạn từng làm gần giống."
        : `Phần lớn thư ngỏ của bạn ngắn hơn ${THRESHOLDS.shortLetterChars} ký tự. Thêm một câu về bài toán của doanh nghiệp và một việc bạn từng làm gần giống, thư sẽ khác hẳn.`,
      choice: { label: "Xem lại đơn đã gửi", href: "/student/applications?status=rejected" }
    });
  }

  const cvAge = s.user?.cv ? daysSince(s.user.cv.uploadedAt, s.now) : 0;
  if (cvAge > THRESHOLDS.staleCvDays) {
    found.push({
      line: `CV của bạn đã ${cvAge} ngày chưa cập nhật. Thêm những gì bạn làm được gần đây để CV theo kịp bạn.`,
      choice: { label: "Cập nhật CV", href: "/student/cv" }
    });
  }
  return found;
}

const rejectionCoach: Rule = (s) => {
  const streak = rejectionStreak(s.applications);
  if (streak.length < THRESHOLDS.rejectionStreak) return null;
  const diagnoses = diagnoseRejections(s, streak).slice(0, 3);
  const lines: Insight["lines"] = [
    { expression: "concerned", text: `${streak.length} đơn gần nhất của bạn đều chưa được chọn. Mình biết cảm giác này không dễ chịu, nên mình đã xem lại các đơn đó cùng bạn.` },
    ...diagnoses.map((diagnosis) => ({ expression: "thinking" as const, text: diagnosis.line }))
  ];
  lines.push(diagnoses.length
    ? { expression: "wink", text: "Sửa một điểm thôi cũng đủ khác ở đơn sau. Mình bắt đầu từ điểm đầu tiên nhé." }
    : { expression: "neutral", text: "Các đơn đó khớp kỹ năng khá tốt và thư ngỏ cũng ổn, nên có thể lần đó doanh nghiệp đã có người hợp hơn. Bạn cứ tiếp tục nộp vào dự án khớp cao." });
  return {
    kind: "REJECTION_STREAK",
    key: `streak:${streak[0].id}:${streak.length}`,
    tier: "coach",
    title: "Xem lại các đơn chưa được chọn",
    lines,
    choices: diagnoses.length ? [diagnoses[0].choice] : [{ label: "Tìm dự án", href: "/projects" }],
    reason: `Dựa trên ${streak.length} đơn bị từ chối liên tiếp gần nhất: kỹ năng dự án yêu cầu so với hồ sơ của bạn, độ dài và độ trùng lặp của thư ngỏ, ngày cập nhật CV.`
  };
};

const longWait: Rule = (s) => {
  const waiting = s.applications
    // Vào danh sách rút gọn đã là một phản hồi, nên chỉ đơn còn "đã gửi" mới tính là chờ.
    .filter((application) => application.status === "SUBMITTED")
    .map((application) => ({ application, days: daysSince(application.submittedAt, s.now) }))
    .filter((item) => item.days >= THRESHOLDS.longWaitDays)
    .sort((a, b) => b.days - a.days);
  const oldest = waiting[0];
  const project = oldest && s.projectOf(oldest.application.projectId);
  if (!oldest || !project) return null;
  const bucket = oldest.days >= 30 ? 30 : oldest.days >= 14 ? 14 : THRESHOLDS.longWaitDays;
  const applied = new Set(s.applications.map((application) => application.projectId));
  const alternatives = s.ledger.projects.filter((candidate) => candidate.status === "PUBLISHED" && !applied.has(candidate.id) && s.score(candidate).percent >= THRESHOLDS.goodMatchPercent);
  return {
    kind: "LONG_WAIT",
    key: `wait:${oldest.application.id}:${bucket}`,
    tier: "coach",
    title: "Đơn chờ lâu chưa có phản hồi",
    lines: [
      {
        expression: "thinking",
        text: waiting.length > 1
          ? `Bạn có ${waiting.length} đơn chờ hơn ${THRESHOLDS.longWaitDays} ngày. Lâu nhất là ${quote(project.title)}, đã ${oldest.days} ngày.`
          : `Đơn ${quote(project.title)} đã chờ ${oldest.days} ngày mà ${project.smeName} chưa phản hồi.`
      },
      { expression: "neutral", text: "Chủ doanh nghiệp nhỏ vừa lo kinh doanh vừa đọc đơn, nên phản hồi có thể chậm. Bạn không cần ngồi chờ một đơn duy nhất." },
      alternatives.length
        ? { expression: "wink", text: `Đang có ${alternatives.length} dự án khác khớp tốt với bạn. Cứ nộp thêm, bạn vẫn rút được đơn bất cứ lúc nào trước khi được chọn.` }
        : { expression: "wink", text: "Trong lúc chờ, cứ xem thêm dự án mới. Bạn vẫn rút được đơn bất cứ lúc nào trước khi được chọn." }
    ],
    choices: [{ label: "Tìm dự án khác", href: "/projects" }, { label: "Xem đơn đang chờ", href: "/student/applications?status=pending" }],
    reason: `Đơn cho dự án ${quote(project.title)} gửi ngày ${formatDate(oldest.application.submittedAt.slice(0, 10))} vẫn ở trạng thái chờ.`
  };
};

const skillsFew: Rule = (s) => {
  if (!s.user?.cv || s.skills.length >= THRESHOLDS.minSkills) return null;
  return {
    kind: "SKILLS_FEW",
    key: `skills:${s.skills.length}`,
    tier: "coach",
    title: "Bổ sung kỹ năng",
    lines: [
      { expression: "thinking", text: s.skills.length ? `Hồ sơ của bạn mới có ${s.skills.length} kỹ năng.` : "Hồ sơ của bạn chưa có kỹ năng nào." },
      { expression: "neutral", text: "Điểm phù hợp với dự án tính từ kỹ năng trong hồ sơ, nên thiếu kỹ năng thì mình gợi ý dự án kém chính xác và doanh nghiệp cũng khó thấy bạn." }
    ],
    choices: [{ label: "Cập nhật kỹ năng", href: "/student/profile" }],
    reason: `Hồ sơ có ${s.skills.length} kỹ năng, dưới mức ${THRESHOLDS.minSkills} kỹ năng Gen cần để gợi ý chính xác.`
  };
};

/* --------------------------------------------------------------------------
   Khám phá: dự án hợp với bạn
   -------------------------------------------------------------------------- */

const matchSuggestion: Rule = (s) => {
  if (!s.user?.cv || !s.user.emailVerified || s.user.accountState !== "ACTIVE") return null;
  const applied = new Set(s.applications.map((application) => application.projectId));
  const since = s.previousVisitAt ? Date.parse(s.previousVisitAt) : null;
  const candidates = s.ledger.projects
    .filter((project) => project.status === "PUBLISHED" && !applied.has(project.id))
    .map((project) => ({ project, score: s.score(project) }))
    .filter((item) => item.score.percent >= THRESHOLDS.goodMatchPercent)
    .sort((a, b) => b.score.percent - a.score.percent || Date.parse(b.project.createdAt) - Date.parse(a.project.createdAt));
  const firstTime = s.applications.length === 0;
  const pick = firstTime ? candidates[0] : candidates.find((item) => since !== null && Date.parse(item.project.createdAt) > since);
  if (!pick) return null;
  const { project, score } = pick;
  return {
    kind: "MATCH_SUGGESTION",
    key: `match:${project.id}`,
    tier: "discover",
    title: "Dự án hợp với bạn",
    lines: [
      firstTime
        ? { expression: "neutral", text: "Bạn chưa gửi đơn nào. Mình tìm thấy một dự án hợp với kỹ năng của bạn để bắt đầu." }
        : { expression: "surprised", text: "Có dự án mới đăng hợp với bạn đây." },
      { expression: "happy", text: `${quote(project.title)} của ${project.smeName}: khớp ${score.matchedCount}/${score.total} kỹ năng (${joinVi(score.matched)}), hạn ${formatDate(project.deadline)}.` }
    ],
    // Về danh sách chứ không vào trang chi tiết: trang chi tiết đọc từ backend, còn dự án tạo ở
    // bản demo chỉ có trong demo ledger nên mở chi tiết sẽ ra 404
    choices: [{ label: "Xem dự án đang tuyển", href: "/projects" }],
    reason: `Kỹ năng dự án yêu cầu (${project.skills.join(", ")}) so với kỹ năng trong hồ sơ của bạn (${s.skills.join(", ") || "chưa có"}).`
  };
};

/** Thứ tự trong mảng là thứ tự ưu tiên giữa các quy tắc cùng bậc. */
const RULES: Rule[] = [intro, welcomeBack, changesRequested, deadlineSoon, acceptedStart, shortlisted, projectCompleted, cvMissing, rejectionCoach, longWait, skillsFew, matchSuggestion];

/** Mọi điều Gen muốn nói với sinh viên lúc này, việc quan trọng nhất đứng đầu. */
export function buildStudentInsights(ctx: InsightContext): Insight[] {
  const s = scope(ctx);
  if (s.user?.role !== "CONTRIBUTOR") return [];
  return RULES.map((rule) => rule(s))
    .filter((insight): insight is Insight => insight !== null)
    .map((insight, order) => ({ insight, order }))
    .sort((a, b) => INSIGHT_TIERS.indexOf(a.insight.tier) - INSIGHT_TIERS.indexOf(b.insight.tier) || a.order - b.order)
    .map(({ insight }) => insight);
}

