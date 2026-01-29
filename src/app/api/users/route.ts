import { NextRequest, NextResponse } from "next/server";

const USERS_API =
  "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/get_user_for_usermanagement";

const ASSIGN_ROOM_API =
  "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/assign_room";

const UPDATE_STATUS_API =
  "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/edit_user_from_admin";

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

    // Call the backend users API
    const response = await fetch(USERS_API, {
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
          message: data.message || "Failed to fetch users",
        },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error("Users API error:", error);
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

    const { userEmail, roomNo, bedIndex, amount, dueDate } =
      await request.json();

    // Validate required fields
    if (
      !userEmail ||
      !roomNo ||
      bedIndex === undefined ||
      !amount ||
      !dueDate
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Call the backend assign room API
    const response = await fetch(ASSIGN_ROOM_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userEmail,
        roomNo,
        bedIndex,
        amount,
        dueDate,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to assign room",
        },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error("Assign room API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Network error. Please try again.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);
    const { email, status } = await request.json();

    if (!email || !status) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const response = await fetch(UPDATE_STATUS_API, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, status }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to update user",
        },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error("Update user API error:", error);
    return NextResponse.json(
      { success: false, message: "Network error. Please try again." },
      { status: 500 },
    );
  }
}
