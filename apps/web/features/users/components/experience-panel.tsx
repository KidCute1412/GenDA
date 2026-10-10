import { CheckCircle, ICON_WEIGHT, Lock, LockOpen } from "../../../components/ui/icons";
import { formatDate } from "../../../lib/utils/format";
import { LEVEL_COPY } from "../../projects/level-copy";
import { nextStepHint, tierLabel } from "../tier-copy";
import type { Experience } from "../services/contributor-api";
import { TierInsignia } from "./tier-insignia";
import { XpMeter } from "./xp-meter";

/**
 * Khối hạng ở đầu trang hồ sơ (FR-APP-12): phù hiệu, tổng XP, thanh kinh nghiệm, ba khoang mức dự án đã mở
 * hoặc còn khóa, và việc nên làm tiếp. Mọi con số đến từ backend.
 */
export function ExperiencePanel({ experience, name }: { experience: Experience; name: string }) {
  const tone = experience.tier.toLowerCase();
  const capReached = experience.basicXpCounted >= experience.basicXpCap;

  return (
    <section className={`xp-card xp-card--${tone}`} aria-labelledby="xp-card-title">
      <div className="xp-card__identity">
        <div className="xp-card__plate">
          <TierInsignia tier={experience.tier} size={88} />
        </div>
        <div className="xp-card__headline">
          <p className="xp-card__name">{name}</p>
          <h2 id="xp-card-title" className="xp-card__tier">{tierLabel(experience.tier)}</h2>
          <p className="xp-card__total num">
            <span className="xp-card__xp">{experience.totalXp}</span>
            <span className="xp-card__unit">XP</span>
          </p>
        </div>
      </div>

      <div className="xp-card__progress">
        <XpMeter experience={experience} />
        <p className="xp-card__hint">{nextStepHint(experience)}</p>
        <p className="xp-card__cap num" data-reached={capReached ? "true" : undefined}>
          XP từ dự án Cơ bản: {experience.basicXpCounted}/{experience.basicXpCap}
          {capReached ? " · đã chạm trần" : null}
        </p>
      </div>

      <ol className="unlock-ladder" aria-label="Mức dự án bạn tự ứng tuyển được">
        {experience.levels.map((level) => {
          const Icon = level.unlocked ? LockOpen : Lock;
          return (
            <li key={level.level} className="unlock-slot" data-unlocked={level.unlocked ? "true" : "false"}>
              <span className="unlock-slot__state">
                <Icon weight={ICON_WEIGHT} aria-hidden="true" />
                {level.unlocked ? "Đã mở" : `Cần ${tierLabel(level.requiredTier).toLowerCase()}`}
              </span>
              <span className="unlock-slot__level">{LEVEL_COPY[level.level].label}</span>
              <span className="unlock-slot__meta num">+{level.xpPerProject} XP mỗi dự án</span>
              <span className="unlock-slot__meta num">Đã hoàn thành {level.completedProjects}</span>
            </li>
          );
        })}
      </ol>

      <p className="xp-card__disclaimer text-caption">
        Hạng tính từ các dự án bạn đã hoàn thành trên GenDA, không phải xác minh kỹ năng.
      </p>
    </section>
  );
}

const HISTORY_PREVIEW = 5;

/** Nhật ký XP: mỗi dự án đã nghiệm thu và số XP nó mang lại, mới nhất trước. */
export function ExperienceHistory({ experience }: { experience: Experience }) {
  const [shown, rest] = [experience.history.slice(0, HISTORY_PREVIEW), experience.history.slice(HISTORY_PREVIEW)];
  if (experience.history.length === 0) {
    return (
      <p className="text-muted" style={{ margin: 0 }}>
        Chưa có dự án hoàn thành. Dự án Cơ bản đầu tiên bạn hoàn thành sẽ cộng +1 XP.
      </p>
    );
  }
  return (
    <div className="stack stack--sm">
      <ul className="xp-log">{shown.map((entry, index) => <HistoryRow key={index} entry={entry} />)}</ul>
      {rest.length > 0 ? (
        <details className="xp-log__more">
          <summary>Xem thêm {rest.length} dự án</summary>
          <ul className="xp-log">{rest.map((entry, index) => <HistoryRow key={index} entry={entry} />)}</ul>
        </details>
      ) : null}
    </div>
  );
}

function HistoryRow({ entry }: { entry: Experience["history"][number] }) {
  return (
    <li className="xp-log__row">
      <span className="xp-log__gain num" data-capped={entry.capped ? "true" : undefined}>
        +{entry.xpAwarded} XP
      </span>
      <span className="xp-log__body">
        <strong className="xp-log__title">{entry.projectTitle}</strong>
        <span className="text-caption">
          {LEVEL_COPY[entry.level].label} · {entry.smeName} · {formatDate(entry.completedAt.slice(0, 10))}
          {entry.capped ? " · đã chạm trần XP Cơ bản" : null}
        </span>
      </span>
      <CheckCircle weight={ICON_WEIGHT} aria-hidden="true" className="xp-log__done" />
    </li>
  );
}

