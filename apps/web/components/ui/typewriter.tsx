import type { CSSProperties } from "react";

/**
 * Hiệu ứng gõ chữ thuần CSS: mỗi ký tự có `animation-delay` riêng nên không cần
 * JS ở client, HTML từ server vẫn đủ chữ (đọc được khi tắt JS) và bố cục không
 * nhảy vì ký tự chưa gõ chỉ ẩn bằng `visibility`, vẫn chiếm chỗ.
 */
export type TypewriterPart = {
  text: string;
  className?: string;
  /** Xuống dòng sau đoạn này. */
  breakAfter?: boolean;
};

const STEP_MS = 90;
const START_MS = 300;

export function Typewriter({ parts }: { parts: TypewriterPart[] }) {
  const label = parts.map((part) => part.text).join("").replace(/\s+/g, " ").trim();
  let index = 0;

  const nodes = parts.map((part, partIndex) => {
    const words = part.text.split(/(\s+)/).map((token, tokenIndex) => {
      if (/^\s+$/.test(token)) return token;
      const chars = Array.from(token).map((char, charIndex) => {
        const style = { "--tw-delay": `${START_MS + (index + charIndex) * STEP_MS}ms` } as CSSProperties;
        return <span key={charIndex} className="typewriter__char" style={style}>{char}</span>;
      });
      index += chars.length;
      return <span key={tokenIndex} className="typewriter__word">{chars}</span>;
    });

    return (
      <span key={partIndex}>
        {part.className ? <span className={part.className}>{words}</span> : words}
        {part.breakAfter ? <br /> : null}
      </span>
    );
  });

  const caretStyle = { "--tw-delay": `${START_MS + index * STEP_MS}ms` } as CSSProperties;

  return (
    <>
      <span className="visually-hidden">{label}</span>
      <span aria-hidden="true">
        {nodes}
        <span className="typewriter__caret" style={caretStyle} />
      </span>
    </>
  );
}
