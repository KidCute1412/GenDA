"use client";

import { useEffect, useId, useState, type SVGProps } from "react";
import type { GenExpression } from "../types";

/**
 * Gen: nhân vật trợ lý, tài sản nhận diện vẽ riêng cho GenDA (ngoại lệ được phép tự vẽ SVG,
 * docs/design.md 4.10 và DD-11). Cô gái tai cáo tóc chàm (#4647AE) dài, mắt xanh lá, cardigan len kem
 * mặc ngoài sơ mi trắng thắt nơ navy, tay chống cằm. Phong cách anime phẳng, viền mực đậm như viền cơ khí 2px của DD-10. Tóc chàm là
 * màu riêng của nhân vật, cùng họ xanh với màu thương hiệu navy nhưng sáng hơn để nổi trên giao diện.
 *
 * Bảng màu dưới đây là màu của hình minh họa, cố ý KHÔNG đổi theo chế độ tối: nhân vật có viền
 * mực riêng nên đứng được trên cả nền sáng lẫn nền tối, giống một con dấu in.
 */
const C = {
  ink: "#18181B", skin: "#FFF1E8", skinShade: "#F8CDB8",
  hair: "#4647AE", hairBack: "#383994", hairShade: "#2C2D7A", hairDeep: "#1F2060", hairLight: "#8E8FD8",
  earTip: "#1B1C4F", earInner: "#FFE4E6", fluff: "#FFFFFF",
  iris: "#16A34A", irisDark: "#14532D", irisLight: "#BEF264", pupil: "#052E16",
  cardigan: "#F3EBDD", cardiganShade: "#D8CCB6", rib: "#C2B49A", shirt: "#FFFFFF", shirtShade: "#E4E4EF",
  ribbon: "#0A285A", ribbonLight: "#1E4A8F", button: "#4647AE",
  mouth: "#8F2D23", tongue: "#EF7B6E", blush: "#F9A8A0", blushLine: "#E0675C", sweat: "#BAE6FD", sparkle: "#F97316"
};

const ink = (width = 3): SVGProps<SVGPathElement> => ({ stroke: C.ink, strokeWidth: width, strokeLinejoin: "round", strokeLinecap: "round" });

const FACE = "M134 168 C134 112 266 112 266 168 L265 200 C262 232 236 258 210 266 Q200 270 190 266 C164 258 138 232 135 200 Z";
/** Bờm tóc sau lưng: dài quá vai, xòe ra hai bên với đuôi tóc nhọn. */
const BACK_HAIR = "M200 70 C126 70 92 124 94 194 C94 256 84 310 70 356 C62 384 52 410 44 440 L72 430 L60 470 L92 452 L98 480 L302 480 L308 452 L340 470 L328 430 L356 440 C348 410 338 384 330 356 C316 310 306 256 306 194 C308 124 274 70 200 70 Z";
/** Tai cáo bên trái người xem; tai phải lật gương quanh trục x = 200. */
const EAR = "M130 140 C112 104 102 66 104 28 C134 38 168 62 190 100 Z";
const EAR_INNER = "M138 126 C128 102 120 76 120 54 C140 64 160 82 176 104 Z";
const EAR_FLUFF = "M134 130 L138 114 L146 124 L150 104 L158 118 L164 98 L170 114 L180 104 L180 122 Z";
/** Mái rối rẽ giữa, một lọn dài rủ giữa hai mắt; các lọn đi từ phải sang trái người xem. */
const BANGS = (() => {
  const strands: Array<[[number, number], [number, number]]> = [
    [[262, 160], [256, 200]], [[236, 150], [222, 186]], [[210, 146], [200, 224]],
    [[186, 150], [172, 182]], [[160, 156], [146, 200]]
  ];
  let d = "M114 268 C106 224 104 180 110 148 C120 100 156 76 200 76 C244 76 280 100 290 148 C296 180 294 224 286 268 Q280 256 278 246 C276 214 272 182 266 150 ";
  strands.forEach(([notch, tip], index) => {
    const next = strands[index + 1]?.[0] ?? [126, 214];
    d += `C${notch[0] - 2} ${notch[1] + 22} ${tip[0] + 10} ${tip[1] - 8} ${tip[0]} ${tip[1]} `;
    d += `C${tip[0] + 2} ${tip[1] - 18} ${next[0] + 6} ${next[1] + 16} ${next[0]} ${next[1]} `;
  });
  return `${d}C122 234 120 252 118 262 Q118 266 114 268 Z`;
})();
/** Lọn tóc trước buông qua vai, nằm trên áo. */
const SIDE_LOCK = "M118 222 C112 262 116 300 104 340 C96 368 84 392 70 420 Q86 414 96 404 Q96 420 92 436 C112 410 124 380 130 344 C136 308 136 272 142 236 Z";
const SHINE = "M132 122 C152 96 178 88 200 88 C222 88 248 96 268 122 C256 116 248 118 242 122 C232 112 218 110 210 116 C202 108 188 108 180 116 C170 112 158 114 152 120 C144 116 138 118 132 122 Z";
const eyeShape = (cx: number) => `M${cx - 21} 201 C${cx - 19} 189 ${cx - 7} 184 ${cx + 3} 185 C${cx + 12} 186 ${cx + 19} 191 ${cx + 21} 198 C${cx + 21} 213 ${cx + 15} 225 ${cx + 1} 227 C${cx - 13} 227 ${cx - 20} 215 ${cx - 21} 201 Z`;
/** Mắt thu nhỏ quanh tâm từng mắt, không đổi khoảng cách giữa hai mắt. */
const eyeTransform = (cx: number) => `translate(${cx} 206) scale(0.9) translate(${-cx} -206)`;
const MIRROR = "translate(400 0) scale(-1 1)";

