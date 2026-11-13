import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "FlameSafe AI | Microgravity Combustion Intelligence",
  description:
    "AI-Powered Scientific Research & Fire Safety Intelligence Platform for NASA Microgravity Combustion Data. 2026 NASA Space Apps Challenge (Team R²).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
