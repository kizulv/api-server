import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/modules/auth/auth.service";
import { loginSchema } from "@/modules/auth/auth.schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = loginSchema.safeParse(body);

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

    const result = await authService.login(validation.data);

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    if (error.message === "INVALID_CREDENTIALS") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Email hoặc mật khẩu không chính xác",
          },
        },
        { status: 401 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Đã có lỗi xảy ra" },
      },
      { status: 500 },
    );
  }
}
