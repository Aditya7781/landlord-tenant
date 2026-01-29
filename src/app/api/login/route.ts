import { NextRequest, NextResponse } from "next/server";

const LOGIN_API =
  "https://7ytieg0nh8.execute-api.ap-south-1.amazonaws.com/dev/login";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Call the backend login API
    const response = await fetch(LOGIN_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Return the backend response
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Login failed",
        },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Network error. Please try again.",
      },
      { status: 500 },
    );
  }
}
