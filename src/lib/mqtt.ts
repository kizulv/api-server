import mqtt from "mqtt";
import { weatherService } from "@/modules/weather/weather.service";
import { formatVN } from "@/lib/datetime";

const mqttUrl = process.env.MQTT_URL || "mqtt://localhost:1883";
const username = process.env.MQTT_USERNAME;
const password = process.env.MQTT_PASSWORD;

export const initMqtt = () => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  console.log(`[MQTT] Connecting to ${mqttUrl}...`);

  const client = mqtt.connect(mqttUrl, {
    username,
    password,
    clientId: `api_server_bridge_${Math.random().toString(16).slice(2, 8)}`,
  });

  client.on("connect", () => {
    console.log("[MQTT]     - Connected successfully");
    client.subscribe("weather/sensors/data", (err) => {
      if (!err) {
        console.log("[MQTT]     - Subscribed to topic: weather/sensors/data");
        console.log("------------------------------------------------------");
      }
    });
  });

  client.on("message", async (topic, message) => {
    if (topic === "weather/sensors/data") {
      try {
        const payload = JSON.parse(message.toString());
        const deviceId = payload.deviceId || payload.sensorId;

        const currentTime = formatVN(new Date());
        console.log(`[${currentTime}]`);
        console.log(
          `[MQTT]     - Data received from device: "${deviceId}" at "${payload.location || "Unknown location"}"`,
        );

        // Map payload to match WeatherDataInput schema
        const data = {
          ...payload,
          deviceId: deviceId,
        };

        // Save to InfluxDB via WeatherService
        await weatherService.saveSensorData(data);
        console.log("------------------------------------------------------");
      } catch (error) {
        console.error("[MQTT]     - Failed to process message:", error);
      }
    }
  });

  client.on("error", (err) => {
    console.error("[MQTT]     - Connection error:", err);
  });

  return client;
};
