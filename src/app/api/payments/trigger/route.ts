import { NextRequest, NextResponse } from "next/server";

const TRIGGER_NOTIFICATION_API =
  "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/trigger_notification";

const PAYMENT_ACTION_API =
  "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/payment_action_button";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Call the backend trigger notification API
    const response = await fetch(TRIGGER_NOTIFICATION_API, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to trigger notifications",
        },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error("Trigger notification API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Network error. Please try again.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, yearMonth, roomNo, bedIndex } = body;

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    if (!userEmail || !yearMonth || !roomNo || bedIndex === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: userEmail, yearMonth, roomNo, bedIndex" },
        { status: 400 }
      );
    }

    // Call the external payment action API
    const response = await fetch(PAYMENT_ACTION_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userEmail: userEmail,
        yearMonth: yearMonth,
        roomNo: roomNo,
        bedIndex: bedIndex,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to trigger payment action",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { success: true, message: "Payment notification sent successfully", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment action API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Network error. Please try again.",
      },
      { status: 500 }
    );
  }
}