type Mouth = "smile" | "grin" | "talk" | "flat" | "wavy" | "o";
type Pose = { eyes: "open" | "closed" | "wink"; look: [number, number]; brows: keyof typeof BROWS; mouth: Mouth; blush?: boolean; sparkle?: boolean; sweat?: boolean };

const BROWS = {
  soft: "M150 172 Q166 166 184 171 M216 171 Q234 166 250 172",
  worried: "M150 171 Q167 170 184 163 M216 163 Q233 170 250 171",
  raised: "M150 166 Q166 158 184 164 M216 173 Q234 170 250 175",
  up: "M150 167 Q166 158 184 164 M216 164 Q234 158 250 167"
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
      // Cười mỉm tinh nghịch: khóe miệng hơi vểnh
      return <path d="M184 247 Q186 250 189 249 Q200 258 211 249 Q214 250 216 247" fill="none" {...ink(2.4)} />;
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
        <ellipse cx={ix} cy={207 + iy} rx="13.5" ry="17" fill={C.iris} />
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
  <path transform={`translate(${x} ${y}) scale(${scale})`} d="M0 -10 L2.5 -2.5 L10 0 L2.5 2.5 L0 10 L-2.5 2.5 L-10 0 L-2.5 -2.5 Z" fill={C.sparkle} {...ink(1.5)} />
);

/** Tai cáo: cùng màu tóc, chóp chàm sẫm, lòng hồng nhạt có túm lông trắng. */
function Ear({ clipId, mirror }: { clipId: string; mirror?: boolean }) {
  return (
    <g transform={mirror ? MIRROR : undefined}>
      <clipPath id={clipId}><path d={EAR} /></clipPath>
      <path d={EAR} fill={C.hair} />
      <g clipPath={`url(#${clipId})`}>
        <path d="M100 20 L200 20 L200 58 Q150 66 100 50 Z" fill={C.earTip} />
        <path d={EAR_INNER} fill={C.earInner} />
      </g>
      <path d={EAR} fill="none" {...ink()} />
      <path d={EAR_FLUFF} fill={C.fluff} {...ink(1.6)} />
    </g>
  );
}

