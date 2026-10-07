"use client";

import { useSyncExternalStore } from "react";
import { toIsoDate } from "../model";

const subscribe = () => () => {};

/**
 * Ngày hôm nay theo đồng hồ của người xem, dạng `YYYY-MM-DD`. Trả về null khi render phía máy chủ
 * và lúc hydrate: dữ liệu mẫu tính ngày tương đối theo hôm nay, nếu render sẵn ở máy chủ thì
 * máy chủ khởi động từ hôm trước sẽ ra HTML lệch với trình duyệt.
 */
export function useToday(): string | null {
  return useSyncExternalStore(subscribe, () => toIsoDate(new Date()), () => null);
}
