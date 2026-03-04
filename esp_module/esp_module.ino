#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// --- Cấu hình NTP ---
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 0); // Unix Timestamp luôn phải là UTC

// --- Cấu hình Wi-Fi ---
const char* ssid = "ThanhThuong2G";
const char* password = "55555555";

// --- Cấu hình MQTT ---
const char* mqtt_server = "192.168.31.7"; // Ví dụ: "192.168.1.100" hoặc tên miền
const int mqtt_port = 1883;
const char* mqtt_user = "mqtt_apiserver"; // Để trống nếu không dùng pass
const char* mqtt_pass = "123a456S@";
const char* topic = "weather/sensors/data";

WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastMsg = 0;

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  randomSeed(micros());
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Tạo clientId ngẫu nhiên
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  timeClient.begin();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  timeClient.update();

  unsigned long now = millis();
  // Gửi dữ liệu mỗi 60 giây
  if (now - lastMsg > 60000) {
    lastMsg = now;

    // Giả lập dữ liệu hoặc đọc từ cảm biến (DHT22, LDR, v.v.)
    float temp = 28.5 + (random(-10, 10) / 10.0);
    float hum = 65.2 + (random(-20, 20) / 10.0);
    int raining = (random(0, 100) > 90) ? 1 : 0;
    int light = 400 + random(-50, 50);

    // Tạo JSON payload
    StaticJsonDocument<256> doc;
    doc["deviceId"] = "esp8266";
    doc["location"] = "Sân thượng";
    doc["temperature"] = temp;
    doc["humidity"] = hum;
    doc["isRaining"] = raining;
    doc["lightIntensity"] = light;
    doc["time"] = timeClient.getEpochTime(); // Lấy thời gian thực từ NTP

    char buffer[256];
    serializeJson(doc, buffer);

    Serial.print("Publish message: ");
    Serial.println(buffer);
    client.publish(topic, buffer);
  }
}
