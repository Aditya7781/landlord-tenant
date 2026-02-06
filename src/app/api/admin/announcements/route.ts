import { NextRequest, NextResponse } from "next/server";

const SEND_ANNOUNCEMENT_API = "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/send_announcement";
const DELETE_ANNOUNCEMENT_API = "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/delete_annoucement";

export async function POST(request: NextRequest) {
  
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Parse request body
    const body = await request.json();

    const { title, message } = body;

    // Validate required fields
    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: "Title and message are required" },
        { status: 400 }
      );
    }

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(SEND_ANNOUNCEMENT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        message,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          success: false,
          message: `Backend API error (${response.status}): ${errorText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: "Announcement created successfully",
      data
    });

  } catch (error) {
    console.error("Create announcement API error:", error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          {
            success: false,
            message: "Request timeout. Please try again.",
          },
          { status: 408 }
        );
      }
      
      if (error.message.includes('Failed to fetch')) {
        return NextResponse.json(
          {
            success: false,
            message: "Network error. Unable to connect to announcement service. Please check your connection and try again.",
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Parse request body to get announcement SK
    const body = await request.json();

    const { sk } = body;

    // Validate required fields
    if (!sk) {
      return NextResponse.json(
        { success: false, message: "Announcement SK is required" },
        { status: 400 }
      );
    }

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(DELETE_ANNOUNCEMENT_API, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sk,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          success: false,
          message: `Backend API error (${response.status}): ${errorText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: "Announcement deleted successfully",
      data
    });

  } catch (error) {
    console.error("Delete announcement API error:", error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          {
            success: false,
            message: "Request timeout. Please try again.",
          },
          { status: 408 }
        );
      }
      
      if (error.message.includes('Failed to fetch')) {
        return NextResponse.json(
          {
            success: false,
            message: "Network error. Unable to connect to announcement service. Please check your connection and try again.",
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
