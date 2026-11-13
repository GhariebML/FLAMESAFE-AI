"use client";

import React from "react";
import { SPACE_ENVIRONMENTS, SpaceEnvironment } from "@/lib/constants/environments";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Rocket, Moon, Globe, Compass } from "lucide-react";

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
          <div
            key={env.id}
            onClick={() => onSelect(env)}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              isSelected
                ? "border-flame-500 bg-flame-500/10 shadow-lg shadow-flame-500/10 ring-1 ring-flame-500"
                : "border-space-800 bg-space-900/50 hover:border-space-700 hover:bg-space-900"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-lg bg-space-800 flex items-center justify-center text-flame-400">
                <Icon className="h-4 w-4" />
              </div>
              <Badge variant={isSelected ? "flame" : "outline"} className="text-[10px]">
                {env.gravityLabel}
              </Badge>
            </div>
            <h4 className="text-sm font-bold text-white">{env.name}</h4>
            <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {env.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};
