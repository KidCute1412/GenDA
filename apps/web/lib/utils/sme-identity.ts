/**
 * Định danh doanh nghiệp khi đăng ký tài khoản SME: bắt buộc có MÃ SỐ THUẾ, hoặc nếu
 * doanh nghiệp chưa có mã số thuế thì có WEBSITE CÔNG TY thay thế.
 *
 * Mã số thuế Việt Nam: 10 chữ số (doanh nghiệp), hoặc 13 ký tự dạng
 * "0123456789-001" (chi nhánh / đơn vị phụ thuộc). Chấp nhận người dùng gõ liền
 * 13 chữ số hoặc có khoảng trắng, rồi chuẩn hoá về dạng có gạch nối.
 */
export function normalizeTaxCode(value: string): string {
  const digits = value.replace(/[\s.-]/g, "");
  if (/^\d{13}$/.test(digits)) return `${digits.slice(0, 10)}-${digits.slice(10)}`;
  return digits;
}

export function isValidTaxCode(value: string): boolean {
  return /^\d{10}(-\d{3})?$/.test(normalizeTaxCode(value));
}

/** Thêm https:// nếu người dùng chỉ gõ tên miền, bỏ khoảng trắng hai đầu. */
export function normalizeWebsite(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function isValidWebsite(value: string): boolean {
  const normalized = normalizeWebsite(value);
  if (!normalized) return false;
  try {
    const url = new URL(normalized);
    return (url.protocol === "https:" || url.protocol === "http:") && /^[^.\s]+(\.[^.\s]+)+$/.test(url.hostname);
  } catch {
    return false;
  }
}

export type SmeIdentity = { taxCode?: string; companyWebsite?: string };

/** Trả về thông báo lỗi (tiếng Việt) nếu định danh SME chưa hợp lệ, hoặc null nếu hợp lệ. */
export function validateSmeIdentity(identity: SmeIdentity): string | null {
  if (identity.taxCode?.trim()) {
    return isValidTaxCode(identity.taxCode)
      ? null
      : "Mã số thuế gồm 10 chữ số, hoặc 13 ký tự dạng 0123456789-001 với chi nhánh.";
  }
  if (identity.companyWebsite?.trim()) {
    return isValidWebsite(identity.companyWebsite) ? null : "Website chưa đúng định dạng, ví dụ: congty.vn hoặc https://congty.vn.";
  }
  return "Doanh nghiệp cần cung cấp mã số thuế, hoặc website công ty nếu chưa có mã số thuế.";
}
