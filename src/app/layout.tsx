import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Pulse",
  description: "Noel's site analytics.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${instrument.variable} antialiased`}>
      <body className="min-h-screen text-slate-100">{children}</body>
    </html>
  );
}
