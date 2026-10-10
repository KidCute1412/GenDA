import type { DemoOpportunity, DemoRegistration } from "../demo-ledger/types";
import { addDays } from "./model";

/**
 * Dữ liệu mẫu cho cơ hội ngắn: nhiều lĩnh vực ngoài công nghệ, thù lao từ 50k. Ngày diễn ra tính
 * tương đối so với `today` để bản demo luôn có cơ hội sắp diễn ra. Chỗ đã có người giữ được dựng
 * bằng các đăng ký của khách mẫu (`guest-*`), nên số chỗ còn lại luôn tính từ cùng một nguồn.
 */
type SeedRow = Omit<DemoOpportunity, "status" | "createdAt"> & { taken: number; pending?: number };

export function createSeedOpportunities(today: string): { opportunities: DemoOpportunity[]; registrations: DemoRegistration[] } {
  const on = (days: number) => addDays(today, days);
  const rows: SeedRow[] = [
    {
      id: "o-podcast-talkshow", kind: "EVENT", ownerId: "sme-song-media", orgName: "Sóng Media", industry: "Truyền thông",
      title: "Khán giả talkshow \"Làm podcast từ con số 0\"",
      summary: "Ngồi hàng ghế khán giả, đặt câu hỏi cho khách mời trong buổi ghi hình talkshow.",
      details: "Buổi ghi hình dài khoảng hai tiếng rưỡi. Bạn được hướng dẫn chỗ ngồi, có nước uống và nhận thù lao ngay sau buổi ghi hình. Ekip có thể quay cận khán giả, nên hãy mặc trang phục gọn gàng.",
      pay: 150_000, payUnit: "PER_PERSON", sessions: [{ date: on(10), start: "14:00", end: "16:30" }],
      mode: "OFFLINE", location: "Nhà văn hóa Thanh Niên, Q.1, TP.HCM", slots: 40,
      requirements: ["Từ 18 tuổi trở lên", "Có mặt trước giờ bắt đầu 15 phút để check-in"], taken: 22
    },
    {
      id: "o-food-app-test", kind: "EVENT", ownerId: "sme-bep-nha-minh", orgName: "Bếp Nhà Mình", industry: "F&B",
      title: "Người dùng thử app đặt món (60 phút, trực tuyến)",
      summary: "Dùng thử bản mới của app đặt món và trả lời phỏng vấn ngắn về trải nghiệm.",
      details: "Bạn chia sẻ màn hình điện thoại, làm vài thao tác đặt món theo kịch bản rồi trả lời câu hỏi. Không cần kinh nghiệm thiết kế hay lập trình.",
      pay: 100_000, payUnit: "PER_PERSON", sessions: [{ date: on(4), start: "19:00", end: "20:00" }],
      mode: "ONLINE", location: "Google Meet (gửi link sau khi giữ chỗ)", slots: 12,
      requirements: ["Có điện thoại thông minh", "Đã từng đặt đồ ăn qua app"], taken: 9
    },
    {
      id: "o-latte-art", kind: "EVENT", ownerId: "sme-coffee", orgName: "The Coffee Lab", industry: "F&B",
      title: "Khách trải nghiệm workshop latte art",
      summary: "Học vẽ latte art cơ bản và góp ý để quán hoàn thiện workshop trước khi mở bán vé.",
      details: "Barista hướng dẫn từ đánh sữa tới vẽ hình trái tim. Cuối buổi bạn điền phiếu góp ý về nội dung, thời lượng và mức giá vé dự kiến.",
      pay: 50_000, payUnit: "PER_PERSON", sessions: [{ date: on(6), start: "09:00", end: "11:00" }],
      mode: "OFFLINE", location: "The Coffee Lab, Q.3, TP.HCM", slots: 15,
      requirements: ["Không cần biết pha chế"], taken: 15
    },
    {
      id: "o-gameshow", kind: "EVENT", ownerId: "sme-kenh18", orgName: "Kênh 18 Studio", industry: "Truyền thông",
      title: "Khán giả ghi hình gameshow sinh viên",
      summary: "Cổ vũ và tham gia trò chơi nhỏ cùng khán giả trong buổi ghi hình gameshow.",
      details: "Buổi ghi hình kéo dài cả buổi sáng, có nghỉ giữa giờ. Bạn có thể được mời lên sân khấu chơi một trò nhỏ (không bắt buộc).",
      pay: 200_000, payUnit: "PER_PERSON", sessions: [{ date: on(15), start: "08:00", end: "12:00" }],
      mode: "OFFLINE", location: "Studio Kênh 18, Q.7, TP.HCM", slots: 60,
      requirements: ["Từ 18 tuổi trở lên", "Đồng ý xuất hiện trong video phát sóng"], taken: 31
    },
    {
      id: "o-cv-workshop", kind: "EVENT", ownerId: "sme-nghe-tre", orgName: "Hội Nghề Trẻ", industry: "Giáo dục",
      title: "Người học thử workshop \"Viết CV cho người mới đi làm\"",
      summary: "Học thử giáo trình mới và cho ý kiến để ban tổ chức chỉnh trước khi mở lớp chính thức.",
      details: "Mang theo CV hiện tại (nếu có). Diễn giả chữa CV trực tiếp cho vài bạn tình nguyện, sau đó cả lớp làm phiếu đánh giá giáo trình.",
      pay: 120_000, payUnit: "PER_PERSON", sessions: [{ date: on(20), start: "18:30", end: "20:30" }],
      mode: "OFFLINE", location: "Thư viện Khoa học Tổng hợp, Q.1, TP.HCM", slots: 30,
      requirements: ["Sinh viên năm cuối hoặc mới tốt nghiệp"], taken: 6
    },
    {
      id: "o-checkin-staff", kind: "GIG", ownerId: "sme-song-media", orgName: "Sóng Media", industry: "Sự kiện",
      title: "Cộng tác viên check-in và hướng dẫn chỗ ngồi talkshow",
      summary: "Đón khách, đối chiếu danh sách, phát thẻ và hướng dẫn khán giả vào chỗ.",
      details: "Có buổi hướng dẫn 30 phút trước giờ đón khách. Trang phục áo trắng, quần tối màu. Thù lao trả theo từng buổi bạn tham gia.",
      pay: 300_000, payUnit: "PER_SESSION",
      sessions: [{ date: on(10), start: "12:30", end: "17:00" }, { date: on(17), start: "12:30", end: "17:00" }],
      mode: "OFFLINE", location: "Nhà văn hóa Thanh Niên, Q.1, TP.HCM", slots: 4,
      requirements: ["Giao tiếp lịch sự, đúng giờ", "Tham gia được ít nhất một buổi"], taken: 1
    },
    {
      id: "o-coffee-helper", kind: "GIG", ownerId: "sme-coffee", orgName: "The Coffee Lab", industry: "F&B",
      title: "Phụ bàn workshop pha chế cuối tuần",
      summary: "Chuẩn bị dụng cụ, rót nước cho khách và dọn quầy sau mỗi workshop.",
      details: "Làm việc cùng barista chính. Quán bao bữa sáng nhẹ. Ưu tiên bạn tham gia được cả hai buổi.",
      pay: 250_000, payUnit: "PER_SESSION",
      sessions: [{ date: on(6), start: "08:00", end: "12:00" }, { date: on(13), start: "08:00", end: "12:00" }],
      mode: "OFFLINE", location: "The Coffee Lab, Q.3, TP.HCM", slots: 2,
      requirements: ["Nhanh nhẹn, sạch sẽ"], taken: 0, pending: 1
    },
    {
      id: "o-event-video", kind: "GIG", ownerId: "sme-kenh18", orgName: "Kênh 18 Studio", industry: "Truyền thông",
      title: "Quay và dựng video ngắn tại buổi ghi hình",
      summary: "Quay hậu trường bằng điện thoại và dựng 3 video dọc dưới 60 giây trong ngày.",
      details: "Dùng điện thoại của bạn, studio hỗ trợ gimbal và micro cài áo. Bàn giao video trước 22:00 cùng ngày.",
      pay: 600_000, payUnit: "PER_SESSION", sessions: [{ date: on(15), start: "07:30", end: "12:30" }],
      mode: "OFFLINE", location: "Studio Kênh 18, Q.7, TP.HCM", slots: 2,
      requirements: ["Có sản phẩm video ngắn đã đăng (gửi link khi được liên hệ)"], taken: 0
    },
    {
      id: "o-livestream-mod", kind: "GIG", ownerId: "sme-ha-lan", orgName: "Mỹ phẩm Hạ Lan", industry: "Bán lẻ",
      title: "Trực bình luận buổi livestream bán hàng",
      summary: "Trả lời bình luận, ghim câu hỏi hay và ghi lại đơn hỏi giá trong buổi livestream.",
      details: "Làm tại nhà qua tài khoản quản trị được cấp tạm thời. Có kịch bản trả lời mẫu và người giám sát trong suốt buổi.",
      pay: 150_000, payUnit: "PER_SESSION", sessions: [{ date: on(3), start: "19:30", end: "22:00" }],
      mode: "ONLINE", location: "Facebook Live (làm tại nhà)", slots: 3,
      requirements: ["Gõ phím nhanh, viết đúng chính tả"], taken: 1
    }
  ];

  const opportunities: DemoOpportunity[] = rows.map(({ taken: _taken, pending: _pending, ...row }) => ({ ...row, status: "PUBLISHED", createdAt: "2026-09-01" }));
  const registrations: DemoRegistration[] = rows.flatMap((row) => [
    ...Array.from({ length: row.taken }, (_, index): DemoRegistration => ({ id: `${row.id}:guest-${index + 1}`, opportunityId: row.id, userId: `guest-${row.id}-${index + 1}`, name: `Khách mẫu ${index + 1}`, status: "CONFIRMED", createdAt: "2026-09-01" })),
    ...Array.from({ length: row.pending ?? 0 }, (_, index): DemoRegistration => ({ id: `${row.id}:pending-${index + 1}`, opportunityId: row.id, userId: `guest-${row.id}-p${index + 1}`, name: index === 0 ? "Trần Minh Khang" : `Ứng viên mẫu ${index + 1}`, status: "PENDING", createdAt: "2026-09-01" }))
  ]);
  return { opportunities, registrations };
}
