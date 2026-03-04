/**
 * Timestamp Utilities for API Server
 * Hỗ trợ chuyển đổi giữa UTC và múi giờ Việt Nam (GMT+7)
 */

/**
 * Chuyển đổi bất kỳ đầu vào thời gian nào (Unix timestamp giây/mili giây, chuỗi ISO, hoặc Date)
 * sang đối tượng Date chuẩn của JavaScript (luôn lưu trữ dưới dạng UTC).
 *
 * @param timestamp - Giá trị đầu vào (số giây, miligiây, ISO string hoặc Date)
 * @returns Đối tượng Date chuẩn (UTC)
 */
export const toUTC = (timestamp: string | number | Date): Date => {
  if (timestamp instanceof Date) return timestamp;

  // Xử lý Unix timestamp dạng giây (10 chữ số)
  if (typeof timestamp === "number" && timestamp < 10000000000) {
    return new Date(timestamp * 1000);
  }

  // Xử lý chuỗi hoặc mili giây
  const date = new Date(timestamp);

  // Kiểm tra tính hợp lệ của ngày
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid timestamp: ${timestamp}`);
  }

  return date;
};

/**
 * Định dạng thời gian sang chuỗi hiển thị theo múi giờ Việt Nam (GMT+7).
 * Ví dụ trả về: "04/03/2026, 09:30:00"
 *
 * @param timestamp - Giá trị đầu vào
 * @returns Chuỗi định dạng ngày giờ Việt Nam
 */
export const formatVN = (timestamp: string | number | Date): string => {
  const date = toUTC(timestamp);
  return date.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
};

/**
 * Chuyển đổi thời gian sang chuỗi ISO 8601 với múi giờ +07:00 cố định.
 * Phù hợp để làm việc với các hệ thống yêu cầu dải thời gian địa phương chính xác.
 *
 * @param timestamp - Giá trị đầu vào
 * @returns Chuỗi ISO định dạng YYYY-MM-DDTHH:mm:ss.sss+07:00
 */
export const toVNISO = (timestamp: string | number | Date): string => {
  const date = toUTC(timestamp);

  // Tính toán thời gian địa phương bằng cách cộng 7 giờ (ms)
  const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;
  const localTime = new Date(date.getTime() + VIETNAM_OFFSET_MS);

  // Trả về định dạng ISO nhưng thay "Z" bằng offset +07:00
  return localTime.toISOString().replace("Z", "+07:00");
};

/**
 * Lấy Unix timestamp hiện tại tính bằng giây (thường dùng cho InfluxDB hoặc MQTT).
 *
 * @returns Unix timestamp (giây)
 */
export const currentTimestampSeconds = (): number => {
  return Math.floor(Date.now() / 1000);
};

/**
 * Chuyển đổi timestamp sang Unix timestamp (giây).
 *
 * @param timestamp - Giá trị đầu vào
 * @returns Unix timestamp (giây)
 */
export const toSeconds = (timestamp: string | number | Date): number => {
  const date = toUTC(timestamp);
  return Math.floor(date.getTime() / 1000);
};
