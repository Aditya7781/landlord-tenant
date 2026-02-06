import { NextRequest, NextResponse } from "next/server";

const SEND_ANNOUNCEMENT_API = "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/send_announcement";
const DELETE_ANNOUNCEMENT_API = "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/delete_announcement";

export async function POST(request: NextRequest) {
  console.log("[api/admin/announcements] POST route called!");
  
  try {
    const authHeader = request.headers.get("authorization");
    console.log("[api/admin/announcements] Auth header:", authHeader ? "Present" : "Missing");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[api/admin/announcements] Invalid auth header format");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log("[api/admin/announcements] Token extracted, length:", token.length);

    // Parse request body
    const body = await request.json();
    console.log("[api/admin/announcements] Request body:", body);

    const { title, message } = body;

    // Validate required fields
    if (!title || !message) {
      console.log("[api/admin/announcements] Missing required fields:", { title: !!title, message: !!message });
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
    console.log("[api/admin/announcements] Backend response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log("[api/admin/announcements] Backend error response:", errorText);
      return NextResponse.json(
        {
          success: false,
          message: `Backend API error (${response.status}): ${errorText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[api/admin/announcements] Backend response:", data);

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
  console.log("[api/admin/announcements] DELETE route called!");
  
  try {
    const authHeader = request.headers.get("authorization");
    console.log("[api/admin/announcements] Auth header:", authHeader ? "Present" : "Missing");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[api/admin/announcements] Invalid auth header format");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log("[api/admin/announcements] Token extracted, length:", token.length);

    // Parse request body to get announcement ID
    const body = await request.json();
    console.log("[api/admin/announcements] Request body:", body);

    const { id } = body;

    // Validate required fields
    if (!id) {
      console.log("[api/admin/announcements] Missing announcement ID");
      return NextResponse.json(
        { success: false, message: "Announcement ID is required" },
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
        id,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log("[api/admin/announcements] Backend response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log("[api/admin/announcements] Backend error response:", errorText);
      return NextResponse.json(
        {
          success: false,
          message: `Backend API error (${response.status}): ${errorText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[api/admin/announcements] Backend response:", data);

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
