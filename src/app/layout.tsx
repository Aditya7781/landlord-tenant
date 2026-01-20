import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ThemeRegistry from "@/components/shared/ThemeRegistry";
import EmotionCacheProvider from "@/lib/emotion-cache";
import { HostelProvider } from "@/context/HostelContext";
import { mockApi } from "@/services/mockApi";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Saraswati Lodge - Hostel Management System",
  description: "Modern web-based hostel and lodge management system",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const rooms = await mockApi.getRooms();
  const users = await mockApi.getUsers();

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 🔴 Emotion MUST be outermost */}
        <EmotionCacheProvider>
          <ThemeRegistry>
            <HostelProvider initialRooms={rooms} initialUsers={users}>
              {children}
            </HostelProvider>
          </ThemeRegistry>
        </EmotionCacheProvider>
      </body>
    </html>
  );
}
