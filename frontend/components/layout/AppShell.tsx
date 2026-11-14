"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { SpaceMotionBackground } from "./SpaceMotionBackground";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { AstroFlameCompanion } from "@/components/assistant/AstroFlameCompanion";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <div className="relative min-h-screen flex flex-col text-[#F7F7F5] bg-[#080A0F] min-w-0">
      <SpaceMotionBackground />

      <div className="relative z-10 flex flex-col min-h-screen min-w-0">
        {/* Unified Top Navigation Bar across all pages */}
        <Navbar isLanding={isLanding} />

        <div className="flex flex-1 min-w-0 w-full">
          <main className="flex-1 min-w-0 w-full flex flex-col">
            <div
              className={
                isLanding
                  ? "flex-1 min-w-0 w-full"
                  : "flex-1 min-w-0 w-full max-w-[90rem] mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9"
              }
            >
              <ErrorBoundary>{children}</ErrorBoundary>
            </div>
            <Footer />
          </main>
        </div>
      </div>

      {/* Global Floating Astro-Flame Research Companion */}
      <AstroFlameCompanion />
    </div>
  );
};

export const DashboardLayout = AppShell;
