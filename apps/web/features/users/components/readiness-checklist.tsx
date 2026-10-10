import Link from "next/link";
import { CheckCircle, CircleDashed, ICON_WEIGHT } from "../../../components/ui/icons";
import type { ApplicationReadiness } from "../services/contributor-api";

type Item = { key: keyof Omit<ApplicationReadiness, "ready">; label: string; fix: string; href: string };

const ITEMS: Item[] = [
  { key: "accountActive", label: "Tài khoản đang hoạt động", fix: "Đăng nhập lại", href: "/login" },
  { key: "profileComplete", label: "Hồ sơ có nền tảng, chuyên môn và kỹ năng", fix: "Điền hồ sơ", href: "/student/profile#profile-form" },
  { key: "cvReady", label: "CV PDF đã qua kiểm tra kỹ thuật", fix: "Nộp CV", href: "/student/profile#cv" }
];

/**
 * Checklist sẵn sàng ứng tuyển (design.md 7.2): bốn dòng, mỗi dòng có icon, nhãn và liên kết gỡ chặn.
 * Danh sách chỉ để contributor tự kiểm tra; backend kiểm tra lại khi gửi đơn.
 */
export function ReadinessChecklist({ readiness, missingOnly = false }: { readiness: ApplicationReadiness; missingOnly?: boolean }) {
  const done = ITEMS.filter((item) => readiness[item.key]).length;
  const items = missingOnly ? ITEMS.filter((item) => !readiness[item.key]) : ITEMS;

  return (
    <div className="quest">
      <div className="quest__header">
        <span className="quest__title">Sẵn sàng ứng tuyển</span>
        <span className="quest__count num">{done}/{ITEMS.length}</span>
      </div>
      <div className="quest__bar" aria-hidden="true">
        {ITEMS.map((item) => <span key={item.key} data-done={readiness[item.key] ? "true" : undefined} />)}
      </div>
      <ul className="quest__list">
        {items.map((item) => {
          const ok = readiness[item.key];
          const Icon = ok ? CheckCircle : CircleDashed;
          return (
            <li key={item.key} className="quest__item" data-done={ok ? "true" : "false"}>
              <Icon weight={ICON_WEIGHT} aria-hidden="true" className="quest__icon" />
              <span className="quest__label">
                {item.label}
                <span className="visually-hidden">{ok ? ": đã xong" : ": còn thiếu"}</span>
              </span>
              {ok ? <span className="quest__status">Xong</span> : <Link href={item.href} className="quest__fix">{item.fix}</Link>}
            </li>
          );
        })}
      </ul>
      {readiness.ready ? (
        <p className="quest__note">Bạn đủ điều kiện chung để gửi đơn. Mức dự án mở theo hạng của bạn.</p>
      ) : (
        <p className="quest__note">Bạn vẫn xem được mọi dự án. Hoàn tất các dòng còn thiếu để gửi được đơn.</p>
      )}
    </div>
  );
}
