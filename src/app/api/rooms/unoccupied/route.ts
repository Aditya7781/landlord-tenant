import { NextRequest, NextResponse } from "next/server";

const UNOCCUPIED_ROOMS_API =
  "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/get_unoccupied_room_and_bed";

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

    const response = await fetch(UNOCCUPIED_ROOMS_API, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    }

    return NextResponse.json(
      {
        success: false,
        message: data.message || "Failed to fetch unoccupied rooms",
      },
      { status: response.status },
    );
  } catch (error) {
    console.error("Unoccupied rooms API error:", error);
    return NextResponse.json(
      { success: false, message: "Network error. Please try again." },
      { status: 500 },
    );
  }
}


