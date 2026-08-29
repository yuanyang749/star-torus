import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  cloneStarFieldConfig,
  DEFAULT_STAR_FIELD_CONFIG,
  limitParticleText,
  type HoldMode,
  type RuntimeStatus,
  type ShapeId,
  type StarEffectConfig,
  type StarFieldConfig,
  type StarMotionConfig,
  type StarTheme
} from "@/domain/star-field";
import type { Locale } from "@/i18n/messages";

const LEGACY_DEFAULT_HOVER_RADIUS = 170;

interface StudioState {
  config: StarFieldConfig;
  locale: Locale;
  panelCollapsed: boolean;
  runtimeStatus: RuntimeStatus;
  setShape(shape: ShapeId): void;
  setTheme(theme: StarTheme): void;
  setThemeColor(channel: keyof StarTheme, value: string): void;
  setInteractionEnabled(enabled: boolean): void;
  setHoldMode(mode: HoldMode): void;
  setParallaxStrength(value: number): void;
  setMotionValue(key: keyof StarMotionConfig, value: number): void;
  setEffectValue(key: keyof StarEffectConfig, value: number): void;
  setParticleText(value: string): void;
  setPanelCollapsed(collapsed: boolean): void;
  setLocale(locale: Locale): void;
  setRuntimeStatus(status: RuntimeStatus): void;
  resetTheme(): void;
  resetParameters(): void;
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set) => ({
      config: cloneStarFieldConfig(DEFAULT_STAR_FIELD_CONFIG),
      locale: "zh-CN",
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

      setParallaxStrength: (parallaxStrength) => set((state) => ({
        config: {
          ...state.config,
          interaction: { ...state.config.interaction, parallaxStrength }
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

      setParticleText: (value) => set((state) => ({
        config: {
          ...state.config,
          content: { text: limitParticleText(value) }
        }
      })),

      setPanelCollapsed: (panelCollapsed) => set({ panelCollapsed }),
      setLocale: (locale) => set({ locale }),
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
          effects: { ...DEFAULT_STAR_FIELD_CONFIG.effects },
          interaction: {
            ...state.config.interaction,
            parallaxStrength: DEFAULT_STAR_FIELD_CONFIG.interaction.parallaxStrength
          }
        }
      }))
    }),
    {
      name: "star-field-studio",
      version: 3,
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
        locale: state.locale,
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
