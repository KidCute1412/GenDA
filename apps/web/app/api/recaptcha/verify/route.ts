import { NextResponse } from "next/server";

/**
 * Kiểm tra token reCAPTCHA v2 phía server bằng khóa bí mật (RECAPTCHA_SECRET_KEY).
 * Khóa bí mật không bao giờ được gửi xuống trình duyệt.
 *
 * Khi chạy dev mà chưa cấu hình, dùng khóa bí mật THỬ NGHIỆM chính thức của Google
 * (đi cặp với khóa site thử nghiệm, mọi lần kiểm tra đều qua). Ở production thiếu
 * khóa thì từ chối, không cho qua.
 */
const GOOGLE_TEST_SECRET_KEY = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";

export async function POST(request: Request) {
  const secret =
    process.env.RECAPTCHA_SECRET_KEY || (process.env.NODE_ENV !== "production" ? GOOGLE_TEST_SECRET_KEY : "");
  if (!secret) {
    return NextResponse.json({ ok: false, error: "recaptcha_not_configured" }, { status: 500 });
  }

  let token = "";
  try {
    const body = (await request.json()) as { token?: unknown };
    token = typeof body.token === "string" ? body.token : "";
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }
  if (!token) {
    return NextResponse.json({ ok: false, error: "missing_token" }, { status: 400 });
  }

  const params = new URLSearchParams({ secret, response: token });
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwardedFor) params.set("remoteip", forwardedFor);

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
      cache: "no-store"
    });
    const result = (await response.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!result.success) {
      return NextResponse.json({ ok: false, error: result["error-codes"]?.[0] ?? "verification_failed" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "verification_unavailable" }, { status: 502 });
  }
}
