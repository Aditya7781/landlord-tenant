"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  TextField,
  Button,
  Divider,
  Stack,
  IconButton,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  PhotoCamera as CameraIcon,
  Save as SaveIcon,
  Security as SecurityIcon,
  Notifications as NotificationIcon,
  CloudUpload as UploadIcon,
  Description as DocIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

interface ProfileContentProps {
  role: "admin" | "user";
}

const getCookieValue = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

interface AdminDetails {
  firstName: string;
  lastName: string;
  emailAddress: string;
  contactNo: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserDetails {
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  email?: string;
  contactNo?: string;
  permanentAddress?: string;
  address?: string;
  fatherName?: string;
  guardianContactNo?: string;
  emergencyContact?: string;
  role?: string;
  dateOfBirth?: string;
  education?: {
    highestQualification?: string;
    collegeOffice?: string;
    purposeOfLiving?: string;
  };
  documents?: {
    aadharFront?: string;
    aadharBack?: string;
    profilePhoto?: string;
    idProof?: string;
  };
  assignments?: Array<{
    amount: number;
    roomNo: string;
    bedName: string;
    assignedAt: string;
    dueDate: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
  registrationDate?: string;
  status?: string;
}

export default function ProfileContent({ role }: ProfileContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    fatherName: "",
    emergencyContact: "",
  });
  const [initialAdminFormData, setInitialAdminFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  } | null>(null);
  const [initialUserFormData, setInitialUserFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    fatherName: string;
    emergencyContact: string;
  } | null>(null);

