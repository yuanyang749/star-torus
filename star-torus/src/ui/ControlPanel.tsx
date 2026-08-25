import {
  useEffect,
  type CSSProperties,
  type ReactNode,
  type RefObject
} from "react";
import type { StarFieldHandle } from "@/components/star-field";
import type { RuntimeStatus } from "@/domain/star-field";
import { THEME_PRESETS, findThemePreset } from "@/domain/theme-presets";
import { GEOMETRY_DEFINITIONS } from "@/geometries/registry";
import { useStudioStore } from "@/store/useStudioStore";
import { ExportPanel } from "@/ui/ExportPanel";
import { ParameterSlider } from "@/ui/ParameterSlider";

interface ControlPanelProps {
  starFieldRef: RefObject<StarFieldHandle | null>;
}

const STATUS_LABELS: Record<RuntimeStatus, string> = {
  disabled: "已关闭",
  idle: "已开启",
  dragging: "旋转中",
  attracting: "吸附中",
  repelling: "排斥中",
  frozen: "时空冻结"
};

export function ControlPanel({ starFieldRef }: ControlPanelProps) {
  const config = useStudioStore((state) => state.config);
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
  const resetTheme = useStudioStore((state) => state.resetTheme);
  const resetParameters = useStudioStore((state) => state.resetParameters);
  const activePreset = findThemePreset(config.theme);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !panelCollapsed) setPanelCollapsed(true);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [panelCollapsed, setPanelCollapsed]);

  return (
    <aside
      className={`control-panel${panelCollapsed ? " is-collapsed" : ""}`}
      aria-label="星环组件控制面板"
    >
      <button
        className="panel-toggle"
        type="button"
        aria-expanded={!panelCollapsed}
        aria-controls="panelSurface"
        title={panelCollapsed ? "展开控制面板" : "收起控制面板"}
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
        <span className="sr-only">{panelCollapsed ? "展开控制面板" : "收起控制面板"}</span>
      </button>

      <div
        className="control-panel__surface"
        id="panelSurface"
        aria-hidden={panelCollapsed}
        inert={panelCollapsed ? true : undefined}
      >
        <header className="panel-header">
          <div className="panel-orbit" aria-hidden="true"><span /></div>
          <div>
            <p className="panel-kicker">FORMFIELD LAB / REGISTRY</p>
            <h1 className="panel-title">形场实验室</h1>
          </div>
          <div className="panel-readout">
            <span className="panel-readout__dot" />
            <span>{activePreset?.readout ?? "CUSTOM"}</span>
          </div>
        </header>

        <div className="platform-pipeline" aria-label="创作、预览与源码分发流程">
          <span><code>01</code>创作</span>
          <span><code>02</code>实时预览</span>
          <span><code>03</code>源码分发</span>
        </div>

        <section className="panel-section">
          <SectionHeading index="01" title="预览与交互" />
          <button
            className="interaction-toggle"
            type="button"
            aria-pressed={config.interaction.enabled}
            aria-label={config.interaction.enabled ? "关闭形场交互" : "开启形场交互"}
            onClick={() => setInteractionEnabled(!config.interaction.enabled)}
          >
            <span className="setting-icon" aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
              </svg>
            </span>
            <span className="interaction-toggle__copy">
              <strong className="interaction-toggle__label">形场交互</strong>
              <span className="interaction-toggle__state">{STATUS_LABELS[runtimeStatus]}</span>
            </span>
            <span className="switch-track" aria-hidden="true" />
          </button>
          <p className="interaction-note">
            <span>Hover 打光（常驻）· 拖拽旋转 · 滚轮缩放</span>
            <span>{config.interaction.holdMode === "freeze"
              ? "单击脉冲 · 长按冻结 · 松开渐进恢复"
              : "单击脉冲 · 长按吸附 · Shift 长按排斥"}</span>
          </p>
        </section>

        <section className="panel-section">
          <SectionHeading index="02" title="形态目录" />
          <div className="motion-controls">
            <div className="motion-control">
              <div className="motion-control__label"><span>HOLD</span><strong>长按行为</strong></div>
              <div className="mode-segments mode-segments--two" role="group" aria-label="选择长按行为">
                {(["magnet", "freeze"] as const).map((mode) => (
                  <button
                    key={mode}
                    className="mode-segment"
                    type="button"
                    aria-pressed={config.interaction.holdMode === mode}
                    onClick={() => setHoldMode(mode)}
                  >
                    <span className="mode-segment__signal" />
                    {mode === "magnet" ? "磁力" : "冻结"}
                  </button>
                ))}
              </div>
            </div>
            <div className="motion-control">
              <div className="motion-control__label">
                <span>FORM LIBRARY</span>
                <strong>{GEOMETRY_DEFINITIONS.length} 个注册形态</strong>
              </div>
              <div className="mode-segments mode-segments--shapes" role="group" aria-label="选择几何形态">
                {GEOMETRY_DEFINITIONS.map((definition) => (
                  <button
                    key={definition.id}
                    className="mode-segment shape-segment"
                    type="button"
                    aria-pressed={config.shape === definition.id}
                    onClick={() => setShape(definition.id)}
                  >
                    <span className={`shape-mark shape-mark--${definition.mark}`} />
                    {definition.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="panel-section">
          <SectionHeading index="03" title="创作参数">
            <button className="section-reset" type="button" onClick={resetParameters}>RESET</button>
          </SectionHeading>
          <div className="parameter-grid">
            <ParameterSlider label="流动速度" code="SPD" value={config.motion.flowSpeed} min={0} max={2} step={0.05} digits={2} onChange={(value) => setMotionValue("flowSpeed", value)} />
            <ParameterSlider label="星点尺寸" code="PTS" value={config.motion.pointScale} min={0.55} max={1.8} step={0.05} digits={2} onChange={(value) => setMotionValue("pointScale", value)} />
            <ParameterSlider label="变形时长" code="MRP" value={config.motion.morphDuration} min={0.25} max={2.6} step={0.05} suffix="s" digits={2} onChange={(value) => setMotionValue("morphDuration", value)} />
            <ParameterSlider label="光照半径" code="RAD" value={config.effects.hoverRadius} min={70} max={260} step={5} suffix="px" digits={0} onChange={(value) => setEffectValue("hoverRadius", value)} />
            <ParameterSlider label="光照强度" code="LUX" value={config.effects.hoverIntensity} min={0} max={1.5} step={0.05} digits={2} onChange={(value) => setEffectValue("hoverIntensity", value)} />
            <ParameterSlider label="尾迹强度" code="TRL" value={config.effects.trailIntensity} min={0} max={1.5} step={0.05} digits={2} onChange={(value) => setEffectValue("trailIntensity", value)} />
          </div>
        </section>

        <section className="panel-section">
          <SectionHeading index="04" title="主题预设" />
          <div className="theme-grid" role="group" aria-label="选择主题预设">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                className="theme-preset"
                type="button"
                aria-pressed={activePreset?.id === preset.id}
                aria-label={preset.label}
                title={preset.label}
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
          <SectionHeading index="05" title="自定义颜色" />
          <div className="color-controls">
            {([
              ["background", "背景色"],
              ["star", "星点色"],
              ["glow", "光照色"]
            ] as const).map(([channel, label]) => (
              <label className="color-control" key={channel}>
                <span className="color-control__name">{label}</span>
                <output>{config.theme[channel].toUpperCase()}</output>
                <input
                  type="color"
                  value={config.theme[channel]}
                  aria-label={`选择${label}`}
                  onChange={(event) => setThemeColor(channel, event.target.value)}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="panel-section panel-section--export">
          <SectionHeading index="06" title="源码分发" />
          <ExportPanel config={config} />
        </section>

        <footer className="panel-footer">
          <button className="panel-action" type="button" onClick={() => starFieldRef.current?.resetView()}>
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />
            </svg>
            复位视角
          </button>
          <button className="panel-action" type="button" onClick={resetTheme}>恢复黑白</button>
        </footer>
      </div>
    </aside>
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
