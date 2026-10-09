import { TIER_COPY, tierLabel } from "../tier-copy";
import type { ContributorTier } from "../services/contributor-api";

/**
 * Phù hiệu hạng: tấm thép lục giác như biển tên linh kiện, số vạch chữ V bằng bậc hạng (1, 2, 3).
 * Hạng được mã hóa ba lớp (design.md 4.5): màu tấm, số vạch, và nhãn chữ đi kèm ở nơi dùng.
 */
export function TierInsignia({ tier, size = 64 }: { tier: ContributorTier; size?: number }) {
  const rank = TIER_COPY[tier].rank;
  const gap = 11;
  const top = 36 - ((rank - 1) * gap) / 2 - 4;
  const tone = tier.toLowerCase();
  return (
    <svg
      className={`tier-insignia tier-insignia--${tone}`}
      width={size}
      height={(size * 72) / 64}
      viewBox="0 0 64 72"
      aria-hidden="true"
      focusable="false"
    >
      <polygon className="tier-insignia__plate" points="32,2 62,19 62,53 32,70 2,53 2,19" />
      <polygon className="tier-insignia__rim" points="32,8 56.5,22 56.5,50 32,64 7.5,50 7.5,22" />
      {Array.from({ length: rank }, (_, index) => (
        <path
          key={index}
          className="tier-insignia__chevron"
          d={`M18 ${top + index * gap + 8} L32 ${top + index * gap} L46 ${top + index * gap + 8}`}
        />
      ))}
      <circle className="tier-insignia__rivet" cx="32" cy="13" r="1.6" />
      <circle className="tier-insignia__rivet" cx="32" cy="59" r="1.6" />
    </svg>
  );
}

/** Huy hiệu hạng dạng nhãn: phù hiệu nhỏ + "HẠNG BẠC". */
export function TierBadge({ tier }: { tier: ContributorTier }) {
  return (
    <span className={`tier-badge tier-badge--${tier.toLowerCase()}`}>
      <TierInsignia tier={tier} size={16} />
      {tierLabel(tier)}
    </span>
  );
}
