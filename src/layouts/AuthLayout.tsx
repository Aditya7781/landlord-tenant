"use client";

import React from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import dynamic from "next/dynamic";

/* 👇 client-only motion.div */
const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false },
);

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            }}
          >
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 700 }}
              >
                {title}
              </Typography>

              {subtitle && (
                <Typography variant="body1" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>

            {children}
          </Paper>
        </MotionDiv>
      </Container>
    </Box>
  );
}
