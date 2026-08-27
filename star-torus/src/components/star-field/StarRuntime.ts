import {
  resolveInteractionActions,
  type RuntimeStatus,
  type StarFieldConfig,
  type StarInteractionActions
} from "@/domain/star-field";

const FRAME_DURATION_MS = 1000 / 60;
const LONG_PRESS_DELAY_MS = 280;
const DRAG_THRESHOLD_PX = 8;
const DEFAULT_ROTATION_X = 0.5;
const DEFAULT_ROTATION_Y = -0.5;
const PARALLAX_ROTATION_X = 0.075;
const PARALLAX_ROTATION_Y = 0.11;
const ENERGY_WAVE_DURATION_SECONDS = 1.05;
const ENERGY_WAVE_BAND_PX = 38;

export const ENERGY_WAVE_COUNT = 4;

type StatusListener = (status: RuntimeStatus) => void;

interface FinishPointerEvent {
  pointerId: number;
  clientX?: number;
  clientY?: number;
  pointerType?: string;
}

export class StarRuntime {
  config: StarFieldConfig;
  rotationX = DEFAULT_ROTATION_X;
  rotationY = DEFAULT_ROTATION_Y;
  parallaxX = 0;
  parallaxY = 0;
  velocityX = 0;
  velocityY = 0;
  zoom = 1;
  lightStrength = 0;
  magnetStrength = 0;
  burstScale = 0;
  simulationSeconds = 0;
  pointerX = 360;
  pointerY = 360;
  viewportWidth = 720;
  viewportHeight = 720;
  trailStrength = 0;
  timeScale = 1;

  readonly waveX = new Float32Array(ENERGY_WAVE_COUNT);
  readonly waveY = new Float32Array(ENERGY_WAVE_COUNT);
  readonly waveRadius = new Float32Array(ENERGY_WAVE_COUNT);
  readonly wavePower = new Float32Array(ENERGY_WAVE_COUNT);

  private canvas: HTMLCanvasElement | null = null;
  private interactionActions: StarInteractionActions;
  private statusListener?: StatusListener;
  private status: RuntimeStatus = "disabled";
  private pointerInside = false;
  private dragging = false;
  private activePointerId: number | null = null;
  private pressCandidate = false;
  private dragMoved = false;
  private pressStartedAt = 0;
  private pressStartClientX = 0;
  private pressStartClientY = 0;
  private lastClientX = 0;
  private lastClientY = 0;
  private lastPointerAt = 0;
  private magnetMode = 0;
  private magnetPolarity = 1;
  private freezeEngaged = false;
  private targetZoom = 1;
  private resetting = false;
  private waveCursor = 0;
  private readonly waveStartedAt = new Float64Array(ENERGY_WAVE_COUNT);
  private readonly waveActive = new Uint8Array(ENERGY_WAVE_COUNT);

  constructor(config: StarFieldConfig, statusListener?: StatusListener) {
    this.config = config;
    this.interactionActions = resolveInteractionActions(config.interaction);
    this.statusListener = statusListener;
    this.emitStatus(true);
  }

  setConfig(config: StarFieldConfig): void {
    const interactionWasEnabled = this.config.interaction.enabled;
    this.config = config;
    this.interactionActions = resolveInteractionActions(config.interaction);

    if (
      (interactionWasEnabled && !config.interaction.enabled)
      || (this.dragging && !this.hasPressInteraction())
    ) {
      this.cancelPointer();
    }

    if (!this.interactionActions.dragRotate) {
      this.velocityX = 0;
      this.velocityY = 0;
    }

    if (!this.interactionActions.holdAction) {
      this.setMagnetMode(0);
      this.setFreezeEngaged(false);
    } else if (config.interaction.holdMode === "freeze") {
      this.setMagnetMode(0);
    } else {
      this.setFreezeEngaged(false);
    }

    this.syncCanvasClasses();
    this.emitStatus();
  }

  setStatusListener(listener?: StatusListener): void {
    this.statusListener = listener;
    this.emitStatus(true);
  }

  setViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  attach(canvas: HTMLCanvasElement): () => void {
    this.canvas = canvas;
    canvas.addEventListener("pointerdown", this.handlePointerDown);
    canvas.addEventListener("pointermove", this.handlePointerMove);
    canvas.addEventListener("pointerup", this.handlePointerUp);
    canvas.addEventListener("pointercancel", this.handlePointerCancel);
    canvas.addEventListener("lostpointercapture", this.handleLostPointerCapture);
    canvas.addEventListener("pointerenter", this.handlePointerEnter);
    canvas.addEventListener("pointerleave", this.handlePointerLeave);
    canvas.addEventListener("wheel", this.handleWheel, { passive: false });
    canvas.addEventListener("dblclick", this.handleDoubleClick);
    canvas.addEventListener("contextmenu", this.handleContextMenu);
    window.addEventListener("blur", this.handleWindowBlur);
    this.syncCanvasClasses();

    return () => {
      this.cancelPointer();
      canvas.removeEventListener("pointerdown", this.handlePointerDown);
      canvas.removeEventListener("pointermove", this.handlePointerMove);
      canvas.removeEventListener("pointerup", this.handlePointerUp);
      canvas.removeEventListener("pointercancel", this.handlePointerCancel);
      canvas.removeEventListener("lostpointercapture", this.handleLostPointerCapture);
      canvas.removeEventListener("pointerenter", this.handlePointerEnter);
      canvas.removeEventListener("pointerleave", this.handlePointerLeave);
      canvas.removeEventListener("wheel", this.handleWheel);
      canvas.removeEventListener("dblclick", this.handleDoubleClick);
      canvas.removeEventListener("contextmenu", this.handleContextMenu);
      window.removeEventListener("blur", this.handleWindowBlur);
      canvas.classList.remove(
        "is-interactive",
        "is-dragging",
        "is-attracting",
        "is-repelling",
        "is-freezing"
      );
      if (this.canvas === canvas) this.canvas = null;
    };
  }

  resetView(): void {
    this.resetting = true;
    this.targetZoom = 1;
  }

  step(deltaSeconds: number, nowMs: number): void {
    const deltaFrames = Math.min(3, Math.max(0.25, deltaSeconds * 60));

    if (
      this.config.interaction.enabled
      && this.interactionActions.holdAction
      && this.dragging
      && this.pressCandidate
      && this.magnetMode === 0
      && !this.freezeEngaged
      && nowMs - this.pressStartedAt >= LONG_PRESS_DELAY_MS
    ) {
      if (this.config.interaction.holdMode === "freeze") {
        this.setFreezeEngaged(true);
      } else {
        this.setMagnetMode(this.magnetPolarity);
      }
    }

    const timeScaleTarget = this.freezeEngaged ? 0 : 1;
    const timeScaleEase = 1 - Math.pow(this.freezeEngaged ? 0.62 : 0.88, deltaFrames);
    this.timeScale += (timeScaleTarget - this.timeScale) * timeScaleEase;
    if (this.freezeEngaged && this.timeScale < 0.001) this.timeScale = 0;
    if (!this.freezeEngaged && 1 - this.timeScale < 0.001) this.timeScale = 1;

    if (this.resetting) {
      const resetEase = 1 - Math.pow(0.8, deltaFrames);
      const deltaX = shortestAngle(this.rotationX, DEFAULT_ROTATION_X);
      const deltaY = shortestAngle(this.rotationY, DEFAULT_ROTATION_Y);
      this.rotationX += deltaX * resetEase;
      this.rotationY += deltaY * resetEase;
      this.velocityX = 0;
      this.velocityY = 0;

      if (Math.abs(deltaX) + Math.abs(deltaY) < 0.001) {
        this.rotationX = DEFAULT_ROTATION_X;
        this.rotationY = DEFAULT_ROTATION_Y;
        this.resetting = false;
      }
    } else if (
      this.config.interaction.enabled
      && this.interactionActions.dragRotate
      && !this.dragging
    ) {
      this.rotationX += this.velocityX * deltaFrames * this.timeScale;
      this.rotationY += this.velocityY * deltaFrames * this.timeScale;
      const damping = Math.pow(0.9, deltaFrames * this.timeScale);
      this.velocityX *= damping;
      this.velocityY *= damping;
      if (Math.abs(this.velocityX) < 0.00002) this.velocityX = 0;
      if (Math.abs(this.velocityY) < 0.00002) this.velocityY = 0;
    }

    const magnetTarget = this.config.interaction.enabled
      && this.interactionActions.holdAction
      && this.dragging
      ? this.magnetMode
      : 0;
    const magnetEase = 1 - Math.pow(magnetTarget === 0 ? 0.78 : 0.66, deltaFrames);
    this.magnetStrength += (magnetTarget - this.magnetStrength) * magnetEase;

    const lightTarget = this.pointerInside && this.interactionActions.hoverLight
      ? this.config.effects.hoverIntensity
      : 0;
    const lightEase = 1 - Math.pow(lightTarget > this.lightStrength ? 0.45 : 0.82, deltaFrames);
    this.lightStrength += (lightTarget - this.lightStrength) * lightEase;
    this.burstScale *= Math.pow(0.84, deltaFrames);

    const parallaxActive = this.config.interaction.enabled
      && this.interactionActions.pointerParallax
      && this.pointerInside
      && !this.dragging;
    const normalizedPointerX = parallaxActive
      ? Math.min(1, Math.max(-1, this.pointerX / Math.max(1, this.viewportWidth) * 2 - 1))
      : 0;
    const normalizedPointerY = parallaxActive
      ? Math.min(1, Math.max(-1, this.pointerY / Math.max(1, this.viewportHeight) * 2 - 1))
      : 0;
    const targetParallaxX = normalizedPointerY * PARALLAX_ROTATION_X;
    const targetParallaxY = normalizedPointerX * PARALLAX_ROTATION_Y;
    const parallaxEase = 1 - Math.pow(parallaxActive ? 0.72 : 0.82, deltaFrames);
    this.parallaxX += (targetParallaxX - this.parallaxX) * parallaxEase;
    this.parallaxY += (targetParallaxY - this.parallaxY) * parallaxEase;
    if (!parallaxActive && Math.abs(this.parallaxX) < 0.0001) this.parallaxX = 0;
    if (!parallaxActive && Math.abs(this.parallaxY) < 0.0001) this.parallaxY = 0;

    const zoomEase = 1 - Math.pow(0.76, deltaFrames);
    this.zoom += (this.targetZoom - this.zoom) * zoomEase;
    if (Math.abs(this.targetZoom - this.zoom) < 0.0001) this.zoom = this.targetZoom;

    this.simulationSeconds += deltaFrames / 60 * this.timeScale * this.config.motion.flowSpeed;
    this.updateEnergyWaves();

    const motionSpeed = Math.hypot(this.velocityX, this.velocityY);
    const normalizedSpeed = this.config.interaction.enabled && this.interactionActions.dragRotate
      ? clamp01((motionSpeed - 0.014) / 0.05)
      : 0;
    const easedSpeed = normalizedSpeed * normalizedSpeed * (3 - normalizedSpeed * 2);
    const normalizedIntensity = clamp01(this.config.effects.trailIntensity / 1.5);
    this.trailStrength = easedSpeed * normalizedIntensity * 0.9;
  }

