import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ThemeRegistry from "@/components/shared/ThemeRegistry";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Saraswati Lodge - Hostel Management System",
  description: "Modern web-based hostel and lodge management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
