"use client";

import React, { useEffect, useState } from "react";
import { EnvironmentSelector } from "@/components/scenarios/EnvironmentSelector";
import { ConditionsForm } from "@/components/scenarios/ConditionsForm";
import { GapAnalysisCard } from "@/components/scenarios/GapAnalysisCard";
import { useScenario } from "@/hooks/useScenario";
import { ScenarioRequest } from "@/types/scenario";
import { SPACE_ENVIRONMENTS } from "@/lib/constants/environments";
import { LoadingSkeleton, UncertaintyBanner } from "@/components/ui";
import { ArrowRight, ShieldAlert, Info } from "lucide-react";

export default function ScenariosPage() {
  const [selectedEnv, setSelectedEnv] = useState(SPACE_ENVIRONMENTS[2]); // Default Lunar Habitat
  const { data: analysis, isLoading, error, analyze } = useScenario();

  // Interactive Atmospheric Boundary Sliders
  const [oxygenPct, setOxygenPct] = useState<number>(32);
  const [pressureKpa, setPressureKpa] = useState<number>(101);
  const [airflowVel, setAirflowVel] = useState<number>(1.5);

  // Condition Sensitivity Indicator (heuristic boundary proximity, NOT a calibrated ignition probability)
  const sensitivityIndicator = Math.min(
    99,
    Math.max(
      12,
      Math.round(
        (oxygenPct - 15) * 3.4 +
          (105 - pressureKpa) * 0.25 +
          airflowVel * 9.5
      )
    )
  );

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

  const handleRunControlRoom = () => {
    analyze({
      environment: selectedEnv.name,
      pressure_value: pressureKpa,
      oxygen_concentration: oxygenPct,
      airflow_velocity: airflowVel,
      fuel_type: "Solid Polymer",
      fire_safety_focus: "Flammability",
    });
  };

  const handleSelectEnv = (env: (typeof SPACE_ENVIRONMENTS)[0]) => {
    setSelectedEnv(env);
    setOxygenPct(env.nominalO2Percent);
    setPressureKpa(env.nominalPressureKPa);
    analyze({
      environment: env.name,
      pressure_value: env.nominalPressureKPa,
      oxygen_concentration: env.nominalO2Percent,
      airflow_velocity: airflowVel,
      fuel_type: "Solid Polymer",
    });
  };

  const handleSubmitForm = (values: ScenarioRequest) => {
    if (values.oxygen_concentration != null) setOxygenPct(values.oxygen_concentration);
    if (values.pressure_value != null) setPressureKpa(values.pressure_value);
    if (values.airflow_velocity != null) setAirflowVel(values.airflow_velocity);
    analyze({ ...values, environment: selectedEnv.name });
  };

  return (
    <div className="w-full max-w-[88rem] mx-auto space-y-8 min-w-0 pb-10">
      {/* =====================================================================
          PHASE 7.6 — DECISION LAB: ATMOSPHERIC BOUNDARY & COVERAGE SIMULATOR
      ===================================================================== */}
      <section className="relative rounded-2xl bg-[#10151D] border border-[#283340] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.75)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left 5 Columns: Interactive Oxygen, Pressure & Airflow Sliders */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-[#FF6B24]">
                <ShieldAlert className="h-3.5 w-3.5 text-[#39B9EB]" />
                DECISION LAB · CABIN ATMOSPHERE SIMULATOR
              </span>
              <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold text-[#F7F7F5] tracking-tight">
                Oxygen &amp; Ventilation Boundary Lab
              </h1>
              <p className="text-xs sm:text-sm text-[#A1A8B3] mt-1">
                Explore how oxygen concentration, cabin pressure, and forced HVAC ventilation
                align with documented NASA PSI experimental runs.
              </p>
            </div>

            <div className="space-y-4 bg-[#151D27] border border-[#283340] rounded-xl p-5">
              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                  <span className="text-[#F7F7F5] font-medium">Oxygen Concentration</span>
                  <span className="font-mono font-extrabold text-[#FFB547]">{oxygenPct}% O₂</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={40}
                  value={oxygenPct}
                  onChange={(e) => setOxygenPct(Number(e.target.value))}
                  aria-label="Oxygen Concentration"
                  className="w-full h-2 rounded-lg accent-[#FF6B24] bg-[#080A0F] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                  <span className="text-[#F7F7F5] font-medium">Atmospheric Pressure</span>
                  <span className="font-mono font-extrabold text-[#39B9EB]">{pressureKpa} kPa</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={105}
                  value={pressureKpa}
                  onChange={(e) => setPressureKpa(Number(e.target.value))}
                  aria-label="Atmospheric Pressure"
                  className="w-full h-2 rounded-lg accent-[#39B9EB] bg-[#080A0F] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                  <span className="text-[#F7F7F5] font-medium">Forced Airflow Velocity</span>
                  <span className="font-mono font-extrabold text-[#39B9EB]">
                    {airflowVel.toFixed(1)} cm/s
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={5.0}
                  step={0.1}
                  value={airflowVel}
                  onChange={(e) => setAirflowVel(Number(e.target.value))}
                  aria-label="Airflow Velocity"
                  className="w-full h-2 rounded-lg accent-[#39B9EB] bg-[#080A0F] cursor-pointer"
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleRunControlRoom}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF6B24] to-[#E94B16] hover:from-[#FF8040] hover:to-[#FF6B24] text-white keep-white font-bold text-xs sm:text-sm shadow-[0_8px_24px_rgba(255,107,36,0.38)] transition-all"
                >
                  <span>Evaluate Empirical Coverage</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right 7 Columns: Combustion Chamber + Transparent Condition Sensitivity Indicator */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative h-72 sm:h-80 w-full rounded-xl overflow-hidden border border-[#283340] bg-[#080A0F] shadow-2xl">
              <img
                src="/images/story/oxygen-chamber.webp"
                alt="ISS Microgravity Combustion Chamber"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080A0F]/92 via-transparent to-transparent" />

              {/* Scientifically Honest Condition Sensitivity Indicator */}
              <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-80 rounded-xl bg-[#10151D]/95 border border-[#283340] p-4 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-[#F7F7F5]">
                    Condition Sensitivity Indicator
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FF6B24]/20 border border-[#FF6B24]/50 text-[11px] font-mono font-bold text-[#FFB547]">
                    {sensitivityIndicator}/100 Boundary Score
                  </span>
                </div>
                <svg viewBox="0 0 180 48" className="w-full h-12 overflow-visible">
                  <line x1="0" y1="42" x2="180" y2="42" stroke="#283340" strokeWidth="1" />
                  <line
                    x1="0"
                    y1="22"
                    x2="180"
                    y2="22"
                    stroke="#283340"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <path
                    d={`M 4 40 Q 55 ${Math.max(10, 40 - sensitivityIndicator * 0.2)} 105 ${Math.max(
                      6,
                      38 - sensitivityIndicator * 0.28
                    )} T 176 ${Math.max(4, 42 - sensitivityIndicator * 0.38)}`}
                    fill="none"
                    stroke="#FF6B24"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="176"
                    cy={Math.max(4, 42 - sensitivityIndicator * 0.38)}
                    r="4"
                    fill="#FFB547"
                  />
                </svg>
                <p className="text-[10.5px] text-[#A1A8B3] mt-1 leading-snug">
                  Regime: <strong className="text-[#F7F7F5]">{selectedEnv.name}</strong> · Reflects
                  relative O₂ &amp; flow sensitivity, not a calibrated ignition probability.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-[#151D27] border border-[#283340] px-4 py-2.5 flex items-start gap-2.5 text-[11px] text-[#A1A8B3]">
              <Info className="h-4 w-4 text-[#39B9EB] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#F7F7F5]">Methodology Note:</strong> The Condition
                Sensitivity Indicator summarizes how far the selected O₂ concentration and forced
                flow depart from nominal 21% O₂ quiescent bounds, paired below with exact empirical
                run matching and gap identification from NASA PSI.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Step 1: Target Environment Selector */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A8B3]">
          Step 1: Choose Space Exploration Regime (6 Environments)
        </h3>
        <EnvironmentSelector
          selectedEnvironment={selectedEnv.name}
          onSelect={handleSelectEnv}
        />
      </div>

      {/* Step 2: Detailed Conditions Form */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A8B3]">
          Step 2: Configure Atmospheric &amp; Material Parameters ({selectedEnv.name})
        </h3>
        <ConditionsForm
          key={`${selectedEnv.id}-${oxygenPct}-${pressureKpa}`}
          initialValues={{
            environment: selectedEnv.name,
            oxygen_concentration: oxygenPct,
            pressure_value: pressureKpa,
            airflow_velocity: airflowVel,
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
          title="Scenario Evaluation Notice"
          message={error}
        />
      )}

      {/* Step 3: Empirical Coverage & Gap Results */}
      {isLoading ? (
        <LoadingSkeleton className="h-80" />
      ) : analysis ? (
        <GapAnalysisCard analysis={analysis} />
      ) : null}
    </div>
  );
}
