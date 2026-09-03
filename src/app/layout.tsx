import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Pulse",
  description: "Noel's site analytics.",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    title: "Pulse",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${instrument.variable} antialiased`}>
      <body className="min-h-screen text-slate-100">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
