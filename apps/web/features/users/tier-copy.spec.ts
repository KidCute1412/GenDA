import { describe, expect, it } from "vitest";
import type { Experience } from "./services/contributor-api";
import { levelGate, nextStepHint, progressLine, tierProgress } from "./tier-copy";

/** Cùng hình dạng với phản hồi /users/me/experience theo policy chuẩn (0 / 10 / 30 XP, trần Cơ bản 10). */
function experience(totalXp: number, basicXpCounted = Math.min(totalXp, 10)): Experience {
  const tier = totalXp >= 30 ? "GOLD" : totalXp >= 10 ? "SILVER" : "BRONZE";
  const next = tier === "BRONZE" ? { nextTier: "SILVER" as const, nextTierMinimumXp: 10 } : tier === "SILVER" ? { nextTier: "GOLD" as const, nextTierMinimumXp: 30 } : { nextTier: undefined, nextTierMinimumXp: undefined };
  const tierMinimumXp = { BRONZE: 0, SILVER: 10, GOLD: 30 }[tier];
  return {
    totalXp,
    tier,
    tierMinimumXp,
    ...next,
    xpToNextTier: next.nextTierMinimumXp ? next.nextTierMinimumXp - totalXp : 0,
    basicXpCounted,
    basicXpCap: 10,
    tiers: [
      { tier: "BRONZE", minimumXp: 0, selfApplyLevels: ["BASIC"] },
      { tier: "SILVER", minimumXp: 10, selfApplyLevels: ["BASIC", "MEDIUM"] },
      { tier: "GOLD", minimumXp: 30, selfApplyLevels: ["BASIC", "MEDIUM", "HIGH"] }
    ],
    levels: [
      { level: "BASIC", xpPerProject: 1, requiredTier: "BRONZE", unlocked: true, completedProjects: basicXpCounted },
      { level: "MEDIUM", xpPerProject: 2, requiredTier: "SILVER", unlocked: tier !== "BRONZE", completedProjects: 0 },
      { level: "HIGH", xpPerProject: 3, requiredTier: "GOLD", unlocked: tier === "GOLD", completedProjects: 0 }
    ],
    history: []
  } as Experience;
}

describe("thanh kinh nghiệm", () => {
  it("đo tiến độ trong phạm vi của hạng hiện tại", () => {
    expect(tierProgress(experience(7))).toEqual({ filled: 7, span: 10, percent: 70 });
    expect(tierProgress(experience(14))).toEqual({ filled: 4, span: 20, percent: 20 });
    expect(tierProgress(experience(33))).toEqual({ filled: 1, span: 1, percent: 100 });
  });

  it("nói còn bao nhiêu XP tới hạng kế tiếp", () => {
    expect(progressLine(experience(7))).toBe("7/10 XP · còn 3 XP để lên Bạc");
    expect(progressLine(experience(33))).toBe("33 XP · hạng cao nhất");
  });

  it("gợi ý dự án Cơ bản khi còn chỗ trong trần, dự án Trung bình khi đã chạm trần", () => {
    expect(nextStepHint(experience(7))).toBe("Hoàn thành thêm 3 dự án Cơ bản để lên hạng Bạc.");
    expect(nextStepHint(experience(14))).toBe(
      "Hoàn thành thêm 8 dự án Trung bình (mỗi dự án +2 XP) để lên hạng Vàng. Dự án Cơ bản không cộng thêm XP vì bạn đã đạt trần XP Cơ bản."
    );
    expect(nextStepHint(experience(33))).toContain("hạng cao nhất");
  });

  it("khóa mức chưa đủ hạng và nêu chính xác XP còn thiếu", () => {
    expect(levelGate(experience(7), "BASIC").unlocked).toBe(true);
    expect(levelGate(experience(7), "MEDIUM")).toMatchObject({
      unlocked: false,
      requiredTier: "SILVER",
      missingXp: 3,
      message: "Dự án Trung bình cần hạng Bạc. Bạn đang ở hạng Đồng (7/10 XP), còn 3 XP nữa."
    });
    expect(levelGate(experience(14), "HIGH")).toMatchObject({ unlocked: false, requiredTier: "GOLD", missingXp: 16 });
    expect(levelGate(experience(30), "HIGH").unlocked).toBe(true);
  });
});
