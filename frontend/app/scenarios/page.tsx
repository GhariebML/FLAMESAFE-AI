"use client";

import React, { useState } from "react";
import { EnvironmentSelector } from "@/components/scenarios/EnvironmentSelector";
import { ConditionsForm } from "@/components/scenarios/ConditionsForm";
import { GapAnalysisCard } from "@/components/scenarios/GapAnalysisCard";
import { useScenario } from "@/hooks/useScenario";
import { ScenarioRequest } from "@/types/scenario";
import { SPACE_ENVIRONMENTS } from "@/lib/constants/environments";
import { Compass } from "lucide-react";

export default function ScenariosPage() {
  const [selectedEnv, setSelectedEnv] = useState(SPACE_ENVIRONMENTS[2].name); // Default Lunar Habitat
  const { data: analysis, isLoading, error, analyze } = useScenario();

  const handleSelectEnv = (env: (typeof SPACE_ENVIRONMENTS)[0]) => {
    setSelectedEnv(env.name);
    analyze({
      environment: env.name,
      pressure_value: env.nominalPressureKPa,
      oxygen_concentration: env.nominalO2Percent,
      airflow_velocity: 5.0,
      fuel_type: "Solid Polymer",
    });
  };

  const handleSubmitForm = (values: ScenarioRequest) => {
    analyze({ ...values, environment: selectedEnv });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Compass className="h-6 w-6 text-flame-400" />
          Mission Scenario Fire Safety Analyzer
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore research evidence, condition matches, and critical knowledge gaps across spacecraft, lunar habitats, and Martian exploration regimes.
        </p>
      </div>

      {/* Step 1: Target Environment Selector */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Step 1: Choose Space Exploration Regime
        </h3>
        <EnvironmentSelector selectedEnvironment={selectedEnv} onSelect={handleSelectEnv} />
      </div>

      {/* Step 2: Conditions Form */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Step 2: Define Environmental Parameters
        </h3>
        <ConditionsForm
          initialValues={{
            environment: selectedEnv,
            oxygen_concentration: 28.0,
            pressure_value: 56.5,
            airflow_velocity: 5.0,
            fuel_type: "Solid Polymer",
          }}
          onSubmit={handleSubmitForm}
          isLoading={isLoading}
        />
      </div>

      {/* Error / Results */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-red-300">
          {error}
        </div>
      )}

      {analysis && (
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Analysis Results & Scientific Gaps
          </h3>
          <GapAnalysisCard analysis={analysis} />
        </div>
      )}
    </div>
  );
}
