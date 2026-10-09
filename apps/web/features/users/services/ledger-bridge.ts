"use client";

import { findDemoAccount, mirrorContributor } from "../../demo-ledger/store";
import { fetchCvFile, type ContributorCv } from "./contributor-api";

export function readAsDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Ứng tuyển vẫn là demo trong trình duyệt. Trước khi gửi đơn, sao tài khoản và CV READY từ backend vào ledger
 * để doanh nghiệp (cùng trình duyệt demo) mở được đúng CV đã qua kiểm tra. CV đã sao rồi thì không tải lại.
 */
export async function syncLedgerContributor(account: { email: string; name: string }, cv: ContributorCv | null, file?: Blob) {
  const mirrored = findDemoAccount(account.email);
  if (!cv) return mirrorContributor(account);
  if (!file && mirrored?.cv?.uploadedAt === cv.uploadedAt) return mirrorContributor(account);
  const dataUrl = await readAsDataUrl(file ?? (await fetchCvFile()));
  return mirrorContributor({ ...account, cv: { name: cv.fileName, size: cv.sizeBytes, uploadedAt: cv.uploadedAt, dataUrl } });
}
