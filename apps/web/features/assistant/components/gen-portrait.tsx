"use client";

import { useEffect, useId, useState, type SVGProps } from "react";
import type { GenExpression } from "../types";

/**
 * Gen: nhân vật trợ lý, tài sản nhận diện vẽ riêng cho GenDA (ngoại lệ được phép tự vẽ SVG,
 * docs/design.md 4.10 và DD-11). Phong cách anime phẳng, viền mực đậm như viền cơ khí 2px
 * của DD-10; điểm nhấn cam Safety Orange ở kẹp tóc hai vạch "//", tai nghe, dây hoodie và thẻ tên.
 *
 * Bảng màu dưới đây là màu của hình minh họa, cố ý KHÔNG đổi theo chế độ tối: nhân vật có viền
 * mực riêng nên đứng được trên cả nền sáng lẫn nền tối, giống một con dấu in.
 */
const C = {
  ink: "#18181B", skin: "#FDE8DA", skinShade: "#F4C7B0", hair: "#2E2438", hairShade: "#1E1726", hairShine: "#5A4A6E",
  orange: "#F97316", orangeDeep: "#C2410C", irisDark: "#7C2D12", irisLight: "#FDBA74", pupil: "#1C0F08",
  grey: "#3F3F46", hoodie: "#E4E4E7", hoodieLight: "#F4F4F5", seam: "#A1A1AA", mouth: "#8F2D23", tongue: "#EF7B6E",
  blush: "#F9A8A0", blushLine: "#E0675C", sweat: "#BAE6FD"
};

const ink = (width = 3): SVGProps<SVGPathElement> => ({ stroke: C.ink, strokeWidth: width, strokeLinejoin: "round", strokeLinecap: "round" });

const FACE = "M128 164 C128 112 272 112 272 164 L271 200 C268 230 244 256 216 267 Q200 273 184 267 C156 256 132 230 129 200 Z";
const BACK_HAIR = "M204 66 C140 66 94 110 96 180 C96 236 100 278 116 304 Q128 296 136 308 Q146 298 158 306 L160 330 L240 330 L242 306 Q254 298 264 308 Q272 296 284 304 C300 278 304 236 304 180 C306 110 268 66 204 66 Z";
/** Mái vuốt chéo sang trái: năm lọn, đầu lọn nghiêng về bên trái người xem. */
const BANGS = (() => {
  const strands: Array<[[number, number], [number, number]]> = [[[266, 148], [252, 180]], [[244, 134], [216, 178]], [[216, 144], [186, 174]], [[188, 140], [158, 178]], [[156, 148], [134, 198]]];
  let d = "M104 292 C96 246 95 200 103 156 C111 102 152 68 204 68 C258 68 299 104 299 158 C301 204 300 250 296 292 Q290 282 288 272 Q286 282 280 288 C278 256 276 222 272 196 C270 180 268 164 266 148 ";
  strands.forEach(([notch, tip], index) => {
    const next = strands[index + 1]?.[0] ?? [129, 204];
    d += `C${notch[0] - 3} ${notch[1] + 20} ${tip[0] + 14} ${tip[1] - 4} ${tip[0]} ${tip[1]} `;
    d += `C${tip[0] + 3} ${tip[1] - 14} ${next[0] + 7} ${next[1] + 14} ${next[0]} ${next[1]} `;
  });
  return `${d}C126 234 124 262 122 286 Q116 276 112 270 Q110 282 104 292 Z`;
})();
const SHINE = "M124 124 C144 92 174 82 204 82 C236 82 262 92 280 120 C272 114 264 112 258 116 C250 106 240 104 232 110 C222 101 210 101 202 108 C192 101 180 102 172 110 C162 106 152 108 146 116 C138 113 130 116 124 124 Z";
const eyeShape = (cx: number) => `M${cx - 21} 201 C${cx - 19} 189 ${cx - 7} 184 ${cx + 3} 185 C${cx + 12} 186 ${cx + 19} 191 ${cx + 21} 198 C${cx + 21} 213 ${cx + 15} 225 ${cx + 1} 227 C${cx - 13} 227 ${cx - 20} 215 ${cx - 21} 201 Z`;

