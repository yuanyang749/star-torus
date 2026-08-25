import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  cloneStarFieldConfig,
  DEFAULT_STAR_FIELD_CONFIG,
  type HoldMode,
  type RuntimeStatus,
  type ShapeId,
  type StarEffectConfig,
  type StarFieldConfig,
  type StarMotionConfig,
  type StarTheme
} from "@/domain/star-field";

const LEGACY_DEFAULT_HOVER_RADIUS = 170;

interface StudioState {
  config: StarFieldConfig;
  panelCollapsed: boolean;
  runtimeStatus: RuntimeStatus;
  setShape(shape: ShapeId): void;
  setTheme(theme: StarTheme): void;
  setThemeColor(channel: keyof StarTheme, value: string): void;
  setInteractionEnabled(enabled: boolean): void;
  setHoldMode(mode: HoldMode): void;
  setMotionValue(key: keyof StarMotionConfig, value: number): void;
  setEffectValue(key: keyof StarEffectConfig, value: number): void;
  setPanelCollapsed(collapsed: boolean): void;
  setRuntimeStatus(status: RuntimeStatus): void;
  resetTheme(): void;
  resetParameters(): void;
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set) => ({
      config: cloneStarFieldConfig(DEFAULT_STAR_FIELD_CONFIG),
      panelCollapsed: false,
      runtimeStatus: "disabled",

      setShape: (shape) => set((state) => ({
        config: { ...state.config, shape }
      })),

      setTheme: (theme) => set((state) => ({
        config: {
          ...state.config,
          theme: {
            background: theme.background,
            star: theme.star,
            glow: theme.glow
          }
        }
      })),

      setThemeColor: (channel, value) => set((state) => ({
        config: {
          ...state.config,
          theme: { ...state.config.theme, [channel]: value.toUpperCase() }
        }
      })),

      setInteractionEnabled: (enabled) => set((state) => ({
        config: {
          ...state.config,
          interaction: { ...state.config.interaction, enabled }
        }
      })),

      setHoldMode: (holdMode) => set((state) => ({
        config: {
          ...state.config,
          interaction: { ...state.config.interaction, holdMode }
        }
      })),

      setMotionValue: (key, value) => set((state) => ({
        config: {
          ...state.config,
          motion: { ...state.config.motion, [key]: value }
        }
      })),

      setEffectValue: (key, value) => set((state) => ({
        config: {
          ...state.config,
          effects: { ...state.config.effects, [key]: value }
        }
      })),

      setPanelCollapsed: (panelCollapsed) => set({ panelCollapsed }),
      setRuntimeStatus: (runtimeStatus) => set({ runtimeStatus }),

      resetTheme: () => set((state) => ({
        config: {
          ...state.config,
          theme: { ...DEFAULT_STAR_FIELD_CONFIG.theme }
        }
      })),

      resetParameters: () => set((state) => ({
        config: {
          ...state.config,
          motion: { ...DEFAULT_STAR_FIELD_CONFIG.motion },
          effects: { ...DEFAULT_STAR_FIELD_CONFIG.effects }
        }
      }))
    }),
    {
      name: "star-field-studio",
      version: 2,
      migrate: (persistedState, version) => {
        const persisted = persistedState as Partial<StudioState>;
        if (version >= 2 || !persisted.config) return persistedState as StudioState;

        const config = cloneStarFieldConfig(persisted.config);
        if (config.effects.hoverRadius === LEGACY_DEFAULT_HOVER_RADIUS) {
          config.effects.hoverRadius = DEFAULT_STAR_FIELD_CONFIG.effects.hoverRadius;
        }

        return { ...persisted, config } as StudioState;
      },
      partialize: (state) => ({
        config: state.config,
        panelCollapsed: state.panelCollapsed
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<StudioState>;
        return {
          ...currentState,
          ...persisted,
          config: persisted.config
            ? cloneStarFieldConfig(persisted.config)
            : currentState.config
        };
      }
    }
  )
);
