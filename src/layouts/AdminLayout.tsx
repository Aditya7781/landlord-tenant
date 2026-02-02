"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Hotel as HotelIcon,
  Payment as PaymentIcon,
  Campaign as CampaignIcon,
  Notifications as NotificationIcon,
} from "@mui/icons-material";

const adminMenuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
  { text: "User Management", icon: <PeopleIcon />, path: "/admin/users" },
  { text: "Room & Bed", icon: <HotelIcon />, path: "/admin/rooms" },
  { text: "Payments", icon: <PaymentIcon />, path: "/admin/payments" },
  { text: "Announcements", icon: <CampaignIcon />, path: "/admin/announcements" },
  { text: "Notifications", icon: <NotificationIcon />, path: "/admin/notifications" },
];

const DashboardLayout = dynamic(
  () => import("@/components/shared/DashboardLayout"),
  { ssr: false },
);

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