type Mouth = "smile" | "grin" | "talk" | "flat" | "wavy" | "o";
type Pose = { eyes: "open" | "closed" | "wink"; look: [number, number]; brows: keyof typeof BROWS; mouth: Mouth; blush?: boolean; sparkle?: boolean; sweat?: boolean };

const BROWS = {
  soft: "M146 172 Q163 165 182 170 M218 170 Q237 165 254 172",
  worried: "M146 171 Q164 170 182 162 M218 162 Q236 170 254 171",
  raised: "M146 165 Q163 157 182 163 M218 172 Q237 169 254 174",
  up: "M146 166 Q163 157 182 163 M218 163 Q237 157 254 166"
};

const POSES: Record<GenExpression, Pose> = {
  neutral: { eyes: "open", look: [0, 0], brows: "soft", mouth: "smile" },
  happy: { eyes: "closed", look: [0, 0], brows: "up", mouth: "grin", blush: true },
  thinking: { eyes: "open", look: [6, -5], brows: "raised", mouth: "flat" },
  concerned: { eyes: "open", look: [0, 2], brows: "worried", mouth: "wavy", sweat: true },
  surprised: { eyes: "open", look: [0, 0], brows: "up", mouth: "o", sparkle: true },
  wink: { eyes: "wink", look: [0, 0], brows: "soft", mouth: "grin", blush: true }
};

function MouthShape({ mouth }: { mouth: Mouth }) {
  switch (mouth) {
    case "grin":
      return (
        <>
          <path d="M186 248 Q200 250 214 248 Q212 264 200 265 Q188 264 186 248 Z" fill={C.mouth} {...ink(2.2)} />
          <path d="M191 259 Q200 254 209 259 Q206 264 200 264 Q194 264 191 259 Z" fill={C.tongue} />
        </>
      );
    case "talk":
      return <path d="M192 249 Q200 247 208 249 Q207 258 200 259 Q193 258 192 249 Z" fill={C.mouth} {...ink(2.2)} />;
    case "flat":
      return <path d="M195 253 Q202 251 209 252" fill="none" {...ink(2.4)} />;
    case "wavy":
      return <path d="M190 254 Q195 249 200 252 Q205 255 210 250" fill="none" {...ink(2.4)} />;
    case "o":
      return <ellipse cx="200" cy="253" rx="5.5" ry="6.5" fill={C.mouth} stroke={C.ink} strokeWidth={2.2} />;
    default:
      return <path d="M189 250 Q200 257 211 250" fill="none" {...ink(2.4)} />;
  }
}

/** Mắt vẽ cho mắt bên trái người xem; mắt còn lại lật gương quanh tâm của nó. */
function OpenEye({ cx, mirror, look, clipId }: { cx: number; mirror?: boolean; look: [number, number]; clipId: string }) {
  const ix = cx + 1 + (mirror ? -look[0] : look[0]);
  const iy = look[1];
  return (
    <g transform={mirror ? `translate(${2 * cx} 0) scale(-1 1)` : undefined}>
      <clipPath id={clipId}><path d={eyeShape(cx)} /></clipPath>
      <path d={eyeShape(cx)} fill="#FFFFFF" />
      <g clipPath={`url(#${clipId})`}>
        <ellipse cx={ix} cy={207 + iy} rx="13.5" ry="17" fill={C.orangeDeep} />
        <ellipse cx={ix} cy={214 + iy} rx="10" ry="8" fill={C.irisLight} opacity=".85" />
        <ellipse cx={ix} cy={199 + iy} rx="14" ry="9" fill={C.irisDark} />
        <ellipse cx={ix} cy={208 + iy} rx="6" ry="8" fill={C.pupil} />
        <path d={`M${cx - 22} 186 L${cx + 22} 186 L${cx + 22} 197 Q${cx} 189 ${cx - 22} 199 Z`} fill="#000" opacity=".12" />
      </g>
      <path d={`M${cx - 25} 200 C${cx - 21} 186 ${cx - 7} 179 ${cx + 4} 180 C${cx + 15} 181 ${cx + 22} 188 ${cx + 25} 196 L${cx + 21} 197 C${cx + 17} 191 ${cx + 11} 187 ${cx + 3} 187 C${cx - 7} 187 ${cx - 16} 192 ${cx - 21} 203 Z`} fill={C.ink} />
      <path d={`M${cx - 25} 200 L${cx - 31} 205 L${cx - 22} 204 Z`} fill={C.ink} />
      <path d={`M${cx - 10} 227 Q${cx + 2} 230 ${cx + 13} 225`} fill="none" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" opacity=".7" />
    </g>
  );
}

