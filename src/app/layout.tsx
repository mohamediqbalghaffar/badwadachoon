import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "بەدواداچوون",
  description: "Dashboard for Tracking/Follow-up",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ku" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-200 dark:selection:bg-blue-800">
        {children}
      </body>
    </html>
  );
}
