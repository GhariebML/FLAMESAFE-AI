"use client";

import React, { useEffect, useState } from "react";
import { EnvironmentSelector } from "@/components/scenarios/EnvironmentSelector";
import { ConditionsForm } from "@/components/scenarios/ConditionsForm";
import { GapAnalysisCard } from "@/components/scenarios/GapAnalysisCard";
import { useScenario } from "@/hooks/useScenario";
import { ScenarioRequest } from "@/types/scenario";
import { SPACE_ENVIRONMENTS } from "@/lib/constants/environments";
import { LoadingSkeleton, UncertaintyBanner } from "@/components/ui";
import { Compass } from "lucide-react";

export default function ScenariosPage() {
  const [selectedEnv, setSelectedEnv] = useState(SPACE_ENVIRONMENTS[2]); // Default Lunar Habitat
  const { data: analysis, isLoading, error, analyze } = useScenario();

  useEffect(() => {
    analyze({
      environment: selectedEnv.name,
      pressure_value: selectedEnv.nominalPressureKPa,
      oxygen_concentration: selectedEnv.nominalO2Percent,
      airflow_velocity: 5.0,
      fuel_type: "Solid Polymer",
      fire_safety_focus: "Flammability",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectEnv = (env: (typeof SPACE_ENVIRONMENTS)[0]) => {
    setSelectedEnv(env);
    analyze({
      environment: env.name,
      pressure_value: env.nominalPressureKPa,
      oxygen_concentration: env.nominalO2Percent,
      airflow_velocity: 5.0,
      fuel_type: "Solid Polymer",
    });
  };

  const handleSubmitForm = (values: ScenarioRequest) => {
    analyze({ ...values, environment: selectedEnv.name });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-50 tracking-tight flex items-center gap-2">
          <Compass className="h-6 w-6 text-electric-400 shrink-0" />
          <span>Mission Scenario Fire Safety Analyzer</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Evaluate condition coverage, partial-gravity extrapolation limits, and scientific research gaps across all six exploration environments.
        </p>
      </div>

      {/* Step 1: Target Environment Selector */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Step 1: Choose Space Exploration Regime (6 Environments)
        </h3>
        <EnvironmentSelector
          selectedEnvironment={selectedEnv.name}
          onSelect={handleSelectEnv}
        />
      </div>

      {/* Step 2: Conditions Form */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Step 2: Configure Atmospheric & Material Parameters ({selectedEnv.name})
        </h3>
        <ConditionsForm
          key={selectedEnv.id}
          initialValues={{
            environment: selectedEnv.name,
            oxygen_concentration: selectedEnv.nominalO2Percent,
            pressure_value: selectedEnv.nominalPressureKPa,
            airflow_velocity: 5.0,
            fuel_type: "Solid Polymer",
            fire_safety_focus: "Flammability",
          }}
          onSubmit={handleSubmitForm}
          isLoading={isLoading}
        />
      </div>

      {error && (
        <UncertaintyBanner
          variant="warning"
          title="Scenario Engine Unavailable"
          message={error}
        />
      )}

      {isLoading ? (
        <LoadingSkeleton className="h-72 w-full" />
      ) : analysis ? (
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Step 3: Condition Coverage, Evidence & Scientific Gaps
          </h3>
          <GapAnalysisCard analysis={analysis} />
        </div>
      ) : null}
    </div>
  );
}