const Highlight = ({ x, y }: { x: number; y: number }) => (
  <>
    <circle cx={x} cy={y} r="4.6" fill="#FFFFFF" />
    <circle cx={x + 9} cy={y + 16} r="2" fill="#FFFFFF" />
  </>
);

const Sparkle = ({ x, y, scale }: { x: number; y: number; scale: number }) => (
  <path transform={`translate(${x} ${y}) scale(${scale})`} d="M0 -10 L2.5 -2.5 L10 0 L2.5 2.5 L0 10 L-2.5 2.5 L-10 0 L-2.5 -2.5 Z" fill={C.orange} {...ink(1.5)} />
);

const VIEW_BOX = { bust: "60 22 280 458", face: "96 60 208 208" } as const;

export type GenPortraitProps = {
  expression?: GenExpression;
  /** Đang nói: khẩu hình đóng mở theo nhịp chữ chạy. */
  talking?: boolean;
  /** Đổi giá trị thì Gen chớp mắt một lần (mỗi câu thoại mới). */
  blinkKey?: string | number;
  framing?: keyof typeof VIEW_BOX;
  className?: string;
};

export function GenPortrait({ expression = "neutral", talking = false, blinkKey, framing = "bust", className }: GenPortraitProps) {
  const uid = useId().replace(/:/g, "");
  const pose = POSES[expression];
  const [mouthOpen, setMouthOpen] = useState(false);

  // Khẩu hình chỉ chạy khi chữ đang chạy, dừng ngay khi câu thoại hiện đủ (design.md 4.12d)
  useEffect(() => {
    if (!talking) { setMouthOpen(false); return; }
    const timer = window.setInterval(() => setMouthOpen((open) => !open), 120);
    return () => window.clearInterval(timer);
  }, [talking]);

  const mouth: Mouth = talking && mouthOpen ? (pose.mouth === "grin" ? "smile" : "talk") : pose.mouth;
  const [lx, ly] = pose.look;

  return (
    <svg viewBox={VIEW_BOX[framing]} className={className} aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
      {/* Tóc sau và thân */}
      <path d={BACK_HAIR} fill={C.hairShade} {...ink()} />
      <path d="M68 480 C72 400 112 346 172 322 Q200 334 228 322 C288 346 328 400 332 480 Z" fill={C.hoodie} {...ink()} />
      <path d="M112 480 L118 430 M288 480 L282 430" stroke={C.seam} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M138 338 C140 300 260 300 262 338 C250 356 226 356 212 346 L188 346 C174 356 150 356 138 338 Z" fill={C.hoodieLight} {...ink()} />
      <path d="M168 330 Q200 348 232 330" fill="none" stroke={C.seam} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M190 344 C188 368 186 384 184 400 M210 344 C212 368 214 384 216 400" fill="none" {...ink(2.4)} />
      <rect x="180" y="398" width="8" height="14" rx="1" fill={C.orange} stroke={C.ink} strokeWidth={2} />
      <rect x="212" y="398" width="8" height="14" rx="1" fill={C.orange} stroke={C.ink} strokeWidth={2} />
      <g transform="rotate(-6 272 436)">
        <rect x="248" y="408" width="48" height="56" fill="#FAFAFA" stroke={C.ink} strokeWidth={3} />
        <rect x="248" y="408" width="48" height="13" fill={C.orange} stroke={C.ink} strokeWidth={3} />
        <text x="272" y="443" textAnchor="middle" fontFamily="ui-monospace, Consolas, monospace" fontSize="12" fontWeight="700" fill={C.ink}>GEN</text>
        <text x="272" y="456" textAnchor="middle" fontFamily="ui-monospace, Consolas, monospace" fontSize="8" fill={C.ink}>{"// 01"}</text>
      </g>

      {/* Quai tai nghe vòng sau gáy, vẽ trước cổ để cổ che đầu quai */}
      <path d="M160 306 C166 290 180 284 188 286 M240 306 C234 290 220 284 212 286" fill="none" stroke={C.grey} strokeWidth={6} strokeLinecap="round" />
      <path d="M184 250 L184 312 Q200 320 216 312 L216 250 Z" fill={C.skin} {...ink()} />
      <path d="M185 262 Q200 284 215 262 L215 276 Q200 294 185 276 Z" fill={C.skinShade} />
      <g transform="rotate(28 156 320)">
        <ellipse cx="156" cy="320" rx="14" ry="19" fill={C.orange} stroke={C.ink} strokeWidth={3} />
        <ellipse cx="156" cy="320" rx="7.5" ry="11" fill={C.grey} stroke={C.ink} strokeWidth={2} />
      </g>
      <g transform="rotate(-28 244 320)">
        <ellipse cx="244" cy="320" rx="14" ry="19" fill={C.orange} stroke={C.ink} strokeWidth={3} />
        <ellipse cx="244" cy="320" rx="7.5" ry="11" fill={C.grey} stroke={C.ink} strokeWidth={2} />
      </g>

      {/* Mặt, bóng mái tóc đổ lên trán */}
      <path d={FACE} fill={C.skin} {...ink()} />
      <clipPath id={`${uid}-face`}><path d={FACE} /></clipPath>
      <g clipPath={`url(#${uid}-face)`}><path d={BANGS} transform="translate(2 7)" fill={C.skinShade} /></g>

      {pose.blush ? (
        <g>
          <ellipse cx="146" cy="234" rx="14" ry="6" fill={C.blush} opacity=".55" />
          <ellipse cx="254" cy="234" rx="14" ry="6" fill={C.blush} opacity=".55" />
          <path d="M140 237 L144 231 M146 237 L150 231 M152 237 L156 231 M244 237 L248 231 M250 237 L254 231 M256 237 L260 231" stroke={C.blushLine} strokeWidth={1.4} strokeLinecap="round" opacity=".7" />
        </g>
      ) : null}

      <g key={blinkKey} className="gen-portrait__eyes">
        {pose.eyes === "closed" ? (
          <>
            <path d="M145 210 Q164 193 185 208" fill="none" {...ink(4)} />
            <path d="M215 208 Q236 193 255 210" fill="none" {...ink(4)} />
          </>
        ) : (
          <>
            <OpenEye cx={164} look={pose.look} clipId={`${uid}-eye-l`} />
            <Highlight x={159 + lx} y={199 + ly} />
            {pose.eyes === "wink" ? (
              <path d="M215 208 Q236 193 255 210" fill="none" {...ink(4)} />
            ) : (
              <>
                <OpenEye cx={236} mirror look={pose.look} clipId={`${uid}-eye-r`} />
                <Highlight x={231 + lx} y={199 + ly} />
              </>
            )}
          </>
        )}
      </g>

      <path d="M200 234 L198 240 L202 240" fill="none" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" opacity=".6" />
      <MouthShape mouth={mouth} />

      {/* Tóc trước: sợi tóc dựng, mái, vệt bóng, kẹp tóc hai vạch "//" */}
      <path d="M194 74 C184 44 210 26 234 40 C214 40 204 54 216 72 Z" fill={C.hair} {...ink()} />
      <path d={BANGS} fill={C.hair} {...ink()} />
      <path d={SHINE} fill={C.hairShine} />
      <path d="M232 104 C224 124 214 146 202 160 M196 100 C186 124 176 142 166 156 M262 122 C258 140 256 154 252 166 M150 120 C142 146 136 168 130 186" fill="none" stroke={C.hairShade} strokeWidth={2.2} strokeLinecap="round" />
      <path d="M252 110 L244 136 M266 116 L258 142" stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
      <path d="M252 110 L244 136 M266 116 L258 142" stroke={C.orange} strokeWidth={5} strokeLinecap="round" />
      <path d={BROWS[pose.brows]} fill="none" stroke={C.hair} strokeWidth={3.2} strokeLinecap="round" />

      {pose.sparkle ? (<><Sparkle x={300} y={150} scale={1.1} /><Sparkle x={318} y={184} scale={0.6} /></>) : null}
      {pose.sweat ? <path d="M286 168 Q280 180 286 186 Q292 180 286 168 Z" fill={C.sweat} {...ink(1.8)} /> : null}
    </svg>
  );
}
