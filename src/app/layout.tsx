import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Data Analyst Portfolio",
  description: "Professional portfolio of a Data Analyst",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // HTML lang is managed client side to avoid layout issues but set to en default here
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
