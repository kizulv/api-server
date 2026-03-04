import { weatherRepository } from "./weather.repository";
import { WeatherDataInput } from "./weather.schema";
import { eventEmitter, EVENTS } from "@/lib/events";

export class WeatherService {
  async saveSensorData(data: WeatherDataInput): Promise<void> {
    // Chuyển đổi dữ liệu sang định dạng InfluxDB Repository yêu cầu
    const formattedData = {
      deviceId: data.deviceId,
      location: data.location,
      temperature: data.temperature,
      humidity: data.humidity,
      lightIntensity: Math.round(data.lightIntensity),
      isRaining:
        typeof data.isRaining === "boolean"
          ? data.isRaining
            ? 1
            : 0
          : (data.isRaining ?? 0),
      deviceTime: data.time, // Unix timestamp từ thiết bị (giây)
      timestamp: data.timestamp ? new Date(data.timestamp) : undefined,
    };

    await weatherRepository.saveSensorData(formattedData);

    // Phát sự kiện realtime cho các client đang lắng nghe
    eventEmitter.emit(EVENTS.WEATHER_DATA_UPDATED, formattedData);
  }

  async getWeatherHistory(
    deviceId: string,
    start?: string,
    stop?: string,
    aggregate?: boolean,
  ) {
    const every = aggregate ? "1h" : undefined;
    const rows = await weatherRepository.getHistoryData(
      deviceId,
      start,
      stop,
      every,
    );
    return this.formatInfluxRows(rows);
  }

  private formatInfluxRows(rows: Record<string, unknown>[]) {
    // InfluxDB trả về kết quả dạng bảng, cần nhóm theo thời gian
    const result: Record<string, Record<string, unknown>> = {};

    rows.forEach((row, index) => {
      if (index === 0)
        console.log(
          "[WEATHER_SERVICE] Example row structure:",
          JSON.stringify(row),
        );
      const time = row._time as string;
      const unixTimestamp = Math.floor(new Date(time).getTime() / 1000);
      if (!result[time]) {
        result[time] = { timestamp: unixTimestamp };
      }

      const field = row._field as string;
      if (field !== "received_time" && field !== "server_time") {
        result[time][field] = row._value;
      }
    });

    return Object.values(result);
  }
}

export const weatherService = new WeatherService();
