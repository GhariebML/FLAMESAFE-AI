"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div
      role="tablist"
      aria-label="Content view selector"
      className={cn(
        "inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-brand-soft/80 dark:bg-space-950 border border-space-800",
        className
      )}
    >
      {tabs.map((tab) => {
        const isSelected = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isSelected}
            onClick={() => onChange(tab.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
              isSelected
                ? "bg-white dark:bg-space-900 text-brand-blue dark:text-brand-light-cyan border border-brand-blue/25 dark:border-brand-light-cyan/30 shadow-sm font-semibold"
                : "text-fg-muted hover:text-fg-primary hover:bg-white/60 dark:hover:bg-space-900/60"
            )}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-md text-[10px] font-mono",
                  isSelected
                    ? "bg-brand-blue/10 text-brand-blue dark:text-brand-light-cyan"
                    : "bg-space-800/70 text-fg-muted"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
