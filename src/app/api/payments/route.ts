import { NextRequest, NextResponse } from "next/server";

const GET_USERS_PAYMENT_STATUS_API = "https://838tku002k.execute-api.ap-south-1.amazonaws.com/dev/my?query=payment";

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

    const response = await fetch(GET_USERS_PAYMENT_STATUS_API, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      // unwrap payments array
      return NextResponse.json({
        success: true,
        email: data.email,
        payments: data.payments || [],
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to fetch payment status",
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Payment status API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Network error. Please try again.",
      },
      { status: 500 }
    );
  }
}