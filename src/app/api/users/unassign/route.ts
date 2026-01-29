import { NextRequest, NextResponse } from "next/server";

const UNASSIGN_ROOM_API =
  "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/unassigned_room";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    const { userEmail, roomNo, bedIndex } = await request.json();

    // Validate required fields
    if (!userEmail || !roomNo || bedIndex === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Call the backend unassign room API
    const response = await fetch(UNASSIGN_ROOM_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userEmail, roomNo, bedIndex }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to unassign room",
        },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error("Unassign room API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Network error. Please try again.",
      },
      { status: 500 },
    );
  }
}

