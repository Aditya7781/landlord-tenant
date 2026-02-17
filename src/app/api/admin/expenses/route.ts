import { NextRequest, NextResponse } from "next/server";

const FETCH_EXPENSES_API = "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/fetch_expenses";
const CREATE_EXPENSE_API = "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/create_expenses";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Get query parameter (year, month, or "all")
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "all";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${FETCH_EXPENSES_API}?query=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
    console.error("Fetch expenses API error:", error);

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

    const { name, amount, expenseType, paymentType, receipt, description, status, paidAt } = body;

    if (!name || !amount || !expenseType || !paymentType) {
      return NextResponse.json(
        { success: false, message: "Name, amount, expense type, and payment type are required" },
        { status: 400 }
      );
    }

    // Handle receipt - if it's an object with uploadUrl, extract the URL
    const receiptUrl = receipt && typeof receipt === 'object' && receipt.uploadUrl 
      ? receipt.uploadUrl 
      : receipt;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(CREATE_EXPENSE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        amount,
        expenseType,
        paymentType,
        receipt: receiptUrl,
        description,
        status,
        paidAt,
      }),
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
      message: "Expense created successfully",
      data,
    });
  } catch (error) {
    console.error("Create expense API error:", error);

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