  writeWaveData(target: Float32Array): void {
    for (let index = 0; index < ENERGY_WAVE_COUNT; index += 1) {
      const targetIndex = index * 4;
      target[targetIndex] = this.waveX[index];
      target[targetIndex + 1] = this.waveY[index];
      target[targetIndex + 2] = this.waveRadius[index];
      target[targetIndex + 3] = this.wavePower[index];
    }
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (!this.hasPressInteraction() || event.button !== 0 || this.dragging) return;
    event.preventDefault();
    this.activePointerId = event.pointerId;
    this.dragging = true;
    this.dragMoved = false;
    this.pressCandidate = true;
    this.pressStartedAt = performance.now();
    this.pressStartClientX = event.clientX;
    this.pressStartClientY = event.clientY;
    this.magnetPolarity = event.shiftKey ? -1 : 1;
    this.setMagnetMode(0);
    this.resetting = false;
    this.velocityX = 0;
    this.velocityY = 0;
    this.lastClientX = event.clientX;
    this.lastClientY = event.clientY;
    this.lastPointerAt = event.timeStamp;
    this.updatePointerPosition(event.clientX, event.clientY);
    this.pointerInside = true;
    this.canvas?.setPointerCapture(event.pointerId);
    this.syncCanvasClasses();
    this.emitStatus();
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    this.pointerInside = true;

    if (!this.dragging) {
      this.updatePointerPosition(event.clientX, event.clientY);
      return;
    }
    if (event.pointerId !== this.activePointerId || !this.hasPressInteraction()) return;

    event.preventDefault();
    const coalescedEvents = event.getCoalescedEvents?.() ?? [];
    const samples = coalescedEvents.length > 0 ? coalescedEvents : [event];

    for (const sample of samples) {
      const bounds = this.updatePointerPosition(sample.clientX, sample.clientY);
      if (
        this.interactionActions.holdAction
        && this.pressCandidate
        && this.magnetMode === 0
      ) {
        this.magnetPolarity = sample.shiftKey ? -1 : 1;
      }

      if (this.magnetMode !== 0 || this.freezeEngaged) {
        this.updateLastPointerSample(sample);
        continue;
      }

      if (!this.dragMoved) {
        const distanceFromPress = Math.hypot(
          sample.clientX - this.pressStartClientX,
          sample.clientY - this.pressStartClientY
        );
        if (distanceFromPress > DRAG_THRESHOLD_PX) {
          this.dragMoved = true;
          this.pressCandidate = false;
        }
      }

      if (!this.dragMoved || !this.interactionActions.dragRotate) {
        this.updateLastPointerSample(sample);
        continue;
      }

      const deltaX = (sample.clientX - this.lastClientX) * Math.PI / bounds.width * 0.78;
      const deltaY = (sample.clientY - this.lastClientY) * Math.PI / bounds.height * 0.78;
      const elapsed = Math.max(4, sample.timeStamp - this.lastPointerAt);
      const velocityScale = FRAME_DURATION_MS / elapsed;
      this.rotationX += deltaY;
      this.rotationY += deltaX;
      this.velocityX = this.velocityX * 0.68 + deltaY * velocityScale * 0.32;
      this.velocityY = this.velocityY * 0.68 + deltaX * velocityScale * 0.32;
      this.updateLastPointerSample(sample);
    }
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    this.finishPointer(event, false);
  };

