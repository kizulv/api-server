import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/modules/auth/auth.service";
import { registerSchema } from "@/modules/auth/auth.schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

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

    const user = await authService.register(validation.data);

    return NextResponse.json({ success: true, data: user }, { status: 201 });
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

    if (message === "EMAIL_EXISTS") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "EMAIL_EXISTS", message: "Email đã tồn tại" },
        },
        { status: 409 },
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
