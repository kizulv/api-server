import { writeApi, queryApi, Point } from "@/lib/influxdb";
import { WeatherData } from "./weather.types";

export class WeatherRepository {
  async saveSensorData(data: WeatherData): Promise<void> {
    const point = new Point("weather_sensor").tag("device_id", data.deviceId);

    if (data.location) {
      point.tag("location", data.location);
    }

    point
      .floatField("temperature", data.temperature)
      .floatField("humidity", data.humidity)
      .intField("is_raining", data.isRaining)
      .intField("light_intensity", data.lightIntensity);

    if (data.deviceTime) {
      // data.deviceTime là UTC Unix timestamp từ thiết bị (giây)
      point.timestamp(new Date(data.deviceTime * 1000));
    } else if (data.timestamp) {
      point.timestamp(data.timestamp);
    } else {
      point.timestamp(new Date());
    }

    writeApi.writePoint(point);
    await writeApi.flush();
    console.log(
      `[INFLUXDB] - Data flushed successfully for ${data.deviceId} at ${data.deviceTime || "now"}`,
    );
  }

  async getHistoryData(
    deviceId: string,
    start: string = "-24h",
    stop: string = "now()",
    every?: string,
  ): Promise<Record<string, unknown>[]> {
    let query = `
      from(bucket: "${process.env.INFLUXDB_BUCKET}")
      |> range(start: ${start}, stop: ${stop})
      |> filter(fn: (r) => r["_measurement"] == "weather_sensor")
      |> filter(fn: (r) => r["device_id"] == "${deviceId}")
    `;

    if (every) {
      query = `
        data = from(bucket: "${process.env.INFLUXDB_BUCKET}")
          |> range(start: ${start}, stop: ${stop})
          |> filter(fn: (r) => r["_measurement"] == "weather_sensor")
          |> filter(fn: (r) => r["device_id"] == "${deviceId}")

        avg_data = data
          |> filter(fn: (r) => r["_field"] != "is_raining")
          |> aggregateWindow(every: ${every}, fn: mean, createEmpty: true, timeSrc: "_start")
          |> fill(value: 0.0)

        sum_data = data
          |> filter(fn: (r) => r["_field"] == "is_raining")
          |> aggregateWindow(every: ${every}, fn: sum, createEmpty: true, timeSrc: "_start")
          |> fill(value: 0)

        union(tables: [avg_data, sum_data])
      `;
    }

    const rows = (await queryApi.collectRows(query)) as Record<
      string,
      unknown
    >[];
    return rows;
  }
}

export const weatherRepository = new WeatherRepository();
