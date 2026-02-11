import { NextRequest, NextResponse } from "next/server";

const GENERATE_PRESIGNED_API = "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/generate_presinged_from_reciept";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const body = await request.json();

    const { name, expenseType, fileType } = body;

    if (!name || !expenseType || !fileType) {
      return NextResponse.json(
        { success: false, message: "name, expenseType, and fileType are required" },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(GENERATE_PRESIGNED_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, expenseType, fileType }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          success: false,
          message: `Backend API error (${response.status}): ${errorText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Generate presigned URL API error:", error);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json(
          { success: false, message: "Request timeout. Please try again." },
          { status: 408 }
        );
      }

      if (error.message.includes("Failed to fetch")) {
        return NextResponse.json(
          {
            success: false,
            message: "Network error. Unable to connect to presigned URL service. Please check your connection and try again.",
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