  private readonly handlePointerCancel = (event: PointerEvent): void => {
    this.finishPointer(event, true);
  };

  private readonly handleLostPointerCapture = (event: PointerEvent): void => {
    this.finishPointer(event, true);
  };

  private readonly handlePointerEnter = (event: PointerEvent): void => {
    this.pointerInside = true;
    this.updatePointerPosition(event.clientX, event.clientY);
    if (this.interactionActions.hoverLight) {
      this.lightStrength = Math.max(
        this.lightStrength,
        this.config.effects.hoverIntensity * 0.55
      );
    }
  };

  private readonly handlePointerLeave = (): void => {
    this.pointerInside = false;
  };

  private readonly handleWheel = (event: WheelEvent): void => {
    if (!this.config.interaction.enabled || !this.interactionActions.wheelZoom) return;
    event.preventDefault();
    this.updatePointerPosition(event.clientX, event.clientY);
    this.pointerInside = true;
    const delta = event.deltaMode === 1
      ? event.deltaY * 16
      : (event.deltaMode === 2 ? event.deltaY * this.viewportHeight : event.deltaY);
    this.targetZoom = Math.min(1.5, Math.max(0.62, this.targetZoom * Math.exp(-delta * 0.0014)));
    if (this.interactionActions.hoverLight) {
      this.lightStrength = Math.max(
        this.lightStrength,
        this.config.effects.hoverIntensity * 0.5
      );
    }
  };

  private readonly handleDoubleClick = (event: MouseEvent): void => {
    if (
      !this.config.interaction.enabled
      || (!this.interactionActions.dragRotate && !this.interactionActions.wheelZoom)
    ) return;
    event.preventDefault();
    this.resetView();
  };

  private readonly handleContextMenu = (event: MouseEvent): void => {
    if (this.hasCanvasInteraction()) event.preventDefault();
  };

  private readonly handleWindowBlur = (): void => {
    this.pointerInside = false;
    this.cancelPointer();
  };

  private finishPointer(event: FinishPointerEvent, cancelled: boolean): void {
    if (!this.dragging || event.pointerId !== this.activePointerId) return;
    if (Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
      this.updatePointerPosition(event.clientX as number, event.clientY as number);
    }

    const heldLongEnough = performance.now() - this.pressStartedAt >= LONG_PRESS_DELAY_MS;
    const usedHoldAction = this.interactionActions.holdAction && (
      this.magnetMode !== 0
      || this.freezeEngaged
      || (this.pressCandidate && heldLongEnough)
    );
    const completedDrag = this.dragMoved && this.interactionActions.dragRotate;
    const shouldPulse = !cancelled
      && this.interactionActions.clickPulse
      && this.pressCandidate
      && !this.dragMoved
      && !usedHoldAction;
    const pointerId = this.activePointerId;
    this.dragging = false;
    this.pressCandidate = false;
    this.dragMoved = false;
    this.pressStartedAt = 0;
    this.setMagnetMode(0);
    this.setFreezeEngaged(false);

    if (shouldPulse) {
      this.emitEnergyWave(this.pointerX, this.pointerY);
    } else if (!cancelled && completedDrag) {
      this.burstScale = Math.max(
        this.burstScale,
        Math.min(0.035, Math.hypot(this.velocityX, this.velocityY) * 0.35)
      );
    }

    if (event.pointerType && event.pointerType !== "mouse") this.pointerInside = false;
    if (pointerId !== null && this.canvas?.hasPointerCapture(pointerId)) {
      this.canvas.releasePointerCapture(pointerId);
    }
    this.activePointerId = null;
    this.syncCanvasClasses();
    this.emitStatus();
  }