  const normalizePhoneToBackend = (value: string): string | null => {
    // Accepts: "91-8888888888" OR "+91 88888 88888" OR "8888888888"
    const trimmed = (value || "").trim();
    if (!trimmed) return null;
    if (/^\d{2}-\d{10}$/.test(trimmed)) return trimmed;

    const digits = trimmed.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) {
      return `91-${digits.slice(2)}`;
    }
    if (digits.length === 10) {
      return `91-${digits}`;
    }
    return null;
  };

  useEffect(() => {
    const token = getCookieValue("session_token");
    if (!token) {
      setLoading(false);
      return;
    }

    if (role === "admin") {
      fetch("/api/admin/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.admin) {
            const admin: AdminDetails = data.admin;
            // Format contactNo: "91-8888888888" -> "+91 88888 88888"
            const formattedPhone = admin.contactNo
              ? admin.contactNo.replace(/^(\d{2})-(\d{5})(\d{5})$/, "+$1 $2 $3")
              : "";

            setFormData({
              firstName: admin.firstName || "",
              lastName: admin.lastName || "",
              email: admin.emailAddress || "",
              phone: formattedPhone,
              address: "",
              fatherName: "",
              emergencyContact: "",
            });
            setInitialAdminFormData({
              firstName: admin.firstName || "",
              lastName: admin.lastName || "",
              email: admin.emailAddress || "",
              phone: formattedPhone,
            });
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch admin details:", err);
          setLoading(false);
        });
    } else {
      // User profile - use /api/my endpoint
      fetch("/api/my?query=me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          
          // Handle the actual response structure: direct user data
          let userData = null;
          
          if (data.firstName || data.emailAddress || data.email) {
            // Direct user data structure (what we're actually getting)
            userData = data;
          } else if (data.success && data.user) {
            // Expected structure: { success: true, user: {...} }
            userData = data.user;
          } else if (data.user) {
            // Alternative structure: { user: {...} }
            userData = data.user;
          } else if (data.data && (data.data.firstName || data.data.emailAddress)) {
            // Nested structure: { data: { firstName: "...", emailAddress: "...", ... } }
            userData = data.data;
          }
          
          if (userData) {
            const user: UserDetails = userData;
            // Format contactNo if it exists
            const formattedPhone = user.contactNo
              ? user.contactNo.replace(/^(\d{2})?(\d{5})(\d{5})$/, user.contactNo.length === 10 ? "+91 $2 $3" : "+$1 $2 $3")
              : "";

            setFormData({
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              email: user.emailAddress || user.email || "",
              phone: formattedPhone,
              address: user.permanentAddress || "",
              fatherName: user.fatherName || "",
              emergencyContact: user.guardianContactNo || "",
            });
            setInitialUserFormData({
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              email: user.emailAddress || user.email || "",
              phone: formattedPhone,
              address: user.permanentAddress || "",
              fatherName: user.fatherName || "",
              emergencyContact: user.guardianContactNo || "",
            });
          } else {
            console.error("API returned error or unexpected structure:", data?.message || "Unknown error");
            console.error("Full response structure:", data);
            // Show user-friendly error message
            if (data?.message) {
              console.error("User profile error:", data.message);
            }
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch user details:", err);
          setLoading(false);
        });
    }
  }, [role]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (role !== "admin") {
      setIsEditing(false);
      alert("Profile updated successfully!");
      return;
    }

    if (!initialAdminFormData) {
      alert("Admin profile is not loaded yet. Please try again.");
      return;
    }

    const token = getCookieValue("session_token");
    if (!token) {
      alert("No authentication token found");
      return;
    }

    const updatePayload: Record<string, string> = {};

    if (formData.firstName !== initialAdminFormData.firstName) {
      updatePayload.firstName = formData.firstName;
    }
    if (formData.lastName !== initialAdminFormData.lastName) {
      updatePayload.lastName = formData.lastName;
    }
    if (formData.email !== initialAdminFormData.email) {
      updatePayload.emailAddress = formData.email;
    }
    if (formData.phone !== initialAdminFormData.phone) {
      const normalized = normalizePhoneToBackend(formData.phone);
      if (!normalized) {
        alert(
          'Invalid phone number. Use 10 digits or format like "+91 88888 88888".',
        );
        return;
      }
      updatePayload.contactNo = normalized;
    }

    if (Object.keys(updatePayload).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "Failed to update admin profile");
        return;
      }

      // Update local baseline so further edits diff correctly
      const nextPhone = updatePayload.contactNo
        ? updatePayload.contactNo.replace(
            /^(\d{2})-(\d{5})(\d{5})$/,
            "+$1 $2 $3",
          )
        : formData.phone;

      const nextBaseline = {
        firstName: updatePayload.firstName ?? formData.firstName,
        lastName: updatePayload.lastName ?? formData.lastName,
        email: updatePayload.emailAddress ?? formData.email,
        phone: nextPhone,
      };
      setInitialAdminFormData(nextBaseline);
      setFormData((prev) => ({ ...prev, ...nextBaseline }));

      setIsEditing(false);
    } catch (e) {
      console.error("Failed to update admin profile:", e);
      alert("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        My Profile
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Manage your personal information and account settings
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{ p: 4, borderRadius: 5, textAlign: "center", height: "100%" }}
          >
            <Box sx={{ position: "relative", display: "inline-block", mb: 3 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: "primary.main",
                  fontSize: "3rem",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                }}
              >
                {loading
                  ? ""
                  : role === "admin"
                    ? `${formData.firstName[0] || "A"}${formData.lastName[0] || "D"}`.toUpperCase()
                    : "SR"}
              </Avatar>
              <IconButton
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  bgcolor: "background.paper",
                  boxShadow: 2,
                  "&:hover": { bgcolor: "action.hover" },
                }}
                size="small"
                component="label"
              >
                <CameraIcon fontSize="small" />
                <input type="file" hidden accept="image/*" />
              </IconButton>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {formData.firstName} {formData.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {role === "admin"
                ? "Hazaribagh Headquarters"
                : "Tenant"}
            </Typography>
            <Chip
              label={role.toUpperCase()}
              size="small"
              color={role === "admin" ? "secondary" : "primary"}
              sx={{ mt: 1, fontWeight: 700, borderRadius: 1.5 }}
            />

            <Divider sx={{ my: 4 }} />

            <Stack spacing={2} sx={{ textAlign: "left" }}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Email Address
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formData.email}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Phone Number
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formData.phone}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Edit Form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 4, borderRadius: 5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Account Details
              </Typography>
              {/* {!isEditing && !loading && (
                <Button
                  startIcon={<EditIcon />}
                  size="small"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )} */}
            </Box>

            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 8,
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Grid>
                {role === "user" && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Permanent Address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        multiline
                        rows={2}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Father's Name"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Emergency Contact"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            )}

            {isEditing && !loading && (
              <>
                <Divider sx={{ my: 4 }} />
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
                >
                  <Button
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{ borderRadius: 2, px: 4 }}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </Box>
              </>
            )}
          </Paper>

          {/* Security Settings */}
          {/* <Paper sx={{ p: 4, borderRadius: 5, mt: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Security & Privacy
            </Typography>
            <Stack spacing={3}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <SecurityIcon color="action" />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Change Password
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Update your account password regularly
                    </Typography>
                  </Box>
                </Box>
                <Button variant="outlined" size="small">
                  Update
                </Button>
              </Box>
              <Divider />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <NotificationIcon color="action" />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Email Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive monthly bill alerts on email
                    </Typography>
                  </Box>
                </Box>
                <Button variant="text" color="primary">
                  Configure
                </Button>
              </Box>
            </Stack>
          </Paper> */}

          {/* Document Management Section - User Only */}
          {role === "user" && (
            <Paper sx={{ p: 4, borderRadius: 5, mt: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 4,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  My Documents (KYC)
                </Typography>
                {/* <Button
                  component="label"
                  startIcon={<UploadIcon />}
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  Upload New
                  <input type="file" hidden />
                </Button> */}
              </Box>

              <Stack spacing={2}>
                {[
                  {
                    name: "Aadhaar Card Front",
                    status: "Verified",
                    date: "Oct 12, 2023",
                  },
                  {
                    name: "Aadhaar Card Back",
                    status: "Verified",
                    date: "Oct 12, 2023",
                  },
                  {
                    name: "College ID / Office ID",
                    status: "Pending",
                    date: "Oct 14, 2023",
                  },
                ].map((doc, i) => (
                  <Paper
                    key={i}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      bgcolor: "action.hover",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: "primary.light",
                          color: "white",
                        }}
                      >
                        <DocIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {doc.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded on {doc.date}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={doc.status}
                        size="small"
                        color={
                          doc.status === "Verified" ? "success" : "warning"
                        }
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          fontWeight: 800,
                        }}
                      />
                      <IconButton size="small" title="View">
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      {/* <IconButton
                        size="small"
                        component="label"
                        title="Edit Document"
                      >
                        <EditIcon fontSize="small" color="primary" />
                        <input type="file" hidden />
                      </IconButton>
                      <IconButton size="small" color="error" title="Delete">
                        <DeleteIcon fontSize="small" />
                      </IconButton> */}
                    </Box>
                  </Paper>
                ))}
              </Stack>

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: "info.main",
                  color: "white",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box sx={{ fontSize: 24 }}>💡</Box>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Keep your documents updated to ensure uninterrupted access to
                  lodge facilities and valid resident status.
                </Typography>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
