import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url))
});

const config = [
  // Flat config không tự đọc .eslintignore, nên phải loại trừ thư mục build tường minh.
  // Thiếu dòng này thì `eslint .` sẽ quét cả bundle trong .next và báo lỗi giả.
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals")
];

export default config;
