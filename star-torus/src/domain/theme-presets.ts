import type { StarTheme } from "@/domain/star-field";

export interface ThemePreset extends StarTheme {
  id: string;
  label: string;
  readout: string;
}

export const THEME_PRESETS: readonly ThemePreset[] = [
  { id: "mono", label: "经典黑白", readout: "MONO", background: "#000000", star: "#FFFFFF", glow: "#FFFFFF" },
  { id: "deep", label: "深空蓝", readout: "DEEP", background: "#050816", star: "#7DD3FC", glow: "#BAE6FD" },
  { id: "nebula", label: "星云紫", readout: "NEBULA", background: "#0A0613", star: "#C4B5FD", glow: "#E9D5FF" },
  { id: "ember", label: "熔岩橙", readout: "EMBER", background: "#120805", star: "#FB923C", glow: "#FDBA74" },
  { id: "aurora", label: "极光绿", readout: "AURORA", background: "#03120D", star: "#6EE7B7", glow: "#A7F3D0" },
  { id: "pearl", label: "月尘白", readout: "LUNAR", background: "#F3F0E8", star: "#171717", glow: "#B45309" }
] as const;

export function findThemePreset(theme: StarTheme): ThemePreset | undefined {
  return THEME_PRESETS.find((preset) => (
    preset.background.toUpperCase() === theme.background.toUpperCase()
    && preset.star.toUpperCase() === theme.star.toUpperCase()
    && preset.glow.toUpperCase() === theme.glow.toUpperCase()
  ));
}
