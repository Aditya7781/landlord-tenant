"use client";

import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Link,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff, Email } from "@mui/icons-material";
import AuthLayout from "@/layouts/AuthLayout";
import { useRouter } from "next/navigation";
import { setSession } from "@/utils/auth-utils";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch(
        "https://7ytieg0nh8.execute-api.ap-south-1.amazonaws.com/dev/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        // Store session using auth utils (includes cookie/token handling)
        setSession(
          {
            id: data.user.id || email, // Use email as fallback ID
            email: email, // Use email from form since it's not in user object
            role: data.user.role,
            name: data.user.name || email.split("@")[0], // Use email prefix as fallback name
          },
          data.token,
        );

        // Redirect based on role
        if (data.user.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          // Both 'user' and 'tenant' roles go to user dashboard
          router.push("/user/dashboard");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log in to manage your lodge experience"
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email color="action" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          id="password"
          autoComplete="current-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ mt: 3, mb: 2, height: 48 }}
        >
          {loading ? "Logging in..." : "Sign In"}
        </Button>
        <Box sx={{ textAlign: "center" }}>
          <Link
            href="/register"
            variant="body2"
            sx={{ fontWeight: 600, textDecoration: "none" }}
          >
            {"Don't have an account? Sign Up"}
          </Link>
        </Box>
      </Box>
    </AuthLayout>
  );
}
