import { NextRequest, NextResponse } from "next/server";
import { weatherService } from "@/modules/weather/weather.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId =
      searchParams.get("deviceId") || searchParams.get("sensorId");
    const range = searchParams.get("range"); // range cũ như -24h, -1h
    const aggregate = searchParams.get("aggregate") === "true";
    const date =
      searchParams.get("date") || new Date().toLocaleDateString("sv-SE"); // sv-SE gives YYYY-MM-DD
    const start = searchParams.get("start"); // HH:mm
    const end = searchParams.get("end"); // HH:mm

    if (!deviceId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "BAD_REQUEST", message: "Thiếu deviceId" },
        },
        { status: 400 },
      );
    }

    let startTime: string | undefined = range || "-24h";
    let endTime: string | undefined = "now()";

    // Nếu người dùng cung cấp start/end cụ thể
    if (start) {
      // Chuyển đổi từ giờ địa phương (+7) sang UTC ISO String để truy vấn chuẩn
      const startDate = new Date(`${date}T${start}:00+07:00`);
      startTime = startDate.toISOString();

      if (end) {
        const endDate = new Date(`${date}T${end}:00+07:00`);
        // Nếu aggregate = true, cộng thêm 1 giờ để đảm bảo lấy được window cuối cùng
        if (aggregate) {
          endDate.setHours(endDate.getHours() + 1);
        }
        endTime = endDate.toISOString();
      }
    }

    console.log(
      `[WEATHER_HISTORY] Device: ${deviceId}, Start: ${startTime}, End: ${endTime}, Aggregate: ${aggregate}`,
    );

    const data = await weatherService.getWeatherHistory(
      deviceId,
      startTime,
      endTime,
      aggregate,
    );

    return NextResponse.json({
      success: true,
      data,
      meta: {
        startTime,
        endTime,
        deviceId,
      },
    });
  } catch (error) {
    console.error("[WEATHER_HISTORY_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Không thể lấy lịch sử dữ liệu",
        },
      },
      { status: 500 },
    );
  }
}
