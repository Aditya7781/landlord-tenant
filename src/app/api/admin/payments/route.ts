import { NextRequest, NextResponse } from "next/server";

const GET_USERS_PAYMENT_STATUS_API = "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/get_users_payment_status";

export async function GET(request: NextRequest) {
  console.log("[api/admin/payments] Route called!");
  
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[api/admin/payments] Invalid auth header format");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log("[api/admin/payments] Token extracted, length:", token.length);

    const response = await fetch(GET_USERS_PAYMENT_STATUS_API, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("[api/admin/payments] Backend response status:", response.status);
    const data = await response.json();
    console.log("[api/admin/payments] Backend response:", data);

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to fetch users payment status",
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Users payment status API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Network error. Please try again.",
      },
      { status: 500 }
    );
  }
}
