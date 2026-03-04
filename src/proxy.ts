import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log(`[PROXY] Intercepting request: ${pathname}`);

  // 1. Cho phép các route Auth và Realtime (SSE)
  // Lưu ý: SSE thường không hỗ trợ Authorization Header thuận tiện trong trình duyệt
  if (pathname.includes("/v1/auth") || pathname === "/v1/weather/realtime") {
    return NextResponse.next();
  }

  // 2. Bảo mật cho Sensor Data Endpoint (Dùng API Key thay vì JWT)
  if (pathname === "/v1/weather/sensors/data") {
    const sensorToken = req.headers.get("X-Sensor-Token");
    const validToken = process.env.SENSOR_API_KEY;

    if (!sensorToken || sensorToken !== validToken) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Sensor Token không hợp lệ" },
        },
        { status: 401 },
      );
    }
    return NextResponse.next();
  }

  // 2. Kiểm tra Token cho các route bảo vệ
  if (pathname.startsWith("/v1/weather")) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập" },
        },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Token không hợp lệ hoặc đã hết hạn",
          },
        },
        { status: 401 },
      );
    }

    // 3. Phân quyền (RBAC)
    const method = req.method;
    const isWriteOperation = ["POST", "PUT", "PATCH", "DELETE"].includes(
      method,
    );

    if (isWriteOperation && payload.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Bạn không có quyền thực hiện thao tác này",
          },
        },
        { status: 403 },
      );
    }

    // Gắn user info vào header để các route sau có thể sử dụng nếu cần
    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.sub);
    response.headers.set("x-user-role", payload.role);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/v1/:path*"],
};
