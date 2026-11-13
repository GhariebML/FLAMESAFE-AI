"use client";

import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-space-950 text-fg-primary flex flex-col font-sans selection:bg-blue-500/30 overflow-x-hidden transition-colors">
      <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      <div className="flex-1 flex min-w-0">
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        <main className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-6 lg:p-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
      <Footer />
    </div>
  );
};
