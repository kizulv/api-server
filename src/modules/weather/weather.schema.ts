import { z } from "zod";

export const weatherDataSchema = z.object({
  deviceId: z.string().min(1, "Device ID is required"),
  location: z.string().optional(),
  temperature: z.number(),
  humidity: z.number().min(0).max(100),
  isRaining: z.union([z.boolean(), z.number().int().min(0).max(1)]).optional(),
  lightIntensity: z.number().int().nonnegative(),
  time: z.number().int().positive().optional(), // Unix timestamp từ thiết bị
  timestamp: z.string().datetime().optional(), // ISO format (legacy/optional)
});

export type WeatherDataInput = z.infer<typeof weatherDataSchema>;
