export interface WeatherData {
  deviceId: string;
  location?: string;
  temperature: number;
  humidity: number;
  isRaining: number; // 0 or 1
  lightIntensity: number;
  deviceTime?: number; // Unix timestamp từ thiết bị
  timestamp?: Date;
}

export interface InfluxConfig {
  url: string;
  token: string;
  org: string;
  bucket: string;
}