  private cancelPointer(): void {
    if (this.dragging && this.activePointerId !== null) {
      this.finishPointer({ pointerId: this.activePointerId }, true);
    }
    this.dragging = false;
    this.activePointerId = null;
    this.pressCandidate = false;
    this.dragMoved = false;
    this.setMagnetMode(0);
    this.setFreezeEngaged(false);
    this.syncCanvasClasses();
    this.emitStatus();
  }

  private updatePointerPosition(clientX: number, clientY: number): DOMRect {
    const bounds = this.canvas?.getBoundingClientRect() ?? new DOMRect(0, 0, 720, 720);
    this.pointerX = clientX - bounds.left;
    this.pointerY = clientY - bounds.top;
    this.setViewport(bounds.width, bounds.height);
    return bounds;
  }

  private updateLastPointerSample(sample: PointerEvent): void {
    this.lastClientX = sample.clientX;
    this.lastClientY = sample.clientY;
    this.lastPointerAt = sample.timeStamp;
  }

  private hasPressInteraction(): boolean {
    return this.config.interaction.enabled && (
      this.interactionActions.dragRotate
      || this.interactionActions.clickPulse
      || this.interactionActions.holdAction
    );
  }

  private hasCanvasInteraction(): boolean {
    return this.hasPressInteraction()
      || (this.config.interaction.enabled && (
        this.interactionActions.wheelZoom
        || this.interactionActions.pointerParallax
      ));
  }

  private setMagnetMode(mode: number): void {
    const normalizedMode = Math.sign(mode);
    if (this.magnetMode === normalizedMode) return;
    this.magnetMode = normalizedMode;
    this.syncCanvasClasses();
    this.emitStatus();
  }

  private setFreezeEngaged(enabled: boolean): void {
    if (this.freezeEngaged === enabled) return;
    this.freezeEngaged = enabled;
    this.syncCanvasClasses();
    this.emitStatus();
  }

  private emitEnergyWave(x: number, y: number): void {
    const slot = this.waveCursor;
    this.waveX[slot] = x;
    this.waveY[slot] = y;
    this.waveStartedAt[slot] = this.simulationSeconds;
    this.waveActive[slot] = 1;
    this.waveCursor = (this.waveCursor + 1) % ENERGY_WAVE_COUNT;
    this.burstScale = Math.max(this.burstScale, 0.018);
  }

  private updateEnergyWaves(): void {
    const maxRadius = Math.hypot(this.viewportWidth, this.viewportHeight) * 1.05;

    for (let index = 0; index < ENERGY_WAVE_COUNT; index += 1) {
      if (!this.waveActive[index]) {
        this.wavePower[index] = 0;
        continue;
      }

      const progress = (this.simulationSeconds - this.waveStartedAt[index])
        / ENERGY_WAVE_DURATION_SECONDS;
      if (progress >= 1) {
        this.waveActive[index] = 0;
        this.wavePower[index] = 0;
        continue;
      }

      this.waveRadius[index] = progress * maxRadius;
      this.wavePower[index] = Math.pow(1 - progress, 0.42);
    }
  }

  private syncCanvasClasses(): void {
    if (!this.canvas) return;
    this.canvas.classList.toggle("is-interactive", this.hasCanvasInteraction());
    this.canvas.classList.toggle(
      "is-dragging",
      this.interactionActions.dragRotate
        && this.dragging
        && this.magnetMode === 0
        && !this.freezeEngaged
    );
    this.canvas.classList.toggle("is-attracting", this.magnetMode > 0);
    this.canvas.classList.toggle("is-repelling", this.magnetMode < 0);
    this.canvas.classList.toggle("is-freezing", this.freezeEngaged);
  }

  private emitStatus(force = false): void {
    const nextStatus: RuntimeStatus = !this.config.interaction.enabled
      ? "disabled"
      : this.freezeEngaged
        ? "frozen"
        : this.magnetMode > 0
          ? "attracting"
          : this.magnetMode < 0
            ? "repelling"
            : this.dragging
              ? "dragging"
              : "idle";

    if (!force && nextStatus === this.status) return;
    this.status = nextStatus;
    this.statusListener?.(nextStatus);
  }
}

export const ENERGY_WAVE_BAND_WIDTH = ENERGY_WAVE_BAND_PX;

function shortestAngle(from: number, to: number): number {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
