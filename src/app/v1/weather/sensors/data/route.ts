import { NextRequest, NextResponse } from "next/server";
import { weatherService } from "@/modules/weather/weather.service";
import { weatherDataSchema } from "@/modules/weather/weather.schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate đầu vào
    const validation = weatherDataSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Dữ liệu không hợp lệ",
            details: validation.error.format(),
          },
        },
        { status: 422 },
      );
    }

    // 2. Xử lý lưu trữ qua Service
    await weatherService.saveSensorData(validation.data);

    // 3. Trả về response chuẩn
    return NextResponse.json(
      {
        success: true,
        data: {
          message: "Dữ liệu đã được lưu thành công",
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[WEATHER_API_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Đã có lỗi xảy ra khi xử lý dữ liệu",
        },
      },
      { status: 500 },
    );
  }
}
