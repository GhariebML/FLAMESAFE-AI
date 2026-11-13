import React from "react";
import Link from "next/link";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import {
  Flame,
  LayoutDashboard,
  Search,
  Scale,
  Compass,
  BotMessageSquare,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Orbit,
  BookOpen,
} from "lucide-react";

export default function HomePage() {
  const modules = [
    {
      title: "Mission Intelligence Dashboard",
      desc: "High-level overview of indexed NASA PSI combustion investigations, flight facilities, and domain distributions.",
      href: "/dashboard",
      icon: LayoutDashboard,
      badge: "Module 1",
    },
    {
      title: "Investigation Explorer",
      desc: "Search, filter, and inspect microgravity combustion programs including BASS, SAFFIRE, FLEX, SAME, and ACME.",
      href: "/investigations",
      icon: Search,
      badge: "Module 2",
    },
    {
      title: "Investigation Comparison",
      desc: "Cross-examine experimental setups, airflow quench limits, oxygen boundaries, and measurement sensors across multiple flight campaigns.",
      href: "/compare",
      icon: Scale,
      badge: "Module 3",
    },
    {
      title: "Scientific Relevance Ranking",
      desc: "Multi-factor weighted relevance ranking (R = 0.30D + 0.25F + 0.20C + 0.15M + 0.10Q) matching research to specific mission questions.",
      href: "/insights",
      icon: Sparkles,
      badge: "Module 4",
    },
    {
      title: "Mission Scenario Analyzer",
      desc: "Evaluate fire safety envelopes and research coverage across Spacecraft, Space Stations, Lunar Habitats, and Mars exploration regimes.",
      href: "/scenarios",
      icon: Compass,
      badge: "Module 5",
    },
    {
      title: "SI Research Assistant",
      desc: "Evidence-grounded RAG intelligence engine generating scientific answers with verified DOI and section citations.",
      href: "/assistant",
      icon: BotMessageSquare,
      badge: "Module 6",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-6">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Badge variant="flame" className="px-3 py-1 gap-1.5">
            <Flame className="h-3.5 w-3.5" /> 2026 NASA Space Apps Challenge · Cairo
          </Badge>
          <Badge variant="plasma">Team R²</Badge>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          FlameSafe <span className="text-flame-500">AI</span>
        </h1>

        <p className="text-lg sm:text-xl font-medium text-slate-300 max-w-2xl mx-auto">
          Turning Microgravity Combustion Research into Intelligent Fire Safety Insights.
        </p>

        <p className="text-sm text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Transforming complex NASA Physical Sciences Informatics (PSI) microgravity combustion data
          into accessible, structured, searchable, comparable, and explainable scientific knowledge
          for future human space exploration.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="primary" size="lg" className="gap-2">
              Launch Intelligence Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/assistant">
            <Button variant="secondary" size="lg" className="gap-2">
              Query SI Assistant <BotMessageSquare className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Target Investigation Groups Highlight */}
      <Card className="border-space-800 bg-space-900/40 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Orbit className="h-4 w-4 text-flame-400" />
            Target NASA Microgravity Investigation Groups
          </div>
          <Badge variant="outline">ISS & Cygnus Research</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
          <div className="p-3 rounded-lg bg-space-950/60 border border-space-800">
            <div className="font-bold text-flame-400">BASS / BASS-II</div>
            <div className="text-[10px] text-slate-400 mt-1">Solid Flammability</div>
          </div>
          <div className="p-3 rounded-lg bg-space-950/60 border border-space-800">
            <div className="font-bold text-plasma-400">SAFFIRE I-III</div>
            <div className="text-[10px] text-slate-400 mt-1">Vehicle-Scale Burns</div>
          </div>
          <div className="p-3 rounded-lg bg-space-950/60 border border-space-800">
            <div className="font-bold text-emerald-400">FLEX / FLEX-2</div>
            <div className="text-[10px] text-slate-400 mt-1">Cool Flames & Droplets</div>
          </div>
          <div className="p-3 rounded-lg bg-space-950/60 border border-space-800">
            <div className="font-bold text-amber-400">SAME / SAME-R</div>
            <div className="text-[10px] text-slate-400 mt-1">Smoke Particle Size</div>
          </div>
          <div className="p-3 rounded-lg bg-space-950/60 border border-space-800">
            <div className="font-bold text-indigo-400">ACME / CFI-G</div>
            <div className="text-[10px] text-slate-400 mt-1">Gaseous Flame Limits</div>
          </div>
        </div>
      </Card>

      {/* 6 Core Functional Modules Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-flame-400" /> System Architecture & Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link key={m.href} href={m.href} className="group">
                <Card className="h-full flex flex-col justify-between hover:border-flame-500/50 hover:bg-space-900 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-8 w-8 rounded-lg bg-space-800 flex items-center justify-center text-flame-400 group-hover:scale-105 transition-transform">
                        <Icon className="h-4 w-4" />
                      </div>
                      <Badge variant="outline">{m.badge}</Badge>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-flame-400 transition-colors">
                      {m.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">{m.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-space-800/80 flex items-center text-xs font-semibold text-flame-400 group-hover:translate-x-1 transition-transform">
                    Access Module <ArrowRight className="h-3 w-3 ml-1" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Scientific Integrity Advisory */}
      <Card className="border-amber-500/30 bg-amber-950/10 p-5 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="h-4 w-4" /> Scientific Traceability & Non-Endorsement Notice
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          FlameSafe AI is an independent academic and open-source hackathon prototype designed for the
          NASA Space Apps Challenge. It distinguishes between verified NASA experimental data, published
          findings, and analytical extrapolations. It does not fabricate findings and does not claim official
          NASA endorsement or certification.
        </p>
      </Card>
    </div>
  );
}
