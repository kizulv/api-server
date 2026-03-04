import { InfluxDB, Point } from "@influxdata/influxdb-client";

const url = process.env.INFLUXDB_URL;
const token = process.env.INFLUXDB_TOKEN;
const org = process.env.INFLUXDB_ORG;
const bucket = process.env.INFLUXDB_BUCKET;

if (!url || !token || !org || !bucket) {
  throw new Error(
    "Thiếu cấu hình InfluxDB trong file .env. Vui lòng kiểm tra INFLUXDB_URL, INFLUXDB_TOKEN, INFLUXDB_ORG, và INFLUXDB_BUCKET.",
  );
}

export const influxClient = new InfluxDB({
  url: new URL(url).toString(),
  token,
});
export const writeApi = influxClient.getWriteApi(org, bucket);
export const queryApi = influxClient.getQueryApi(org);

// SDK v2 tự động xử lý lỗi qua cơ chế retry.
// Nếu muốn bắt lỗi cụ thể, cần config listener trong getWriteApi
export { Point };
