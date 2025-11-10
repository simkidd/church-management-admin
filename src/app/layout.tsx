import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/Providers";
import { config } from "@/utils/config";
import { Suspense } from "react";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import PageLoader from "@/components/shared/Loading";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: config.SITE_NAME,
  description: config.SITE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader color="var(--primary)" showSpinner={false} />
        <Providers>
          <Suspense fallback={<PageLoader />}>{children}</Suspense>
          <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
            swipeDirections={["top", "left", "right"]}
          />
        </Providers>
      </body>
    </html>
  );
}
