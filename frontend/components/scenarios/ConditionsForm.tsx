"use client";

import React, { useState } from "react";
import { ScenarioRequest } from "@/types/scenario";
import { ScientificCard } from "@/components/shared/Card";
import { PrimaryButton } from "@/components/shared/Button";
import { FUEL_CATEGORIES } from "@/lib/constants/domains";
import { SlidersHorizontal } from "lucide-react";

interface FormProps {
  initialValues: Partial<ScenarioRequest>;
  onSubmit: (values: ScenarioRequest) => void;
  isLoading: boolean;
}

export const ConditionsForm: React.FC<FormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
}) => {
  const [environment, setEnvironment] = useState(initialValues.environment || "Spacecraft");
  const [fuelType, setFuelType] = useState(initialValues.fuel_type || "Solid Polymer");
  const [oxygen, setOxygen] = useState(initialValues.oxygen_concentration?.toString() || "21.0");
  const [pressure, setPressure] = useState(initialValues.pressure_value?.toString() || "101.3");
  const [airflow, setAirflow] = useState(initialValues.airflow_velocity?.toString() || "5.0");
  const [focus, setFocus] = useState(initialValues.fire_safety_focus || "Flammability");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      environment,
      fuel_type: fuelType,
      oxygen_concentration: parseFloat(oxygen) || undefined,
      pressure_value: parseFloat(pressure) || undefined,
      pressure_unit: "kPa",
      airflow_velocity: parseFloat(airflow) || undefined,
      airflow_unit: "cm/s",
      fire_safety_focus: focus,
    });
  };

  return (
    <ScientificCard className="space-y-4">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-brand-intelligent" />
        <h3 className="text-sm sm:text-base font-bold text-brand-navy dark:text-white">
          Atmospheric &amp; Fire Safety Boundary Conditions
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-fg-secondary mb-1.5 font-semibold">
              Fuel / Material Category
            </label>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-space-950 border border-space-800 text-fg-primary focus:outline-none focus:border-brand-intelligent"
            >
              {FUEL_CATEGORIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-fg-secondary mb-1.5 font-semibold">
              Oxygen Fraction (% O₂)
            </label>
            <input
              type="number"
              step="0.1"
              value={oxygen}
              onChange={(e) => setOxygen(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-space-950 border border-space-800 text-fg-primary font-mono focus:outline-none focus:border-brand-intelligent"
              placeholder="e.g. 21.0"
            />
          </div>

          <div>
            <label className="block text-fg-secondary mb-1.5 font-semibold">
              Cabin Pressure (kPa)
            </label>
            <input
              type="number"
              step="0.1"
              value={pressure}
              onChange={(e) => setPressure(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-space-950 border border-space-800 text-fg-primary font-mono focus:outline-none focus:border-brand-intelligent"
              placeholder="e.g. 101.3"
            />
          </div>

          <div>
            <label className="block text-fg-secondary mb-1.5 font-semibold">
              Ventilation Airflow (cm/s)
            </label>
            <input
              type="number"
              step="0.1"
              value={airflow}
              onChange={(e) => setAirflow(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-space-950 border border-space-800 text-fg-primary font-mono focus:outline-none focus:border-brand-intelligent"
              placeholder="e.g. 5.0"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-fg-secondary mb-1.5 font-semibold">
              Safety Investigation Focus
            </label>
            <input
              type="text"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-space-950 border border-space-800 text-fg-primary focus:outline-none focus:border-brand-intelligent"
              placeholder="e.g. Material Flammability, Smoke Detection, Suppression"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-space-800">
          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading ? "Evaluating NASA PSI Coverage..." : "Run Condition & Gap Evaluation"}
          </PrimaryButton>
        </div>
      </form>
    </ScientificCard>
  );
};
