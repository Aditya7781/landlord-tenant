import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomNo } = body;

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    
    if (!roomNo) {
      return NextResponse.json(
        { success: false, message: "Room number is required" },
        { status: 400 }
      );
    }

    // Call the external API
    const response = await fetch(
      "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/remove_room",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomNo: roomNo,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to delete room",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { success: true, message: "Room deleted successfully", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete room error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Network error. Please try again.",
      },
      { status: 500 }
    );
  }
}
