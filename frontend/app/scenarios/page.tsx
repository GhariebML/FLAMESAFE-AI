"use client";

import React, { useEffect, useState } from "react";
import { EnvironmentSelector } from "@/components/scenarios/EnvironmentSelector";
import { ConditionsForm } from "@/components/scenarios/ConditionsForm";
import { GapAnalysisCard } from "@/components/scenarios/GapAnalysisCard";
import { useScenario } from "@/hooks/useScenario";
import { ScenarioRequest } from "@/types/scenario";
import { SPACE_ENVIRONMENTS } from "@/lib/constants/environments";
import { LoadingSkeleton, UncertaintyBanner } from "@/components/ui";
import { ArrowRight, Sparkles } from "lucide-react";

export default function ScenariosPage() {
  const [selectedEnv, setSelectedEnv] = useState(SPACE_ENVIRONMENTS[2]); // Default Lunar Habitat
  const { data: analysis, isLoading, error, analyze } = useScenario();

  // Interactive Oxygen Control Room sliders
  const [oxygenPct, setOxygenPct] = useState<number>(32);
  const [pressureKpa, setPressureKpa] = useState<number>(101);
  const [airflowVel, setAirflowVel] = useState<number>(1.5);

  const fireRiskScore = Math.min(
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
          DEDICATED STORYBOARD SHOWCASE: OXYGEN CONTROL ROOM
      ===================================================================== */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#060E20] via-[#09152E] to-[#050A18] border-2 border-[#254B8C]/90 p-6 sm:p-9 shadow-[0_24px_70px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left 5 Columns: Interactive Oxygen, Pressure & Airflow Sliders */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-[#FF7A18]">
                <Sparkles className="h-3.5 w-3.5 text-[#39B9EB]" />
                CABIN ATMOSPHERE SIMULATOR
              </span>
              <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Oxygen Control Room
              </h1>
              <p className="text-sm text-[#B4C6E4] mt-1">
                What happens when oxygen concentration increases?
              </p>
            </div>

            <div className="space-y-4 bg-[#07132A]/90 border border-[#1E3A6E] rounded-2xl p-5">
              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                  <span className="text-[#D6E4FF] font-medium">Oxygen Concentration</span>
                  <span className="font-mono font-extrabold text-[#FFB547]">{oxygenPct}%</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={40}
                  value={oxygenPct}
                  onChange={(e) => setOxygenPct(Number(e.target.value))}
                  aria-label="Oxygen Concentration"
                  className="w-full h-2 rounded-lg accent-[#FF7A18] bg-[#10244A] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                  <span className="text-[#D6E4FF] font-medium">Atmospheric Pressure</span>
                  <span className="font-mono font-extrabold text-[#39B9EB]">{pressureKpa} kPa</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={105}
                  value={pressureKpa}
                  onChange={(e) => setPressureKpa(Number(e.target.value))}
                  aria-label="Atmospheric Pressure"
                  className="w-full h-2 rounded-lg accent-[#39B9EB] bg-[#10244A] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                  <span className="text-[#D6E4FF] font-medium">Airflow Velocity</span>
                  <span className="font-mono font-extrabold text-[#39B9EB]">
                    {airflowVel.toFixed(1)} m/s
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
                  className="w-full h-2 rounded-lg accent-[#39B9EB] bg-[#10244A] cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRunControlRoom}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#FF7A18] to-[#E94B16] hover:from-[#FF8B33] hover:to-[#FF6B24] text-white keep-white font-bold text-sm shadow-[0_8px_24px_rgba(255,122,24,0.45)] transition-all"
                >
                  <span>Run Analysis</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right 7 Columns: Ultra-HD Combustion Chamber + Live Fire Risk Curve */}
          <div className="lg:col-span-7">
            <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden border-2 border-[#254B8C] bg-black shadow-2xl">
              <img
                src="/images/story/oxygen-chamber.png"
                alt="ISS Oxygen Combustion Chamber"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040918]/90 via-transparent to-transparent" />

              {/* Floating Fire Risk Telemetry Card inside Chamber */}
              <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-72 rounded-2xl bg-[#061228]/92 border border-[#39B9EB]/60 p-4 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-white">Fire Risk</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FF7A18]/20 border border-[#FF7A18]/50 text-xs font-mono font-bold text-[#FFB547]">
                    {fireRiskScore}% Index
                  </span>
                </div>
                <svg viewBox="0 0 180 56" className="w-full h-14 overflow-visible">
                  <line x1="0" y1="48" x2="180" y2="48" stroke="#1E3A6E" strokeWidth="1" />
                  <line x1="0" y1="26" x2="180" y2="26" stroke="#1E3A6E" strokeDasharray="3 3" strokeWidth="1" />
                  <path
                    d={`M 4 46 Q 55 ${Math.max(12, 46 - fireRiskScore * 0.22)} 105 ${Math.max(
                      8,
                      44 - fireRiskScore * 0.32
                    )} T 176 ${Math.max(4, 48 - fireRiskScore * 0.44)}`}
                    fill="none"
                    stroke="#FF7A18"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="176"
                    cy={Math.max(4, 48 - fireRiskScore * 0.44)}
                    r="4.5"
                    fill="#FFB547"
                  />
                </svg>
                <p className="text-[11px] text-[#9EB2D0] mt-1">
                  Target Regime: <strong className="text-white">{selectedEnv.name}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 1: Target Environment Selector */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#9EB2D0]">
          Step 1: Choose Space Exploration Regime (6 Environments)
        </h3>
        <EnvironmentSelector
          selectedEnvironment={selectedEnv.name}
          onSelect={handleSelectEnv}
        />
      </div>

      {/* Step 2: Detailed Conditions Form */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#9EB2D0]">
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
          title="Scenario Engine Unavailable"
          message={error}
        />
      )}

      {isLoading ? (
        <LoadingSkeleton className="h-72 w-full" />
      ) : analysis ? (
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9EB2D0]">
            Step 3: Condition Coverage, Evidence &amp; Scientific Gaps
          </h3>
          <GapAnalysisCard analysis={analysis} />
        </div>
      ) : null}
    </div>
  );
}
