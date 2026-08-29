import type { CSSProperties } from "react";

interface ParameterSliderProps {
  label: string;
  code: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  digits?: number;
  onChange(value: number): void;
}

export function ParameterSlider({
  label,
  code,
  value,
  min,
  max,
  step,
  suffix = "",
  digits = 1,
  onChange
}: ParameterSliderProps) {
  const normalized = (value - min) / (max - min) * 100;

  return (
    <label className="parameter-control">
      <span className="parameter-control__heading">
        <span><code>{code}</code>{label}</span>
        <output>{value.toFixed(digits)}{suffix}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ "--range-progress": `${normalized}%` } as CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
