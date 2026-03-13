import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ISO Reasoning Dashboard",
  description: "3-step AI reasoning engine for ISO merchant analysis"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}

