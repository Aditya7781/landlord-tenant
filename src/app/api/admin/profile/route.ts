import { NextRequest, NextResponse } from "next/server";

const GET_ADMIN_DETAILS_API =
  "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/get_admin_details";

const EDIT_ADMIN_INFO_API =
  "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/edit_admin_info";

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

    // Call the backend admin details API
    const response = await fetch(GET_ADMIN_DETAILS_API, {
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
          message: data.message || "Failed to fetch admin details",
        },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error("Admin details API error:", error);
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
    const payload = await request.json();

    const response = await fetch(EDIT_ADMIN_INFO_API, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { success: false, message: data.message || "Failed to update admin info" },
      { status: response.status },
    );
  } catch (error) {
    console.error("Edit admin info API error:", error);
    return NextResponse.json(
      { success: false, message: "Network error. Please try again." },
      { status: 500 },
    );
  }
}

