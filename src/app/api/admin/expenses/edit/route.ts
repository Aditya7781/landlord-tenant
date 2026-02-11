import { NextRequest, NextResponse } from "next/server";

const EDIT_EXPENSE_API = "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/edit_expense_from_admin";

export async function PUT(request: NextRequest) {
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

    const { pk, sk, newName } = body;

    if (!pk || !sk) {
      return NextResponse.json(
        { success: false, message: "pk and sk are required" },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(EDIT_EXPENSE_API, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
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
    return NextResponse.json({
      success: true,
      message: "Expense updated successfully",
      data,
    });
  } catch (error) {
    console.error("Edit expense API error:", error);

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
            message: "Network error. Unable to connect to expense service. Please check your connection and try again.",
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
