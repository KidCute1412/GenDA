import type { CSSProperties } from "react";
import { TIER_COPY, progressLine, tierProgress } from "../tier-copy";
import type { Experience } from "../services/contributor-api";

const MAX_SEGMENTS = 20;

/**
 * Thanh kinh nghiệm dạng dãy đèn LED của một thiết bị đo: mỗi ô là một phần của quãng XP giữa hạng hiện tại
 * và hạng kế tiếp. Các ô đã đạt sáng lần lượt một lần khi thanh xuất hiện (chuyển trạng thái, design.md 4.12),
 * chỉ animate opacity và transform; người bật giảm chuyển động thấy thanh tĩnh.
 */
export function XpMeter({ experience, compact = false }: { experience: Experience; compact?: boolean }) {
  const { filled, span } = tierProgress(experience);
  const top = experience.nextTierMinimumXp == null;
  const segments = top ? 10 : Math.min(span, MAX_SEGMENTS);
  const lit = top ? segments : Math.floor((filled / span) * segments);
  const line = progressLine(experience);
  const tone = experience.tier.toLowerCase();

  return (
    <div className={`xp-meter xp-meter--${tone}${compact ? " xp-meter--compact" : ""}`}>
      {!compact ? (
        <div className="xp-meter__scale num" aria-hidden="true">
          <span>{experience.tierMinimumXp} XP</span>
          <span>{top ? "MAX" : `${experience.nextTierMinimumXp} XP · ${TIER_COPY[experience.nextTier!].label.toUpperCase()}`}</span>
        </div>
      ) : null}
      <div
        className="xp-meter__track"
        role="meter"
        aria-label="Điểm kinh nghiệm"
        aria-valuemin={experience.tierMinimumXp}
        aria-valuemax={experience.nextTierMinimumXp ?? experience.totalXp}
        aria-valuenow={experience.totalXp}
        aria-valuetext={line}
      >
        {Array.from({ length: segments }, (_, index) => (
          <span
            key={index}
            className="xp-meter__segment"
            data-lit={index < lit ? "true" : undefined}
            style={{ "--segment": index } as CSSProperties}
          />
        ))}
      </div>
      <p className="xp-meter__line num">{line}</p>
    </div>
  );
}
