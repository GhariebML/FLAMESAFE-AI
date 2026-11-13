"use client";

import React, { useState } from "react";
import { ScenarioRequest } from "@/types/scenario";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { FUEL_CATEGORIES } from "@/lib/constants/domains";

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
    <Card className="space-y-4">
      <h3 className="text-sm font-bold text-white">Atmospheric & Fire Safety Conditions</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Fuel / Material Category</label>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-space-950 border border-space-800 text-slate-200"
            >
              {FUEL_CATEGORIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Oxygen Fraction (% O₂)</label>
            <input
              type="number"
              step="0.1"
              value={oxygen}
              onChange={(e) => setOxygen(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-space-950 border border-space-800 text-slate-200"
              placeholder="e.g. 21.0"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Cabin Pressure (kPa)</label>
            <input
              type="number"
              step="0.1"
              value={pressure}
              onChange={(e) => setPressure(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-space-950 border border-space-800 text-slate-200"
              placeholder="e.g. 101.3"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Ventilation Airflow (cm/s)</label>
            <input
              type="number"
              step="0.1"
              value={airflow}
              onChange={(e) => setAirflow(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-space-950 border border-space-800 text-slate-200"
              placeholder="e.g. 5.0"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-400 mb-1 font-medium">Safety Investigation Focus</label>
            <input
              type="text"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-space-950 border border-space-800 text-slate-200"
              placeholder="e.g. Extinction limits, smoke detection, polymer flammability"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Evaluate Scenario & Research Gaps
          </Button>
        </div>
      </form>
    </Card>
  );
};
