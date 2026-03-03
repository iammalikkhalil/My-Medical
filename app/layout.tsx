import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { GlobalNavigationLoaderProvider } from "@/components/navigation/global-navigation-loader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "💊MediTrack",
  description: "Personal Medical Kit and Illness Journal",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <GlobalNavigationLoaderProvider>{children}</GlobalNavigationLoaderProvider>
      </body>
    </html>
  );
}
