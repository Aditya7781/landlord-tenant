import { NextRequest, NextResponse } from "next/server";

const GET_USERS_PAYMENT_STATUS_API = "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/get_users_payment_status";

export async function GET(request: NextRequest) {
  console.log("[api/admin/payments] Route called!");
  
  try {
    const authHeader = request.headers.get("authorization");
    console.log("[api/admin/payments] Auth header:", authHeader ? "Present" : "Missing");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[api/admin/payments] Invalid auth header format");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log("[api/admin/payments] Token extracted, length:", token.length);

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(GET_USERS_PAYMENT_STATUS_API, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log("[api/admin/payments] Backend response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log("[api/admin/payments] Backend error response:", errorText);
      return NextResponse.json(
        {
          success: false,
          message: `Backend API error (${response.status}): ${errorText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[api/admin/payments] Backend response:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Users payment status API error:", error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          {
            success: false,
            message: "Request timeout. Please try again.",
          },
          { status: 408 }
        );
      }
      
      if (error.message.includes('Failed to fetch')) {
        return NextResponse.json(
          {
            success: false,
            message: "Network error. Unable to connect to payment service. Please check your connection and try again.",
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
