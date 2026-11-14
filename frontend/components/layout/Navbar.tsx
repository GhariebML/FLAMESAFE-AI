"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Compass,
  FlaskConical,
  Cpu,
  Scale,
  ShieldAlert,
  Lightbulb,
  BookOpenCheck,
  MessageSquare,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { apiClient } from "@/lib/api/client";
import type { AIRuntimeStatus } from "@/types/research";

interface NavbarProps {
  onOpenMobileMenu?: () => void;
  isLanding?: boolean;
}

const TOP_NAV_ITEMS = [
  { label: "Home", href: "/", icon: Sparkles, exact: true },
  { label: "Mission Control", href: "/dashboard", icon: Compass },
  { label: "Investigations", href: "/investigations", icon: FlaskConical },
  { label: "AI Lab", href: "/research", icon: Cpu },
  { label: "Data Observatory", href: "/compare", icon: Scale },
  { label: "Decision Lab", href: "/scenarios", icon: ShieldAlert },
  { label: "Insights", href: "/insights", icon: Lightbulb },
  { label: "Evidence", href: "/evidence", icon: BookOpenCheck },
];

export const Navbar: React.FC<NavbarProps> = () => {
  const pathname = usePathname();
  const [aiStatus, setAiStatus] = useState<AIRuntimeStatus | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    apiClient
      .getAIStatus(false)
      .then((res) => {
        if (mounted) setAiStatus(res);
      })
      .catch(() => {
        if (mounted) setAiStatus(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const isVerifiedLive = Boolean(
    aiStatus &&
      aiStatus.configured &&
      aiStatus.connected &&
      !aiStatus.is_mock_provider &&
      aiStatus.provider === "gemini"
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-[#040814]/95 border-b border-[#1E3A6E]/80 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.65)] transition-colors">
      <div className="h-16 max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 min-w-0">
        {/* Left: Official Brand Logo */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <BrandLogo
            size="sm"
            href="/"
            surface="light"
            className="ring-1 ring-[#39B9EB]/35 shadow-sm"
          />
        </div>

        {/* Center: Unified Top Navigation Bar (No Side Menu) */}
        <nav
          aria-label="Primary site navigation"
          className="hidden lg:flex items-center gap-1 xl:gap-1.5 bg-[#081228]/90 border border-[#1E3A6E]/75 rounded-full px-2 py-1 text-[12.5px] font-semibold text-[#B4C6E4] min-w-0 shadow-inner"
        >
          {TOP_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                  active
                    ? "bg-gradient-to-r from-[#122B59] to-[#0E2248] text-white border border-[#39B9EB]/60 shadow-[0_0_16px_rgba(57,185,235,0.28)]"
                    : "hover:text-white hover:bg-[#0D1C3A]/80 border border-transparent"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 shrink-0 ${
                    active ? "text-[#39B9EB]" : "text-[#7A94B8]"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: AI Verified Dot + Start Mission CTA + Astro-Flame Bot Avatar */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isVerifiedLive && (
            <Link
              href="/research"
              className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 whitespace-nowrap"
              title={`Verified AI Runtime: ${aiStatus?.generation_model}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>AI Active</span>
            </Link>
          )}

          <Link
            href="/research"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF7A18] to-[#E94B16] hover:from-[#FF8B33] hover:to-[#FF6B24] text-white keep-white px-4 py-1.5 text-xs font-bold transition-all shadow-[0_4px_18px_rgba(255,122,24,0.4)] whitespace-nowrap"
          >
            <span>Start Mission</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
          </Link>

          <Link
            href="/assistant"
            title="Ask Astro-Flame AI Companion"
            className={`group relative h-9 w-9 rounded-full border-2 overflow-hidden transition-transform hover:scale-105 shrink-0 ${
              pathname === "/assistant"
                ? "border-[#FF7A18] shadow-[0_0_16px_rgba(255,122,24,0.55)]"
                : "border-[#39B9EB]/75 shadow-[0_0_14px_rgba(57,185,235,0.4)]"
            } bg-[#071226]`}
          >
            <img
              src="/images/story/mascot-avatar.png"
              alt="Astro-Flame AI Companion"
              className="h-full w-full object-cover"
            />
          </Link>

          {/* Mobile & Tablet Top Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle top navigation menu"
            className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl border border-[#1E3A6E] bg-[#0A1428] text-white hover:border-[#FF7A18] transition-colors shrink-0"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Top Dropdown Menu for Mobile / Tablet (Always at Top, Never a Side Panel) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#1E3A6E] bg-[#050C1C]/98 backdrop-blur-xl px-4 py-3.5 shadow-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TOP_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-[#122B59] text-white border border-[#39B9EB]/60"
                      : "bg-[#09142A]/80 text-[#B4C6E4] border border-[#1E3A6E]/40 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 text-[#39B9EB] shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
            <Link
              href="/assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#09142A]/80 text-[#FFB547] border border-[#FF7A18]/40 hover:text-white"
            >
              <MessageSquare className="h-3.5 w-3.5 text-[#FF7A18] shrink-0" />
              <span className="truncate">AI Companion</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export const TopNavigation = Navbar;
