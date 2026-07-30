import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "BazarProtikhon - ক্যাশব্যাক লয়্যালটি সিস্টেম",
  description: "অফলাইন বেচাকেনা-ভিত্তিক ক্যাশব্যাক ম্যানেজমেন্ট প্ল্যাটফর্ম",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased min-h-screen"
        style={{ fontFamily: "'Hind Siliguri', 'Segoe UI', sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
