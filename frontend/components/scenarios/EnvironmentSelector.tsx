"use client";

import React from "react";
import { SPACE_ENVIRONMENTS, SpaceEnvironment } from "@/lib/constants/environments";
import { StatusBadge } from "@/components/shared/Badge";
import { Rocket, Moon, Globe } from "lucide-react";

interface SelectorProps {
  selectedEnvironment: string;
  onSelect: (env: SpaceEnvironment) => void;
}

export const EnvironmentSelector: React.FC<SelectorProps> = ({
  selectedEnvironment,
  onSelect,
}) => {
  const getIcon = (id: string) => {
    if (id.includes("lunar")) return Moon;
    if (id.includes("mars")) return Globe;
    return Rocket;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {SPACE_ENVIRONMENTS.map((env) => {
        const Icon = getIcon(env.id);
        const isSelected = selectedEnvironment === env.name;

        return (
          <button
            type="button"
            key={env.id}
            onClick={() => onSelect(env)}
            className={`text-left cursor-pointer rounded-2xl border p-4 transition-all shadow-panel ${
              isSelected
                ? "border-brand-intelligent bg-brand-soft dark:bg-brand-blue/15 ring-2 ring-brand-intelligent/35 shadow-elevated"
                : "border-space-800 bg-space-900 hover:border-brand-intelligent/45"
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div
                className={`h-9 w-9 rounded-xl border flex items-center justify-center ${
                  isSelected
                    ? "bg-brand-blue text-white keep-white border-brand-blue"
                    : "bg-brand-soft dark:bg-space-950 border-space-800 text-brand-blue dark:text-brand-light-cyan"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <StatusBadge variant={isSelected ? "brand" : "outline"} className="text-[10px]">
                {env.gravityLabel}
              </StatusBadge>
            </div>
            <h4 className="text-sm font-bold text-brand-navy dark:text-white">{env.name}</h4>
            <p className="mt-1 text-xs text-fg-muted line-clamp-2 leading-relaxed">
              {env.description}
            </p>
          </button>
        );
      })}
    </div>
  );
};
