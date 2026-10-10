import type { BackgroundType, EducationLevel, EducationStatus } from "./services/contributor-api";

export const BACKGROUND_COPY: Record<BackgroundType, string> = {
  STUDENT: "Sinh viên",
  RECENT_GRADUATE: "Mới tốt nghiệp",
  WORKING_PROFESSIONAL: "Đang đi làm",
  FREELANCER: "Freelancer",
  CAREER_SWITCHER: "Đang chuyển ngành",
  OTHER: "Khác"
};

export const BACKGROUND_ORDER = Object.keys(BACKGROUND_COPY) as BackgroundType[];

export const EDUCATION_LEVEL_COPY: Record<EducationLevel, string> = {
  HIGH_SCHOOL: "Trung học phổ thông",
  VOCATIONAL: "Trung cấp",
  COLLEGE: "Cao đẳng",
  BACHELOR: "Đại học",
  MASTER: "Thạc sĩ",
  DOCTORATE: "Tiến sĩ",
  SHORT_COURSE: "Khóa học ngắn hạn",
  OTHER: "Khác"
};

/** Bốn trạng thái để khai trung thực: không ép người đã từng học phải chọn "Đã tốt nghiệp". */
export const EDUCATION_STATUS_COPY: Record<EducationStatus, string> = {
  CURRENTLY_STUDYING: "Đang học",
  GRADUATED: "Đã tốt nghiệp",
  COMPLETED: "Đã hoàn thành",
  NOT_COMPLETED: "Chưa hoàn thành"
};

/** "2023-09" thành "09/2023". */
export function formatMonth(value: string | undefined | null) {
  if (!value) return null;
  const [year, month] = value.split("-");
  return `${month}/${year}`;
}

export function formatPeriod(start: string | undefined | null, end: string | undefined | null, status: EducationStatus) {
  const from = formatMonth(start);
  const to = formatMonth(end);
  if (!from) return "Chưa khai thời gian";
  if (status === "CURRENTLY_STUDYING") return to ? `${from} - ${to} (dự kiến)` : `${from} - nay`;
  return to ? `${from} - ${to}` : from;
}
