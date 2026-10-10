/**
 * Nền hero (Neo-Industrial Ledger), nằm dưới mọi nội dung, chỉ để trang trí nên
 * ẩn khỏi trình đọc màn hình và không nhận chuột:
 * - làn sáng quét chéo qua lưới ô 96px;
 * - thước đo dọc ở hai lề (chỉ hiện từ 1280px, khi lề đủ rộng), có con trượt;
 * - bốn dấu góc đóng khung vùng nội dung, nằm trong khoảng đệm của hero.
 */
const RULER_MARKS = Array.from({ length: 16 }, (_, index) => index * 64);

function Ruler({ side }: { side: "left" | "right" }) {
  return (
    <div className={`hero-ruler hero-ruler--${side}`}>
      {RULER_MARKS.map((mark) => (
        <span key={mark} className="hero-ruler__num" style={{ top: mark }}>
          {String(mark).padStart(3, "0")}
        </span>
      ))}
      <span className="hero-ruler__cursor" />
    </div>
  );
}

export function HeroPattern() {
  return (
    <div className="hero-pattern" aria-hidden="true">
      <div className="hero-backdrop__glow" />
      <Ruler side="left" />
      <Ruler side="right" />
      <div className="container hero-frame">
        <span className="hero-frame__corner hero-frame__corner--tl" />
        <span className="hero-frame__corner hero-frame__corner--tr" />
        <span className="hero-frame__corner hero-frame__corner--bl" />
        <span className="hero-frame__corner hero-frame__corner--br" />
      </div>
    </div>
  );
}
