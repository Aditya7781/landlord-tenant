import { NextRequest, NextResponse } from "next/server";

const GET_USER_INFO_API =
  "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/get_user_info";

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

    // Get email query parameter
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email parameter is required" },
        { status: 400 },
      );
    }

    // Call the backend get user info API with email as query param
    const apiUrl = `${GET_USER_INFO_API}?email=${encodeURIComponent(email)}`;
    const response = await fetch(apiUrl, {
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
          message: data.message || "Failed to fetch user info",
        },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error("Get user info API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Network error. Please try again.",
      },
      { status: 500 },
    );
  }
}

