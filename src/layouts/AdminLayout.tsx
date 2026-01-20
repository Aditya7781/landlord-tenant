"use client";

import React from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Hotel as HotelIcon,
  Payment as PaymentIcon,
  Announcement as AnnouncementIcon,
} from "@mui/icons-material";

const adminMenuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
  { text: "User Management", icon: <PeopleIcon />, path: "/admin/users" },
  { text: "Room & Bed", icon: <HotelIcon />, path: "/admin/rooms" },
  { text: "Payments", icon: <PaymentIcon />, path: "/admin/payments" },
  //{ text: 'Dashboard Config', icon: <AnnouncementIcon />, path: '/admin/config' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout menuItems={adminMenuItems} title="Admin Portal">
      {children}
    </DashboardLayout>
  );
}
