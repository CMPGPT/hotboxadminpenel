import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/lib/query-client";


const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: [
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
  ],
});

export const metadata: Metadata = {
  title: "HotBox Super Admin",
  description: "Super Admin Panel for HotBox",
  icons: {
    icon: "/icon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} antialiased min-h-screen bg-background text-foreground`}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