const VIEW_BOX = { bust: "60 22 280 458", face: "96 56 208 208" } as const;

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
      {/* Tóc sau, tai cáo */}
      <path d={BACK_HAIR} fill={C.hairBack} {...ink()} />
      <Ear clipId={`${uid}-ear-l`} />
      <Ear clipId={`${uid}-ear-r`} mirror />

      {/* Cardigan len kem mở cổ chữ V, bên trong sơ mi trắng */}
      <path d="M64 480 C66 404 100 348 166 322 Q200 334 234 322 C300 348 334 404 336 480 Z" fill={C.cardigan} {...ink()} />
      <path d="M118 480 C122 446 128 420 138 400 M282 480 C278 446 272 420 262 400 M246 404 Q258 432 254 470" fill="none" stroke={C.cardiganShade} strokeWidth={3} strokeLinecap="round" />
      <path d="M164 324 Q200 336 236 324 L206 416 L194 416 Z" fill={C.shirt} {...ink(2.4)} />
      <path d="M200 340 L200 410" stroke={C.shirtShade} strokeWidth={2} strokeLinecap="round" />
      {/* Nẹp cardigan: hai mép chữ V gặp nhau rồi chạy thẳng xuống, cúc màu tóc */}
      <path d="M158 322 L192 416 L192 480 L208 480 L208 416 L242 322 L232 320 L200 410 L168 320 Z" fill={C.cardigan} {...ink(2.4)} />
      <path d="M172 334 L194 398 M228 334 L206 398 M200 420 L200 480" stroke={C.rib} strokeWidth={1.6} strokeLinecap="round" />
      <circle cx="200" cy="432" r="4.5" fill={C.button} stroke={C.ink} strokeWidth={2} />
      <circle cx="200" cy="462" r="4.5" fill={C.button} stroke={C.ink} strokeWidth={2} />
      <path d="M186 250 L186 318 Q200 326 214 318 L214 250 Z" fill={C.skin} {...ink()} />
      <path d="M187 262 Q200 282 213 262 L213 276 Q200 292 187 276 Z" fill={C.skinShade} />
      {/* Cổ sơ mi bẻ và nơ navy */}
      <path d="M184 308 Q200 318 216 308 L216 316 Q200 326 184 316 Z" fill={C.shirt} {...ink(2.2)} />
      <path d="M185 312 L166 336 L198 330 Z" fill={C.shirt} {...ink(2.2)} />
      <path d="M215 312 L234 336 L202 330 Z" fill={C.shirt} {...ink(2.2)} />
      {/* Nơ hơi thấp dưới cổ áo để tay chống cằm không che mất */}
      <g transform="translate(0 18) translate(200 334) scale(0.8) translate(-200 -334)">
      <path d="M197 338 L188 362 L195 359 L200 342 Z M203 338 L212 362 L205 359 L200 342 Z" fill={C.ribbon} {...ink(2)} />
      <path d="M200 334 C190 322 176 324 176 334 C176 344 190 346 200 334 Z M200 334 C210 322 224 324 224 334 C224 344 210 346 200 334 Z" fill={C.ribbon} {...ink(2.2)} />
      <path d="M182 332 Q186 330 190 333 M218 332 Q214 330 210 333" stroke={C.ribbonLight} strokeWidth={1.8} strokeLinecap="round" />
      <rect x="195" y="329" width="10" height="10" rx="3" fill={C.ribbon} stroke={C.ink} strokeWidth={2} />
      </g>

      {/* Mặt, bóng mái tóc đổ lên trán */}
      <path d={FACE} fill={C.skin} {...ink()} />
      <clipPath id={`${uid}-face`}><path d={FACE} /></clipPath>
      <g clipPath={`url(#${uid}-face)`}><path d={BANGS} transform="translate(2 7)" fill={C.skinShade} /></g>

      {/* Má hồng luôn có; biểu cảm vui thì đậm hơn */}
      <g opacity={pose.blush ? 1 : 0.6}>
        <ellipse cx="150" cy="234" rx="14" ry="6" fill={C.blush} opacity=".55" />
        <ellipse cx="250" cy="234" rx="14" ry="6" fill={C.blush} opacity=".55" />
        <path d="M144 237 L148 231 M150 237 L154 231 M156 237 L160 231 M240 237 L244 231 M246 237 L250 231 M252 237 L256 231" stroke={C.blushLine} strokeWidth={1.4} strokeLinecap="round" opacity=".7" />
      </g>

      <g key={blinkKey} className="gen-portrait__eyes">
        {pose.eyes === "closed" ? (
          <>
            <path d="M147 210 Q166 193 187 208" transform={eyeTransform(166)} fill="none" {...ink(4)} />
            <path d="M213 208 Q234 193 253 210" transform={eyeTransform(234)} fill="none" {...ink(4)} />
          </>
        ) : (
          <>
            <g transform={eyeTransform(166)}>
              <OpenEye cx={166} look={pose.look} clipId={`${uid}-eye-l`} />
              <Highlight x={161 + lx} y={199 + ly} />
            </g>
            {pose.eyes === "wink" ? (
              <path d="M213 208 Q234 193 253 210" transform={eyeTransform(234)} fill="none" {...ink(4)} />
            ) : (
              <g transform={eyeTransform(234)}>
                <OpenEye cx={234} mirror look={pose.look} clipId={`${uid}-eye-r`} />
                <Highlight x={229 + lx} y={199 + ly} />
              </g>
            )}
          </>
        )}
      </g>

      <path d="M200 234 L198 240 L202 240" fill="none" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" opacity=".6" />
      <MouthShape mouth={mouth} />

      <path d={BROWS[pose.brows]} fill="none" stroke={C.hairDeep} strokeWidth={3.2} strokeLinecap="round" />

      {/* Tóc trước: lọn buông qua vai, mái rối, vệt bóng, sợi tóc dựng */}
      <path d={SIDE_LOCK} fill={C.hair} {...ink()} />
      <path d={SIDE_LOCK} transform={MIRROR} fill={C.hair} {...ink()} />
      <path d={BANGS} fill={C.hair} {...ink()} />
      <path d={SHINE} fill={C.hairLight} opacity=".75" />
      <path d="M228 106 C224 126 220 146 214 166 M204 104 C204 130 203 156 201 190 M172 112 C168 130 166 146 162 160" fill="none" stroke={C.hairShade} strokeWidth={2} strokeLinecap="round" />
      <path d="M126 290 C124 330 114 370 98 404 M274 290 C276 330 286 370 302 404" fill="none" stroke={C.hairShade} strokeWidth={2} strokeLinecap="round" />
      <path d="M196 80 C192 62 202 50 216 54 C206 58 202 66 206 78 Z" fill={C.hair} {...ink(2.4)} />

      {/* Tay chống cằm: tay áo cardigan, nắm tay chạm cằm */}
      <g transform="translate(-2 8)">
      <path d="M94 480 C102 420 118 362 134 314 L188 322 C178 372 168 428 162 480 Z" fill={C.cardigan} {...ink()} />
      <path d="M128 452 C136 410 146 372 156 340" fill="none" stroke={C.cardiganShade} strokeWidth={3} strokeLinecap="round" />
      <path d="M142 304 C136 290 138 274 148 268 C150 258 162 254 172 258 C180 254 190 260 190 270 C194 280 190 296 184 306 Z" fill={C.skin} {...ink()} />
      <path d="M152 272 Q162 268 172 274 M150 284 Q162 280 174 288 M178 262 Q186 266 188 276" fill="none" {...ink(1.8)} />
      <path d="M128 318 C128 306 136 300 146 302 L182 308 C192 310 196 318 192 328 L188 338 L128 330 Z" fill={C.cardigan} {...ink()} />
      <path d="M140 314 L138 330 M152 314 L150 332 M164 316 L163 334 M176 318 L175 336" stroke={C.rib} strokeWidth={2} strokeLinecap="round" />
      </g>

      {pose.sparkle ? (<><Sparkle x={300} y={150} scale={1.1} /><Sparkle x={318} y={184} scale={0.6} /></>) : null}
      {pose.sweat ? <path d="M286 168 Q280 180 286 186 Q292 180 286 168 Z" fill={C.sweat} {...ink(1.8)} /> : null}
    </svg>
  );
}
