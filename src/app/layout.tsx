import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import ToastClient from '@/components/ToastClient';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { openSans } from "@/app/fonts";


export const metadata: Metadata = {
  title: "TripCraft",
  description: "AI-Powered Travel Itinerary Generator. Plan your perfect trip with ease. Just enter your dream destination, and let our AI create a personalized itinerary for you. Start your adventure today!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${openSans.variable}} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ToastClient />
        </ThemeProvider>
      </body>
    </html>
  );
}
