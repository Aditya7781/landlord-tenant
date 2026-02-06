import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomNo, bedIndex, operation } = body;

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    if (!roomNo || bedIndex === undefined || !operation) {
      return NextResponse.json(
        { success: false, message: "Room number, bed index, and operation are required" },
        { status: 400 }
      );
    }

    if (!["add", "remove"].includes(operation)) {
      return NextResponse.json(
        { success: false, message: "Operation must be either 'add' or 'remove'" },
        { status: 400 }
      );
    }

    // Call the external API
    const response = await fetch(
      "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/edit_room",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomNo: roomNo,
          bedIndex: bedIndex,
          operation: operation,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to edit room",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { success: true, message: `Bed ${operation}ed successfully`, data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Edit room error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Network error. Please try again.",
      },
      { status: 500 }
    );
  }
}
