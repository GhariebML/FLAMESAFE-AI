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

const NAV_GROUPS = [
  {
    group: "EXPLORE",
    items: [
      { label: "Home", href: "/", icon: Sparkles, exact: true },
      { label: "Investigations", href: "/investigations", icon: FlaskConical },
    ],
  },
  {
    group: "WORKSPACE",
    items: [
      { label: "Mission Control", href: "/dashboard", icon: Compass },
      { label: "AI Lab", href: "/research", icon: Cpu },
      { label: "Data Observatory", href: "/compare", icon: Scale },
    ],
  },
  {
    group: "INTELLIGENCE",
    items: [
      { label: "Decision Lab", href: "/scenarios", icon: ShieldAlert },
      { label: "Insights", href: "/insights", icon: Lightbulb },
      { label: "Evidence", href: "/evidence", icon: BookOpenCheck },
    ],
  },
];

const TOP_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

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

  const openAstroFlameCompanion = () => {
    window.dispatchEvent(new CustomEvent("flamesafe:open-companion"));
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#080A0F]/92 border-b border-[#283340] backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.65)] transition-colors">
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

        {/* Center: Unified Top Navigation Bar with Subtle Group Dividers */}
        <nav
          aria-label="Primary site navigation"
          className="hidden lg:flex items-center gap-1 xl:gap-1.5 bg-[#10151D]/95 border border-[#283340] rounded-full px-2.5 py-1 text-[12.5px] font-semibold text-[#A1A8B3] min-w-0 shadow-inner"
        >
          {NAV_GROUPS.map((group, groupIdx) => (
            <React.Fragment key={group.group}>
              {groupIdx > 0 && (
                <span
                  aria-hidden="true"
                  className="h-4 w-px bg-[#283340] mx-0.5 shrink-0"
                />
              )}
              {group.items.map((item) => {
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
                        ? "bg-[#1C2633] text-[#F7F7F5] border border-[#FF6B24]/60 shadow-[0_0_16px_rgba(255,107,36,0.22)]"
                        : "hover:text-[#F7F7F5] hover:bg-[#151D27] border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 ${
                        active ? "text-[#FF6B24]" : "text-[#778495]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </React.Fragment>
          ))}
        </nav>

        {/* Right: AI Verified Dot + Start Mission CTA + Astro-Flame Companion Trigger */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isVerifiedLive && (
            <Link
              href="/research"
              className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-[#22C55E]/40 bg-[#22C55E]/10 px-2.5 py-1 text-[11px] font-semibold text-[#22C55E] whitespace-nowrap"
              title={`Verified AI Runtime: ${aiStatus?.generation_model}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse shrink-0" />
              <span>AI Active</span>
            </Link>
          )}

          <Link
            href="/research"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF6B24] to-[#E94B16] hover:from-[#FF8040] hover:to-[#FF6B24] text-white keep-white px-4 py-1.5 text-xs font-bold transition-all shadow-[0_4px_18px_rgba(255,107,36,0.38)] whitespace-nowrap"
          >
            <span>Start Mission</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
          </Link>

          <button
            type="button"
            onClick={openAstroFlameCompanion}
            title="Ask Astro-Flame AI Companion"
            aria-label="Open Astro-Flame AI Companion"
            className="group relative h-9 w-9 rounded-full border-2 border-[#39B9EB]/75 hover:border-[#FF6B24] overflow-hidden transition-transform hover:scale-105 shrink-0 shadow-[0_0_14px_rgba(57,185,235,0.35)] bg-[#10151D]"
          >
            <img
              src="/images/story/mascot-avatar.webp"
              alt="Astro-Flame AI Companion"
              className="h-full w-full object-cover"
            />
          </button>

          {/* Mobile & Tablet Top Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle top navigation menu"
            className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl border border-[#283340] bg-[#10151D] text-[#F7F7F5] hover:border-[#FF6B24] transition-colors shrink-0"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Grouped Top Dropdown Menu for Mobile / Tablet */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#283340] bg-[#080A0F]/98 backdrop-blur-xl px-4 py-4 shadow-2xl space-y-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.group}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#778495] mb-1.5 px-1">
                {group.group}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {group.items.map((item) => {
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
                          ? "bg-[#1C2633] text-[#F7F7F5] border border-[#FF6B24]/60"
                          : "bg-[#10151D] text-[#A1A8B3] border border-[#283340] hover:text-[#F7F7F5]"
                      }`}
                    >
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 ${
                          active ? "text-[#FF6B24]" : "text-[#39B9EB]"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="pt-1 border-t border-[#283340] flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openAstroFlameCompanion();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#151D27] text-[#FFB547] border border-[#FF6B24]/40 hover:text-[#F7F7F5]"
            >
              <MessageSquare className="h-3.5 w-3.5 text-[#FF6B24] shrink-0" />
              <span>Ask Astro-Flame Companion</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export const TopNavigation = Navbar;
