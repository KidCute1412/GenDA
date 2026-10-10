import { LEVEL_COPY } from "../projects/level-copy";
import type { ContributorTier, Experience, ProjectLevel } from "./services/contributor-api";

/**
 * Chữ hiển thị cho hạng contributor. Ngưỡng XP, trọng số và trần XP Cơ bản luôn lấy từ `Experience` do
 * backend trả về; file này chỉ biết tên gọi, không biết con số.
 */
export const TIER_COPY: Record<ContributorTier, { label: string; rank: number }> = {
  BRONZE: { label: "Đồng", rank: 1 },
  SILVER: { label: "Bạc", rank: 2 },
  GOLD: { label: "Vàng", rank: 3 }
};

export const TIER_ORDER: ContributorTier[] = ["BRONZE", "SILVER", "GOLD"];

/** Tên hạng cho tiêu đề và huy hiệu. */
export function tierLabel(tier: ContributorTier) {
  return `Hạng ${TIER_COPY[tier].label}`;
}

/** Tên hạng giữa câu. */
function tierName(tier: ContributorTier) {
  return `hạng ${TIER_COPY[tier].label}`;
}

/** Tiến độ trong hạng hiện tại: từ ngưỡng của hạng này tới ngưỡng của hạng kế tiếp. */
export function tierProgress(experience: Experience) {
  if (experience.nextTierMinimumXp == null) return { filled: 1, span: 1, percent: 100 };
  const span = experience.nextTierMinimumXp - experience.tierMinimumXp;
  const filled = Math.min(span, Math.max(0, experience.totalXp - experience.tierMinimumXp));
  return { filled, span, percent: Math.round((filled / span) * 100) };
}

/** "7/10 XP · còn 3 XP để lên Bạc", hoặc tổng XP khi đã ở hạng cao nhất. */
export function progressLine(experience: Experience) {
  if (experience.nextTier == null || experience.nextTierMinimumXp == null) {
    return `${experience.totalXp} XP · hạng cao nhất`;
  }
  return `${experience.totalXp}/${experience.nextTierMinimumXp} XP · còn ${experience.xpToNextTier} XP để lên ${TIER_COPY[experience.nextTier].label}`;
}

function xpPerProject(experience: Experience, level: ProjectLevel) {
  return experience.levels.find((item) => item.level === level)?.xpPerProject ?? 1;
}

/** Việc cụ thể nên làm tiếp để lên hạng, tính từ policy của backend. */
export function nextStepHint(experience: Experience) {
  if (experience.nextTier == null) return "Bạn đã ở hạng cao nhất. Mọi mức dự án đều mở cho bạn.";
  const basicRoom = experience.basicXpCap - experience.basicXpCounted;
  if (basicRoom >= experience.xpToNextTier) {
    const count = Math.ceil(experience.xpToNextTier / xpPerProject(experience, "BASIC"));
    return `Hoàn thành thêm ${count} dự án Cơ bản để lên ${tierName(experience.nextTier)}.`;
  }
  const mediumXp = xpPerProject(experience, "MEDIUM");
  const count = Math.ceil(experience.xpToNextTier / mediumXp);
  const capNote = basicRoom <= 0 ? " Dự án Cơ bản không cộng thêm XP vì bạn đã đạt trần XP Cơ bản." : "";
  return `Hoàn thành thêm ${count} dự án Trung bình (mỗi dự án +${mediumXp} XP) để lên ${tierName(experience.nextTier)}.${capNote}`;
}

/** Contributor có được tự ứng tuyển mức này không, và nếu chưa thì câu giải thích chính xác. */
export function levelGate(experience: Experience, level: ProjectLevel) {
  const rule = experience.levels.find((item) => item.level === level);
  const requiredTier = rule?.requiredTier ?? "BRONZE";
  if (!rule || rule.unlocked) return { unlocked: true as const, requiredTier, missingXp: 0, message: null };
  const threshold = experience.tiers.find((tier) => tier.tier === requiredTier)?.minimumXp ?? 0;
  const missingXp = Math.max(0, threshold - experience.totalXp);
  const current = TIER_COPY[experience.tier].label;
  const message = `Dự án ${LEVEL_COPY[level].label} cần ${tierName(requiredTier)}. Bạn đang ở hạng ${current} (${experience.totalXp}/${threshold} XP), còn ${missingXp} XP nữa.`;
  return { unlocked: false as const, requiredTier, missingXp, message };
}
