import {
  useEffect,
  type CSSProperties,
  type ReactNode,
  type RefObject
} from "react";
import type { StarFieldHandle } from "@/components/star-field";
import { THEME_PRESETS, findThemePreset } from "@/domain/theme-presets";
import { GEOMETRY_DEFINITIONS } from "@/geometries/registry";
import { MESSAGES, type Locale } from "@/i18n/messages";
import { useStudioStore } from "@/store/useStudioStore";
import { ExportPanel } from "@/ui/ExportPanel";
import { ParameterSlider } from "@/ui/ParameterSlider";

interface ControlPanelProps {
  starFieldRef: RefObject<StarFieldHandle | null>;
}

export function ControlPanel({ starFieldRef }: ControlPanelProps) {
  const config = useStudioStore((state) => state.config);
  const locale = useStudioStore((state) => state.locale);
  const panelCollapsed = useStudioStore((state) => state.panelCollapsed);
  const runtimeStatus = useStudioStore((state) => state.runtimeStatus);
  const setShape = useStudioStore((state) => state.setShape);
  const setTheme = useStudioStore((state) => state.setTheme);
  const setThemeColor = useStudioStore((state) => state.setThemeColor);
  const setInteractionEnabled = useStudioStore((state) => state.setInteractionEnabled);
  const setHoldMode = useStudioStore((state) => state.setHoldMode);
  const setMotionValue = useStudioStore((state) => state.setMotionValue);
  const setEffectValue = useStudioStore((state) => state.setEffectValue);
  const setPanelCollapsed = useStudioStore((state) => state.setPanelCollapsed);
  const setLocale = useStudioStore((state) => state.setLocale);
  const resetTheme = useStudioStore((state) => state.resetTheme);
  const resetParameters = useStudioStore((state) => state.resetParameters);
  const activePreset = findThemePreset(config.theme);
  const messages = MESSAGES[locale];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !panelCollapsed) setPanelCollapsed(true);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [panelCollapsed, setPanelCollapsed]);

  return (
    <aside
      className={`control-panel${panelCollapsed ? " is-collapsed" : ""}${locale === "en-US" ? " is-english" : ""}`}
      aria-label={messages.panel.ariaLabel}
    >
      <button
        className="panel-toggle"
        type="button"
        aria-expanded={!panelCollapsed}
        aria-controls="panelSurface"
        title={panelCollapsed ? messages.panel.expand : messages.panel.collapse}
        onClick={() => setPanelCollapsed(!panelCollapsed)}
      >
        <svg className="panel-toggle__palette" aria-hidden="true" width="17" height="17" viewBox="0 0 24 24">
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22a1 1 0 0 1 0-20a10 9 0 0 1 10 9a5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
          <circle cx="13.5" cy="6.5" r=".7" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".7" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".7" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".7" fill="currentColor" />
        </svg>
        <span className="panel-toggle__chevron" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 18 6-6-6-6" />
          </svg>
        </span>
        <span className="sr-only">{panelCollapsed ? messages.panel.expand : messages.panel.collapse}</span>
      </button>

      <div
        className="control-panel__surface"
        id="panelSurface"
        aria-hidden={panelCollapsed}
        inert={panelCollapsed ? true : undefined}
      >
        <header className="panel-header">
          <div className="panel-header__meta">
            <p className="panel-kicker">FORMFIELD LAB / REGISTRY</p>
            <LanguageSwitch locale={locale} setLocale={setLocale} />
          </div>
          <div className="panel-brand">
            <div className="panel-orbit" aria-hidden="true"><span /></div>
            <div className="panel-brand__copy">
              <h1 className="panel-title">{messages.panel.title}</h1>
              <div className="panel-readout">
                <span className="panel-readout__dot" />
                <span>{activePreset?.readout ?? "CUSTOM"}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="platform-pipeline" aria-label={messages.panel.pipelineAria}>
          <span><code>01</code>{messages.panel.pipelineCreate}</span>
          <span><code>02</code>{messages.panel.pipelinePreview}</span>
          <span><code>03</code>{messages.panel.pipelineExport}</span>
        </div>

        <section className="panel-section">
          <SectionHeading index="01" title={messages.panel.previewSection} />
          <button
            className="interaction-toggle"
            type="button"
            aria-pressed={config.interaction.enabled}
            aria-label={config.interaction.enabled
              ? messages.panel.interactionDisableAria
              : messages.panel.interactionEnableAria}
            onClick={() => setInteractionEnabled(!config.interaction.enabled)}
          >
            <span className="setting-icon" aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
              </svg>
            </span>
            <span className="interaction-toggle__copy">
              <strong className="interaction-toggle__label">{messages.panel.interactionLabel}</strong>
              <span className="interaction-toggle__state">{messages.statuses[runtimeStatus]}</span>
            </span>
            <span className="switch-track" aria-hidden="true" />
          </button>
          <p className="interaction-note">
            <span>{messages.panel.interactionPrimaryNote}</span>
            <span>{config.interaction.holdMode === "freeze"
              ? messages.panel.interactionFreezeNote
              : messages.panel.interactionMagnetNote}</span>
          </p>
        </section>

        <section className="panel-section">
          <SectionHeading index="02" title={messages.panel.shapesSection} />
          <div className="motion-controls">
            <div className="motion-control">
              <div className="motion-control__label"><span>HOLD</span><strong>{messages.panel.holdLabel}</strong></div>
              <div className="mode-segments mode-segments--two" role="group" aria-label={messages.panel.holdGroupAria}>
                {(["magnet", "freeze"] as const).map((mode) => (
                  <button
                    key={mode}
                    className="mode-segment"
                    type="button"
                    aria-pressed={config.interaction.holdMode === mode}
                    onClick={() => setHoldMode(mode)}
                  >
                    <span className="mode-segment__signal" />
                    {mode === "magnet" ? messages.panel.magnet : messages.panel.freeze}
                  </button>
                ))}
              </div>
            </div>
            <div className="motion-control">
              <div className="motion-control__label">
                <span>{messages.panel.formLibrary}</span>
                <strong>{messages.panel.shapeCount(GEOMETRY_DEFINITIONS.length)}</strong>
              </div>
              <div className="mode-segments mode-segments--shapes" role="group" aria-label={messages.panel.shapeGroupAria}>
                {GEOMETRY_DEFINITIONS.map((definition) => (
                  <button
                    key={definition.id}
                    className="mode-segment shape-segment"
                    type="button"
                    aria-pressed={config.shape === definition.id}
                    onClick={() => setShape(definition.id)}
                  >
                    <span className={`shape-mark shape-mark--${definition.mark}`} />
                    <span className="shape-segment__label">{messages.shapes[definition.id].label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="panel-section">
          <SectionHeading index="03" title={messages.panel.parametersSection}>
            <button className="section-reset" type="button" onClick={resetParameters}>{messages.panel.reset}</button>
          </SectionHeading>
          <div className="parameter-grid">
            <ParameterSlider label={messages.panel.flowSpeed} code="SPD" value={config.motion.flowSpeed} min={0} max={2} step={0.05} digits={2} onChange={(value) => setMotionValue("flowSpeed", value)} />
            <ParameterSlider label={messages.panel.pointSize} code="PTS" value={config.motion.pointScale} min={0.55} max={1.8} step={0.05} digits={2} onChange={(value) => setMotionValue("pointScale", value)} />
            <ParameterSlider label={messages.panel.morphDuration} code="MRP" value={config.motion.morphDuration} min={0.25} max={2.6} step={0.05} suffix="s" digits={2} onChange={(value) => setMotionValue("morphDuration", value)} />
            <ParameterSlider label={messages.panel.lightRadius} code="RAD" value={config.effects.hoverRadius} min={70} max={260} step={5} suffix="px" digits={0} onChange={(value) => setEffectValue("hoverRadius", value)} />
            <ParameterSlider label={messages.panel.lightIntensity} code="LUX" value={config.effects.hoverIntensity} min={0} max={1.5} step={0.05} digits={2} onChange={(value) => setEffectValue("hoverIntensity", value)} />
            <ParameterSlider label={messages.panel.trailIntensity} code="TRL" value={config.effects.trailIntensity} min={0} max={1.5} step={0.05} digits={2} onChange={(value) => setEffectValue("trailIntensity", value)} />
          </div>
        </section>

        <section className="panel-section">
          <SectionHeading index="04" title={messages.panel.themesSection} />
          <div className="theme-grid" role="group" aria-label={messages.panel.themeGroupAria}>
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                className="theme-preset"
                type="button"
                aria-pressed={activePreset?.id === preset.id}
                aria-label={messages.themes[preset.id]}
                title={messages.themes[preset.id]}
                style={{
                  "--preset-bg": preset.background,
                  "--preset-star": preset.star,
                  "--preset-glow": preset.glow
                } as CSSProperties}
                onClick={() => setTheme(preset)}
              >
                <span className="theme-preset__swatch" aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>

        <section className="panel-section">
          <SectionHeading index="05" title={messages.panel.colorsSection} />
          <div className="color-controls">
            {([
              ["background", messages.panel.backgroundColor],
              ["star", messages.panel.starColor],
              ["glow", messages.panel.glowColor]
            ] as const).map(([channel, label]) => (
              <label className="color-control" key={channel}>
                <span className="color-control__name">{label}</span>
                <output>{config.theme[channel].toUpperCase()}</output>
                <input
                  type="color"
                  value={config.theme[channel]}
                  aria-label={messages.panel.selectColor(label)}
                  onChange={(event) => setThemeColor(channel, event.target.value)}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="panel-section panel-section--export">
          <SectionHeading index="06" title={messages.panel.sourceSection} />
          <ExportPanel config={config} copy={messages.export} />
        </section>

        <footer className="panel-footer">
          <button className="panel-action" type="button" onClick={() => starFieldRef.current?.resetView()}>
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />
            </svg>
            {messages.panel.resetView}
          </button>
          <button className="panel-action" type="button" onClick={resetTheme}>{messages.panel.resetTheme}</button>
        </footer>
      </div>
    </aside>
  );
}

function LanguageSwitch({
  locale,
  setLocale
}: {
  locale: Locale;
  setLocale(locale: Locale): void;
}) {
  const messages = MESSAGES[locale];

  return (
    <div className="language-switch" role="group" aria-label={messages.language.groupAria}>
      <button
        type="button"
        aria-label={messages.language.chineseAria}
        aria-pressed={locale === "zh-CN"}
        onClick={() => setLocale("zh-CN")}
      >
        中
      </button>
      <button
        type="button"
        aria-label={messages.language.englishAria}
        aria-pressed={locale === "en-US"}
        onClick={() => setLocale("en-US")}
      >
        EN
      </button>
    </div>
  );
}

function SectionHeading({
  index,
  title,
  children
}: {
  index: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <span>{index}</span>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
