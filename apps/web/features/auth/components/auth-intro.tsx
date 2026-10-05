"use client";

import type { CSSProperties } from "react";
import { useAuthMode } from "./auth-card";

/**
 * Phần hình của trang đăng nhập / đăng ký: thiết bị phần cứng "GenDA OP-26" (ẩn dụ
 * Teenage Engineering của DD-10) nghiêng 3D giữa sân khấu có sàn lưới, hạt sáng bay và
 * các thẻ thông tin lơ lửng.
 *
 * - Đăng nhập = chế độ EARN (ban ngày, màn hình cam): giao kèo BAY-01, số tiền, ba mốc
 *   bàn giao đang chạy, sóng tín hiệu.
 * - Đăng ký = chế độ LEARN (ban đêm, màn hình xanh): quét kỹ năng, cột cân bằng nhảy,
 *   các thẻ kỹ năng.
 *
 * Chuyển chế độ kiểu "Morph": mọi phần tử đều có mặt ở cả hai chế độ và CSS transition
 * nội suy góc nghiêng thiết bị, màu vỏ, góc núm xoay, vị trí thanh trượt, đèn phím,
 * vị trí thẻ lơ lửng, nội dung màn hình (trượt + mờ). Thêm hiệu ứng: màn hình chớp sáng
 * và hàng phím nhấn dồn một lượt mỗi lần đổi chế độ (gắn lại bằng key).
 * Chuyển động nền liên tục: thiết bị bồng bềnh, đèn LED chạy, sóng trôi, cột cân bằng,
 * hạt sáng bay lên. Toàn bộ là trang trí nên aria-hidden.
 */
const LEGEND = {
  login: ["Nhận dự án", "Làm theo mốc", "Nghiệm thu"],
  register: ["Chọn vai trò", "Điền thông tin", "Kích hoạt email"]
};

const PARTICLES = [
  [8, 0], [17, 2.4], [26, 5.1], [34, 1.2], [43, 3.8], [52, 6.3], [61, 0.7], [69, 4.4],
  [77, 2.1], [85, 5.6], [92, 1.6], [13, 7], [39, 6.8], [58, 3.2], [73, 7.6], [88, 4.9]
] as const;

const WAVE = Array.from({ length: 41 }, (_, i) => {
  const x = i * 10;
  const y = 20 + Math.sin(i * 0.7) * 9 + Math.sin(i * 1.9) * 4;
  return `${i === 0 ? "M" : "L"}${x} ${y.toFixed(1)}`;
}).join(" ");

const v = (vars: Record<string, string | number>) => vars as CSSProperties;

export function AuthIntro() {
  // Chế độ lấy từ AuthCard (client) để chuyển cảnh bắt đầu ngay khi bấm, không chờ server
  const mode = useAuthMode();
  const isRegister = mode === "register";

  return (
    <div className="auth-poster auth-intro" data-mode={mode}>
      <div>
        <span className="auth-intro__eyebrow">GenDA // From Learn to Earn</span>
        <h1 key={`title-${mode}`} className="auth-intro__title">
          {isRegister ? (
            <>Học hôm nay, làm dự&nbsp;án ngày mai</>
          ) : (
            <>
              Dự&nbsp;án nhỏ cho sinh viên & <span className="auth-intro__keep-case">SMEs</span>
            </>
          )}
        </h1>
      </div>

      <div className="auth-stage" aria-hidden="true">
        <div className="auth-stage__glow" />
        <div className="auth-stage__floor" />
        <div className="auth-stage__particles">
          {PARTICLES.map(([left, delay], index) => (
            <i key={index} style={v({ "--x": `${left}%`, "--delay": `${delay}s`, "--k": index })} />
          ))}
        </div>

        <div className="op-device">
          <div className="op-device__shadow" />
          <div className="op-device__body">
            <div className="op-device__top">
              <span className="op-device__brand">
                GenDA <b>OP-26</b>
              </span>
              <span className="op-device__mode">
                <span data-for="login">● EARN</span>
                <span data-for="register">● LEARN</span>
              </span>
              <span className="op-device__grille" />
            </div>

            <div className="op-device__main">
              <div className="op-screen">
                <div className="op-screen__view" data-for="login">
                  <div className="op-screen__row">
                    <span>BAY-01 // ACTIVE</span>
                    <span className="op-screen__rec">● REC</span>
                  </div>
                  <div className="op-screen__amount">
                    2.500.000<small>đ</small>
                  </div>
                  <div className="op-screen__segments">
                    <i />
                    <i />
                    <i />
                  </div>
                  <svg className="op-screen__wave" viewBox="0 0 200 40" preserveAspectRatio="none">
                    <path d={WAVE} />
                  </svg>
                </div>
                <div className="op-screen__view" data-for="register">
                  <div className="op-screen__row">
                    <span>SKILL.SCAN</span>
                    <span>LV 01 → 03</span>
                  </div>
                  <div className="op-screen__eq">
                    {Array.from({ length: 14 }, (_, index) => (
                      <i key={index} style={v({ "--k": index })} />
                    ))}
                  </div>
                  <div className="op-screen__tags">
                    <span>Figma</span>
                    <span>React</span>
                    <span>UI/UX</span>
                  </div>
                </div>
                <span className="op-screen__scanlines" />
                <span key={`flash-${mode}`} className="op-screen__flash" />
              </div>

              <div className="op-device__knobs">
                {[0, 1, 2, 3].map((index) => (
                  <span key={index} className={`op-knob op-knob--${index}`}>
                    <i />
                  </span>
                ))}
              </div>
            </div>

            <div className="op-device__leds">
              {Array.from({ length: 16 }, (_, index) => (
                <i key={index} style={v({ "--k": index })} />
              ))}
            </div>

            <div className="op-device__bottom">
              <div key={`keys-${mode}`} className="op-device__keys">
                {Array.from({ length: 8 }, (_, index) => (
                  <span key={index} className="op-key" style={v({ "--k": index })}>
                    <i />
                  </span>
                ))}
              </div>
              <div className="op-device__fader">
                <span />
              </div>
            </div>
          </div>
        </div>

        <div className="op-chip op-chip--a">
          <span data-for="login">+ 2.500.000đ</span>
          <span data-for="register">+ React</span>
        </div>
        <div className="op-chip op-chip--b">
          <span data-for="login">MỐC 02/03 ✓</span>
          <span data-for="register">Figma ▲ 72%</span>
        </div>
        <div className="op-chip op-chip--c">
          <span data-for="login">PORTFOLIO +1</span>
          <span data-for="register">CHUỖI HỌC 7 NGÀY</span>
        </div>
      </div>

      <ol key={`legend-${mode}`} className="auth-intro__legend">
        {LEGEND[mode].map((label, index) => (
          <li key={label} style={v({ "--k": index })}>
            <span aria-hidden="true">0{index + 1}</span>
            {label}
          </li>
        ))}
      </ol>
    </div>
  );
}
