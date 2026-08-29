import { useEffect, useRef } from "react";
import { StarField, type StarFieldHandle } from "@/components/star-field";
import type { StarTheme } from "@/domain/star-field";
import { MESSAGES } from "@/i18n/messages";
import { GEOMETRY_DEFINITIONS } from "@/geometries/registry";
import { useStudioStore } from "@/store/useStudioStore";
import { ControlPanel } from "@/ui/ControlPanel";

export default function App() {
  const config = useStudioStore((state) => state.config);
  const locale = useStudioStore((state) => state.locale);
  const setRuntimeStatus = useStudioStore((state) => state.setRuntimeStatus);
  const starFieldRef = useRef<StarFieldHandle | null>(null);
  const messages = MESSAGES[locale];

  useEffect(() => {
    applyThemeToDocument(config.theme);
  }, [config.theme]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <main className="studio-shell">
      <div className="star-field-shell">
        <StarField
          ref={starFieldRef}
          config={config}
          geometries={GEOMETRY_DEFINITIONS}
          ariaLabel={messages.shapes[config.shape].ariaLabel}
          onRuntimeStatusChange={setRuntimeStatus}
        />
      </div>
      <ControlPanel starFieldRef={starFieldRef} />
    </main>
  );
}

function applyThemeToDocument(theme: StarTheme): void {
  const root = document.documentElement;
  const backgroundIsLight = relativeLuminance(hexToRgb(theme.background)) > 0.48;
  const panelRgb = backgroundIsLight ? { r: 247, g: 246, b: 242 } : { r: 8, g: 9, b: 12 };
  const inkRgb = backgroundIsLight ? { r: 24, g: 24, b: 26 } : { r: 247, g: 247, b: 244 };
  const starRgb = hexToRgb(theme.star);
  const contrast = Math.abs(relativeLuminance(panelRgb) - relativeLuminance(starRgb));
  const accent = contrast > 0.28 ? theme.star : (backgroundIsLight ? "#171717" : "#FFFFFF");

  root.style.setProperty("--theme-background", theme.background);
  root.style.setProperty("--theme-star", theme.star);
  root.style.setProperty("--theme-glow", theme.glow);
  root.style.setProperty("--panel-rgb", rgbChannels(panelRgb));
  root.style.setProperty("--panel-ink-rgb", rgbChannels(inkRgb));
  root.style.setProperty("--panel-accent", accent);
  root.style.setProperty(
    "--panel-shadow",
    backgroundIsLight ? "rgba(31, 29, 24, 0.2)" : "rgba(0, 0, 0, 0.48)"
  );
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.background);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace("#", "");
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16)
  };
}

function rgbChannels(rgb: { r: number; g: number; b: number }): string {
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
}

function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const channels = [rgb.r, rgb.g, rgb.b].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
