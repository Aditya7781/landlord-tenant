import { NextRequest, NextResponse } from "next/server";

const ROOMS_API =
  "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/get_room_and_bed_info";

const ADD_ROOM_API =
  "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/create_room";

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

    // Call the backend rooms API
    const response = await fetch(ROOMS_API, {
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
          message: data.message || "Failed to fetch rooms",
        },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error("Rooms API error:", error);
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
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    const { roomNo, numberOfBeds } = await request.json();

    // Call the backend add room API
    const response = await fetch(ADD_ROOM_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomNo, numberOfBeds }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to add room",
        },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error("Add room API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Network error. Please try again.",
      },
      { status: 500 },
    );
  }
}
