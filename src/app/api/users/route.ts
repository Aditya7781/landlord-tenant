import { NextRequest, NextResponse } from "next/server";

const USERS_API =
  "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/get_user_for_usermanagement";

const ASSIGN_ROOM_API =
  "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/assign_room";

const UPDATE_STATUS_API =
  "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/edit_user_from_admin";

const PRESIGNED_IMAGE_API =
  "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/create_presigned_for_edit_image_from_admin";

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
    const formData = await request.formData();
    
    // Extract all user fields from form data
    const email = formData.get('email') as string;
    const status = formData.get('status') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const fatherName = formData.get('fatherName') as string;
    const motherName = formData.get('motherName') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const permanentAddress = formData.get('permanentAddress') as string;
    const password = formData.get('password') as string;
    const contactNo = formData.get('contactNo') as string;
    const guardianContactNo = formData.get('guardianContactNo') as string;
    const highestQualification = formData.get('highestQualification') as string;
    const collegeOffice = formData.get('collegeOffice') as string;
    const purposeOfLiving = formData.get('purposeOfLiving') as string;
    const profileImage = formData.get('profileImage') as File;

    if (!email || !status) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: email and status" },
        { status: 400 },
      );
    }

    let profileImageUrl = null;

    // Handle profile image upload if provided
    if (profileImage && profileImage.size > 0) {
      try {
        console.log('Starting image upload for:', email);
        
        // Get presigned URL from API
        const presignedResponse = await fetch(PRESIGNED_IMAGE_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email,
            documentField: 'profilePhoto',
          }),
        });

        if (!presignedResponse.ok) {
          const errorData = await presignedResponse.text();
          console.error('Presigned URL Error:', errorData);
          throw new Error(`Failed to get presigned URL: ${presignedResponse.status}`);
        }

        const presignedData = await presignedResponse.json();
        console.log('Presigned URL received:', presignedData);
        
        // Upload image to S3 using presigned URL
        const uploadResponse = await fetch(presignedData.upload.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': profileImage.type,
          },
          body: profileImage,
          mode: 'cors',
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('S3 Upload Error:', {
            status: uploadResponse.status,
            statusText: uploadResponse.statusText,
            body: errorText,
            url: presignedData.upload.uploadUrl,
            contentType: profileImage.type,
            fileSize: profileImage.size
          });
          throw new Error(`Failed to upload image: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }

        console.log('Upload successful, URL:', presignedData.upload.publicUrl);
        profileImageUrl = presignedData.upload.publicUrl;
      } catch (error) {
        console.error('Image upload failed, continuing with other fields:', error);
        // Don't fail the entire operation if image upload fails
        // Just log the error and continue without updating the image
        profileImageUrl = null;
      }
    }

    // Prepare user update data
    const updateData: any = {
      email,
      status,
    };

    // Add optional fields if provided
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (fatherName) updateData.fatherName = fatherName;
    if (motherName) updateData.motherName = motherName;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (permanentAddress) updateData.permanentAddress = permanentAddress;
    if (password) updateData.password = password;
    if (contactNo) updateData.contactNo = contactNo;
    if (guardianContactNo) updateData.guardianContactNo = guardianContactNo;
    if (highestQualification) updateData.highestQualification = highestQualification;
    if (collegeOffice) updateData.collegeOffice = collegeOffice;
    if (purposeOfLiving) updateData.purposeOfLiving = purposeOfLiving;
    if (profileImageUrl) updateData.documents = { 
      ...updateData.documents,
      profilePhoto: profileImageUrl 
    };

    const response = await fetch(UPDATE_STATUS_API, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
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
