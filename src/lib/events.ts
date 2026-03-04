import { EventEmitter } from "events";

// Đảm bảo EventEmitter là singleton ngay cả khi hot reload trong dev mode
const globalForEvents = global as unknown as {
  eventEmitter: EventEmitter | undefined;
};

export const eventEmitter = globalForEvents.eventEmitter ?? new EventEmitter();

if (process.env.NODE_ENV !== "production") {
  globalForEvents.eventEmitter = eventEmitter;
}

// Định nghĩa các tên sự kiện hằng số để tránh lỗi typo
export const EVENTS = {
  WEATHER_DATA_UPDATED: "weather:data_updated",
} as const;
