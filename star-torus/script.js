(() => {
  const canvas = document.querySelector("canvas");
  const context = canvas.getContext("2d");
  const toggle = document.getElementById("interactionToggle");
  const toggleState = toggle.querySelector(".interaction-toggle__state");
  const interactionModeHint = document.getElementById("interactionModeHint");
  const holdModeButtons = [...document.querySelectorAll("[data-hold-mode]")];
  const shapeButtons = [...document.querySelectorAll("[data-shape]")];
  const controlPanel = document.getElementById("controlPanel");
  const panelToggle = document.getElementById("panelToggle");
  const panelSurface = document.getElementById("panelSurface");
  const panelToggleText = panelToggle.querySelector(".sr-only");
  const activeThemeName = document.getElementById("activeThemeName");
  const presetButtons = [...document.querySelectorAll(".theme-preset")];
  const backgroundInput = document.getElementById("backgroundColor");
  const starInput = document.getElementById("starColor");
  const glowInput = document.getElementById("glowColor");
  const backgroundValue = document.getElementById("backgroundValue");
  const starValue = document.getElementById("starValue");
  const glowValue = document.getElementById("glowValue");
  const resetViewButton = document.getElementById("resetView");
  const resetThemeButton = document.getElementById("resetTheme");
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const rootStyle = document.documentElement.style;

  const themePresets = Object.freeze({
    mono: { readout: "MONO", background: "#000000", star: "#FFFFFF", glow: "#FFFFFF" },
    deep: { readout: "DEEP", background: "#050816", star: "#7DD3FC", glow: "#BAE6FD" },
    nebula: { readout: "NEBULA", background: "#0A0613", star: "#C4B5FD", glow: "#E9D5FF" },
    ember: { readout: "EMBER", background: "#120805", star: "#FB923C", glow: "#FDBA74" },
    aurora: { readout: "AURORA", background: "#03120D", star: "#6EE7B7", glow: "#A7F3D0" },
    pearl: { readout: "LUNAR", background: "#F3F0E8", star: "#171717", glow: "#B45309" }
  });

  const sourceSize = 600;
  const outputScale = canvas.width / sourceSize;
  const center = sourceSize / 2;
  const cameraZ = center / Math.tan(Math.PI / 6);
  const p = Math.PI / 40;
  const r = 90;
  const tau = Math.PI * 2;
  const frameDuration = 1000 / 60;
  const columns = 80;
  const rows = 40;
  const pointCount = columns * rows;
  const framePadding = 24;
  const defaultRotationX = 0.5;
  const defaultRotationY = -0.5;
  const sphereGeometryRadius = 225;
  const mobiusRingRadius = 176;
  const mobiusHalfWidth = 88;
  const shapeIds = Object.freeze(["torus", "sphere", "mobius"]);
  const shapeLabels = Object.freeze({ torus: "三维星环", sphere: "三维球体", mobius: "莫比乌斯环" });
  const baseSinU = new Float32Array(columns);
  const baseCosU = new Float32Array(columns);
  const baseSinV = new Float32Array(rows);
  const baseCosV = new Float32Array(rows);
  const frameSinU = new Float32Array(columns);
  const frameCosU = new Float32Array(columns);
  const frameSinHalfU = new Float32Array(columns);
  const frameCosHalfU = new Float32Array(columns);
  const frameSinV = new Float32Array(rows);
  const frameCosV = new Float32Array(rows);
  const sphereSinLatitude = new Float32Array(rows);
  const sphereCosLatitude = new Float32Array(rows);
  const mobiusStripOffset = new Float32Array(rows);
  const projectedX = new Float32Array(pointCount);
  const projectedY = new Float32Array(pointCount);
  const projectedRadius = new Float32Array(pointCount);
  const renderedX = new Float32Array(pointCount);
  const renderedY = new Float32Array(pointCount);
  const renderedRadius = new Float32Array(pointCount);
  const renderedLight = new Float32Array(pointCount);
  const previousRenderedX = new Float32Array(pointCount);
  const previousRenderedY = new Float32Array(pointCount);
  const litIndices = new Uint16Array(pointCount);
  const lightRadius = 170;
  const lightRadiusSquared = lightRadius * lightRadius;
  const lightBands = Object.freeze([
    { min: 0.1, max: 0.36, alpha: 0.35, scale: 0.8 },
    { min: 0.36, max: 0.68, alpha: 0.68, scale: 0.88 },
    { min: 0.68, max: 1.01, alpha: 0.94, scale: 0.96 }
  ]);
  const longPressDelay = 280;
  const dragThreshold = 8;
  const maxEnergyWaves = 4;
  const energyWaveDuration = 1050;
  const energyWaveBandWidth = 38;
  const energyWaveMaxRadius = Math.hypot(canvas.width, canvas.height) * 1.05;
  const energyWaveX = new Float32Array(maxEnergyWaves);
  const energyWaveY = new Float32Array(maxEnergyWaves);
  const energyWaveStartedAt = new Float64Array(maxEnergyWaves);
  const energyWaveRadius = new Float32Array(maxEnergyWaves);
  const energyWavePower = new Float32Array(maxEnergyWaves);
  const energyWaveActive = new Uint8Array(maxEnergyWaves);
  const shapeWeights = new Float32Array([1, 0, 0]);
  const shapeFromWeights = new Float32Array([1, 0, 0]);
  const shapeTargetWeights = new Float32Array([1, 0, 0]);

  let previousAt;
  let lastRenderedAt = -Infinity;
  let animationFrame = 0;
  let interactionEnabled = false;
  let dragging = false;
  let activePointerId = null;
  let rotationX = defaultRotationX;
  let rotationY = defaultRotationY;
  let velocityX = 0;
  let velocityY = 0;
  let magnetStrength = 0;
  let magnetMode = 0;
  let magnetPolarity = 1;
  let holdMode = "magnet";
  let freezeEngaged = false;
  let timeScale = 1;
  let simulationFrame = 0;
  let simulationTimeMs = 0;
  let pressCandidate = false;
  let dragMoved = false;
  let pressStartedAt = 0;
  let pressStartClientX = 0;
  let pressStartClientY = 0;
  let lightStrength = 0;
  let burstScale = 0;
  let zoom = 1;
  let targetZoom = 1;
  let zoomOriginX = canvas.width / 2;
  let zoomOriginY = canvas.height / 2;
  let resetting = false;
  let pointerInside = false;
  let pointerX = canvas.width / 2;
  let pointerY = canvas.height / 2;
  let lastClientX = 0;
  let lastClientY = 0;
  let lastPointerAt = 0;
  let energyWaveCursor = 0;
  let hasPreviousFrame = false;
  let activeShape = "torus";
  let shapeTransitionStartedAt = 0;
  let renderedTheme = {
    background: hexToRgb(themePresets.mono.background),
    star: hexToRgb(themePresets.mono.star),
    glow: hexToRgb(themePresets.mono.glow)
  };
  let themeFrom = cloneThemeRgb(renderedTheme);
  let themeTarget = cloneThemeRgb(renderedTheme);
  let themeTransitionStartedAt = 0;
  const themeTransitionDuration = 320;
  const shapeTransitionDuration = 1350;
  const themeStorageKey = "star-torus-theme-v1";
  const panelStorageKey = "star-torus-panel-v1";
  const holdModeStorageKey = "star-torus-hold-mode-v1";
  const shapeStorageKey = "star-torus-shape-v1";

  for (let x = 0; x < columns; x += 1) {
    baseSinU[x] = Math.sin(x * p);
    baseCosU[x] = Math.cos(x * p);
  }

  for (let y = 0; y < rows; y += 1) {
    baseSinV[y] = Math.sin(y * p * 2);
    baseCosV[y] = Math.cos(y * p * 2);
    const normalizedRow = (y + 0.5) / rows;
    const latitude = (normalizedRow - 0.5) * Math.PI;
    sphereSinLatitude[y] = Math.sin(latitude);
    sphereCosLatitude[y] = Math.cos(latitude);
    mobiusStripOffset[y] = (normalizedRow * 2 - 1) * mobiusHalfWidth;
  }

  function normalizeHex(value, fallback = "#000000") {
    const candidate = String(value || "").trim();
    if (/^#[0-9a-f]{6}$/i.test(candidate)) return candidate.toUpperCase();
    if (/^#[0-9a-f]{3}$/i.test(candidate)) {
      return `#${candidate.slice(1).split("").map((part) => part + part).join("")}`.toUpperCase();
    }
    return fallback;
  }

  function hexToRgb(hex) {
    const normalized = normalizeHex(hex);
    return {
      r: Number.parseInt(normalized.slice(1, 3), 16),
      g: Number.parseInt(normalized.slice(3, 5), 16),
      b: Number.parseInt(normalized.slice(5, 7), 16)
    };
  }

  function cloneRgb(rgb) {
    return { r: rgb.r, g: rgb.g, b: rgb.b };
  }

  function cloneThemeRgb(theme) {
    return {
      background: cloneRgb(theme.background),
      star: cloneRgb(theme.star),
      glow: cloneRgb(theme.glow)
    };
  }

  function rgbChannels(rgb) {
    return `${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}`;
  }

  function relativeLuminance(rgb) {
    const channels = [rgb.r, rgb.g, rgb.b].map((value) => {
      const channel = value / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }

  function findMatchingPreset(theme) {
    return Object.entries(themePresets).find(([, preset]) => (
      normalizeHex(preset.background) === normalizeHex(theme.background)
      && normalizeHex(preset.star) === normalizeHex(theme.star)
      && normalizeHex(preset.glow) === normalizeHex(theme.glow)
    ))?.[0] || null;
  }

  function updatePanelContrast(backgroundHex, starHex) {
    const backgroundIsLight = relativeLuminance(hexToRgb(backgroundHex)) > 0.48;
    const panelRgb = backgroundIsLight ? { r: 247, g: 246, b: 242 } : { r: 8, g: 9, b: 12 };
    const inkRgb = backgroundIsLight ? { r: 24, g: 24, b: 26 } : { r: 247, g: 247, b: 244 };
    const starRgb = hexToRgb(starHex);
    const panelLuminance = relativeLuminance(panelRgb);
    const starLuminance = relativeLuminance(starRgb);
    const accent = Math.abs(panelLuminance - starLuminance) > 0.28
      ? normalizeHex(starHex)
      : (backgroundIsLight ? "#171717" : "#FFFFFF");

    rootStyle.setProperty("--panel-rgb", rgbChannels(panelRgb));
    rootStyle.setProperty("--panel-ink-rgb", rgbChannels(inkRgb));
    rootStyle.setProperty("--panel-accent", accent);
    rootStyle.setProperty("--panel-shadow", backgroundIsLight ? "rgba(31, 29, 24, 0.2)" : "rgba(0, 0, 0, 0.48)");
  }

  function updateThemeControls(theme, presetId) {
    const background = normalizeHex(theme.background);
    const star = normalizeHex(theme.star, "#FFFFFF");
    const glow = normalizeHex(theme.glow, star);

    backgroundInput.value = background.toLowerCase();
    starInput.value = star.toLowerCase();
    glowInput.value = glow.toLowerCase();
    backgroundValue.textContent = background;
    starValue.textContent = star;
    glowValue.textContent = glow;

    presetButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.theme === presetId));
    });

    activeThemeName.textContent = presetId && themePresets[presetId]
      ? themePresets[presetId].readout
      : "CUSTOM";
  }

  function persistTheme(theme, presetId) {
    try {
      localStorage.setItem(themeStorageKey, JSON.stringify({
        presetId,
        background: normalizeHex(theme.background),
        star: normalizeHex(theme.star, "#FFFFFF"),
        glow: normalizeHex(theme.glow, theme.star)
      }));
    } catch {
      // file:// contexts may disable localStorage; the live theme still works.
    }
  }

  function applyTheme(theme, { presetId, persist = true, animate = true } = {}) {
    const normalizedTheme = {
      background: normalizeHex(theme.background),
      star: normalizeHex(theme.star, "#FFFFFF"),
      glow: normalizeHex(theme.glow, theme.star || "#FFFFFF")
    };
    const matchingPreset = presetId ?? findMatchingPreset(normalizedTheme);
    themeFrom = cloneThemeRgb(renderedTheme);
    themeTarget = {
      background: hexToRgb(normalizedTheme.background),
      star: hexToRgb(normalizedTheme.star),
      glow: hexToRgb(normalizedTheme.glow)
    };

    if (animate) {
      themeTransitionStartedAt = performance.now();
    } else {
      renderedTheme = cloneThemeRgb(themeTarget);
      themeFrom = cloneThemeRgb(themeTarget);
      themeTransitionStartedAt = 0;
    }

    rootStyle.setProperty("--theme-background", normalizedTheme.background);
    rootStyle.setProperty("--theme-star", normalizedTheme.star);
    rootStyle.setProperty("--theme-glow", normalizedTheme.glow);
    themeColorMeta.setAttribute("content", normalizedTheme.background);
    updatePanelContrast(normalizedTheme.background, normalizedTheme.star);
    updateThemeControls(normalizedTheme, matchingPreset);
    if (persist) persistTheme(normalizedTheme, matchingPreset);
  }

  function updateThemeTransition(now) {
    if (!themeTransitionStartedAt) return;
    const progress = Math.min(1, (now - themeTransitionStartedAt) / themeTransitionDuration);
    const eased = 1 - (1 - progress) ** 3;

    for (const channel of ["background", "star", "glow"]) {
      renderedTheme[channel].r = themeFrom[channel].r + (themeTarget[channel].r - themeFrom[channel].r) * eased;
      renderedTheme[channel].g = themeFrom[channel].g + (themeTarget[channel].g - themeFrom[channel].g) * eased;
      renderedTheme[channel].b = themeFrom[channel].b + (themeTarget[channel].b - themeFrom[channel].b) * eased;
    }

    if (progress === 1) {
      renderedTheme = cloneThemeRgb(themeTarget);
      themeTransitionStartedAt = 0;
    }
  }

  function persistMotionPreference(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Keep the selected mode for the current session when storage is unavailable.
    }
  }

  function setHoldMode(mode, { persist = true } = {}) {
    const nextMode = mode === "freeze" ? "freeze" : "magnet";

    if (dragging && activePointerId !== null) {
      finishDrag({ pointerId: activePointerId }, true);
    }

    holdMode = nextMode;
    setMagnetMode(0);
    setFreezeEngaged(false);
    holdModeButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.holdMode === holdMode));
    });
    interactionModeHint.textContent = holdMode === "freeze"
      ? "单击脉冲 · 长按冻结 · 松开渐进恢复"
      : "单击脉冲 · 长按吸附 · Shift 长按排斥";
    updateInteractionReadout();
    if (persist) persistMotionPreference(holdModeStorageKey, holdMode);
  }

  function setShape(shapeId, { animate = true, persist = true } = {}) {
    const targetIndex = shapeIds.indexOf(shapeId);
    if (targetIndex < 0) return;

    shapeFromWeights.set(shapeWeights);
    shapeTargetWeights.fill(0);
    shapeTargetWeights[targetIndex] = 1;
    activeShape = shapeId;

    if (animate) {
      shapeTransitionStartedAt = performance.now();
    } else {
      shapeWeights.set(shapeTargetWeights);
      shapeFromWeights.set(shapeTargetWeights);
      shapeTransitionStartedAt = 0;
    }

    shapeButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.shape === activeShape));
    });
    canvas.setAttribute("aria-label", `由星点组成并持续流动的${shapeLabels[activeShape]}`);
    if (persist) persistMotionPreference(shapeStorageKey, activeShape);
  }

  function updateShapeTransition(now) {
    if (!shapeTransitionStartedAt) return;
    const progress = Math.min(1, (now - shapeTransitionStartedAt) / shapeTransitionDuration);
    const eased = progress * progress * (3 - progress * 2);

    for (let index = 0; index < shapeWeights.length; index += 1) {
      shapeWeights[index] = shapeFromWeights[index]
        + (shapeTargetWeights[index] - shapeFromWeights[index]) * eased;
    }

    if (progress === 1) {
      shapeWeights.set(shapeTargetWeights);
      shapeTransitionStartedAt = 0;
    }
  }

  function initializeMotionControls() {
    let storedHoldMode = "magnet";
    let storedShape = "torus";

    try {
      storedHoldMode = localStorage.getItem(holdModeStorageKey) || storedHoldMode;
      storedShape = localStorage.getItem(shapeStorageKey) || storedShape;
    } catch {
      // Use the default motion controls when storage is unavailable.
    }

    setHoldMode(storedHoldMode, { persist: false });
    setShape(storedShape, { animate: false, persist: false });
  }

  function setPanelCollapsed(collapsed, persist = true) {
    controlPanel.classList.toggle("is-collapsed", collapsed);
    panelToggle.setAttribute("aria-expanded", String(!collapsed));
    panelToggle.title = collapsed ? "展开控制面板" : "收起控制面板";
    panelToggleText.textContent = collapsed ? "展开控制面板" : "收起控制面板";
    panelSurface.inert = collapsed;
    panelSurface.setAttribute("aria-hidden", String(collapsed));

    if (persist) {
      try {
        localStorage.setItem(panelStorageKey, collapsed ? "collapsed" : "expanded");
      } catch {
        // Keep the in-session panel state when storage is unavailable.
      }
    }
  }

  function resetView() {
    resetting = true;
    targetZoom = 1;
    zoomOriginX = canvas.width / 2;
    zoomOriginY = canvas.height / 2;
  }

  function applyThemeFromInputs() {
    const customTheme = {
      background: backgroundInput.value,
      star: starInput.value,
      glow: glowInput.value
    };
    applyTheme(customTheme, { presetId: findMatchingPreset(customTheme) });
  }

  function initializeThemeAndPanel() {
    let storedTheme = null;
    let panelCollapsed = false;

    try {
      storedTheme = JSON.parse(localStorage.getItem(themeStorageKey));
      panelCollapsed = localStorage.getItem(panelStorageKey) === "collapsed";
    } catch {
      storedTheme = null;
    }

    if (storedTheme?.background && storedTheme?.star && storedTheme?.glow) {
      applyTheme(storedTheme, {
        presetId: storedTheme.presetId || findMatchingPreset(storedTheme),
        persist: false,
        animate: false
      });
    } else {
      applyTheme(themePresets.mono, { presetId: "mono", persist: false, animate: false });
    }

    setPanelCollapsed(panelCollapsed, false);
  }

  function shortestAngle(from, to) {
    return Math.atan2(Math.sin(to - from), Math.cos(to - from));
  }

  function updatePointerPosition(clientX, clientY) {
    const bounds = canvas.getBoundingClientRect();
    pointerX = (clientX - bounds.left) * canvas.width / bounds.width;
    pointerY = (clientY - bounds.top) * canvas.height / bounds.height;
    return bounds;
  }

  function updateInteractionReadout() {
    if (!interactionEnabled) {
      toggleState.textContent = "已关闭";
    } else if (freezeEngaged) {
      toggleState.textContent = "时空冻结";
    } else if (magnetMode > 0) {
      toggleState.textContent = "吸附中";
    } else if (magnetMode < 0) {
      toggleState.textContent = "排斥中";
    } else {
      toggleState.textContent = "已开启";
    }
  }

  function setMagnetMode(mode) {
    const normalizedMode = Math.sign(mode);
    if (magnetMode === normalizedMode) return;
    magnetMode = normalizedMode;
    canvas.classList.toggle("is-attracting", magnetMode > 0);
    canvas.classList.toggle("is-repelling", magnetMode < 0);
    updateInteractionReadout();
  }

  function setFreezeEngaged(enabled) {
    const nextState = Boolean(enabled);
    if (freezeEngaged === nextState) return;
    freezeEngaged = nextState;
    canvas.classList.toggle("is-freezing", freezeEngaged);
    updateInteractionReadout();
  }

  function emitEnergyWave(x, y, now = simulationTimeMs) {
    const slot = energyWaveCursor;
    energyWaveX[slot] = x;
    energyWaveY[slot] = y;
    energyWaveStartedAt[slot] = now;
    energyWaveActive[slot] = 1;
    energyWaveCursor = (energyWaveCursor + 1) % maxEnergyWaves;
    burstScale = Math.max(burstScale, 0.018);
  }

  function updateEnergyWaves(now) {
    let activeCount = 0;

    for (let wave = 0; wave < maxEnergyWaves; wave += 1) {
      if (!energyWaveActive[wave]) continue;
      const progress = (now - energyWaveStartedAt[wave]) / energyWaveDuration;

      if (progress >= 1) {
        energyWaveActive[wave] = 0;
        continue;
      }

      energyWaveRadius[wave] = progress * energyWaveMaxRadius;
      energyWavePower[wave] = Math.pow(1 - progress, 0.42);
      activeCount += 1;
    }

    return activeCount;
  }

  function render(t, now) {
    const uOffset = t * p;
    const vOffset = t * p * 2;
    const sinUOffset = Math.sin(uOffset);
    const cosUOffset = Math.cos(uOffset);
    const sinVOffset = Math.sin(vOffset);
    const cosVOffset = Math.cos(vOffset);
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let index = 0;
    let litCount = 0;
    const activeWaveCount = updateEnergyWaves(now);
    const torusWeight = shapeWeights[0];
    const sphereWeight = shapeWeights[1];
    const mobiusWeight = shapeWeights[2];

    for (let x = 0; x < columns; x += 1) {
      frameSinU[x] = baseSinU[x] * cosUOffset + baseCosU[x] * sinUOffset;
      frameCosU[x] = baseCosU[x] * cosUOffset - baseSinU[x] * sinUOffset;
      const halfU = (x * p + uOffset) * 0.5;
      frameSinHalfU[x] = Math.sin(halfU);
      frameCosHalfU[x] = Math.cos(halfU);
    }

    for (let y = 0; y < rows; y += 1) {
      frameSinV[y] = baseSinV[y] * cosVOffset + baseCosV[y] * sinVOffset;
      frameCosV[y] = baseCosV[y] * cosVOffset - baseSinV[y] * sinVOffset;
    }

    for (let y = rows; y--; ) {
      const sinV = frameSinV[y];
      const cosV = frameCosV[y];
      const torusRingRadius = (2 + sinV) * r;
      const torusZ = cosV * r;
      const torusDotRadius = Math.abs(cosV + 0.3);
      const sinLatitude = sphereSinLatitude[y];
      const cosLatitude = sphereCosLatitude[y];
      const sphereRadial = sphereGeometryRadius * cosLatitude;
      const sphereZ = sphereGeometryRadius * sinLatitude;
      const sphereDotRadius = 0.36 + Math.abs(cosLatitude) * 0.94;
      const stripOffset = mobiusStripOffset[y];
      const normalizedStrip = Math.abs(stripOffset) / mobiusHalfWidth;

      for (let x = columns; x--; ) {
        const sinU = frameSinU[x];
        const cosU = frameCosU[x];
        const sinHalfU = frameSinHalfU[x];
        const cosHalfU = frameCosHalfU[x];
        const torusX = torusRingRadius * cosU;
        const torusY = torusRingRadius * sinU;
        const sphereX = sphereRadial * cosU;
        const sphereY = sphereRadial * sinU;
        const mobiusRadial = mobiusRingRadius + stripOffset * cosHalfU;
        const mobiusX = mobiusRadial * cosU;
        const mobiusY = mobiusRadial * sinU;
        const mobiusZ = stripOffset * sinHalfU;
        const mobiusDotRadius = 0.48
          + (1 - normalizedStrip * 0.35) * (0.52 + Math.abs(cosHalfU) * 0.2);
        const px = torusX * torusWeight + sphereX * sphereWeight + mobiusX * mobiusWeight;
        const py = torusY * torusWeight + sphereY * sphereWeight + mobiusY * mobiusWeight;
        const pz = torusZ * torusWeight + sphereZ * sphereWeight + mobiusZ * mobiusWeight;
        const pointRadius = torusDotRadius * torusWeight
          + sphereDotRadius * sphereWeight
          + mobiusDotRadius * mobiusWeight;

        // 与 p5.js 的 rotateX(0.5)、rotateY(-0.5) 顺序一致。
        const rotatedX = px * cosY + pz * sinY;
        const yAfterX = -px * sinY + pz * cosY;
        const rotatedY = py * cosX - yAfterX * sinX;
        const rotatedZ = py * sinX + yAfterX * cosX;
        const perspective = cameraZ / (cameraZ - rotatedZ);
        const x2d = (center + rotatedX * perspective) * outputScale;
        const y2d = (center + rotatedY * perspective) * outputScale;
        const radius2d = pointRadius * perspective * outputScale;

        projectedX[index] = x2d;
        projectedY[index] = y2d;
        projectedRadius[index] = radius2d;
        index += 1;

        minX = Math.min(minX, x2d - radius2d);
        minY = Math.min(minY, y2d - radius2d);
        maxX = Math.max(maxX, x2d + radius2d);
        maxY = Math.max(maxY, y2d + radius2d);
      }
    }

    const availableSize = canvas.width - framePadding * 2;
    const fitScale = Math.min(1, availableSize / (maxX - minX), availableSize / (maxY - minY));
    const frameCenterX = (minX + maxX) / 2;
    const frameCenterY = (minY + maxY) / 2;
    const visualScale = fitScale * (1 + burstScale);
    const motionSpeed = Math.hypot(velocityX, velocityY);
    const normalizedTrailSpeed = interactionEnabled
      ? Math.min(1, Math.max(0, (motionSpeed - 0.014) / 0.065))
      : 0;
    const dustTrailStrength = normalizedTrailSpeed * normalizedTrailSpeed * (3 - normalizedTrailSpeed * 2);
    const trailStrength = interactionEnabled
      ? Math.min(0.42, dustTrailStrength * 0.32 + Math.abs(targetZoom - zoom) * 0.6)
      : 0;
    const backgroundRgb = rgbChannels(renderedTheme.background);
    const starRgb = rgbChannels(renderedTheme.star);
    const glowRgb = rgbChannels(renderedTheme.glow);

    context.fillStyle = `rgba(${backgroundRgb}, ${1 - trailStrength})`;
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < pointCount; i += 1) {
      const baseX = canvas.width / 2 + (projectedX[i] - frameCenterX) * visualScale;
      const baseY = canvas.height / 2 + (projectedY[i] - frameCenterY) * visualScale;
      let x = zoomOriginX + (baseX - zoomOriginX) * zoom;
      let y = zoomOriginY + (baseY - zoomOriginY) * zoom;
      let radius = projectedRadius[i] * visualScale * zoom;
      let illumination = 0;

      if (Math.abs(magnetStrength) > 0.001 || lightStrength > 0.001) {
        const dx = pointerX - x;
        const dy = pointerY - y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared < lightRadiusSquared) {
          const influence = 1 - distanceSquared / lightRadiusSquared;
          const easedInfluence = influence * influence;

          if (Math.abs(magnetStrength) > 0.001) {
            const pull = easedInfluence * magnetStrength * 0.24;
            x += dx * pull;
            y += dy * pull;
          }

          illumination = easedInfluence * lightStrength;
          radius *= 1 + illumination * 0.72;
        }
      }

      if (activeWaveCount > 0) {
        let strongestWave = 0;
        let waveDirectionX = 0;
        let waveDirectionY = 0;

        for (let wave = 0; wave < maxEnergyWaves; wave += 1) {
          if (!energyWaveActive[wave]) continue;
          const waveDx = x - energyWaveX[wave];
          const waveDy = y - energyWaveY[wave];
          const distance = Math.hypot(waveDx, waveDy);
          const distanceFromFront = Math.abs(distance - energyWaveRadius[wave]);
          if (distanceFromFront >= energyWaveBandWidth) continue;

          const ridge = 1 - distanceFromFront / energyWaveBandWidth;
          const waveInfluence = ridge * ridge * energyWavePower[wave];
          if (waveInfluence <= strongestWave) continue;
          strongestWave = waveInfluence;

          if (distance > 0.001) {
            waveDirectionX = waveDx / distance;
            waveDirectionY = waveDy / distance;
          }
        }

        if (strongestWave > 0) {
          const wavePush = strongestWave * 12;
          x += waveDirectionX * wavePush;
          y += waveDirectionY * wavePush;
          radius *= 1 + strongestWave * 1.15;
          illumination = Math.max(illumination, strongestWave);
        }
      }

      renderedX[i] = x;
      renderedY[i] = y;
      renderedRadius[i] = radius;
      renderedLight[i] = illumination;
      if (illumination >= 0.1) {
        litIndices[litCount] = i;
        litCount += 1;
      }
    }

    if (hasPreviousFrame && dustTrailStrength > 0.08) {
      context.strokeStyle = `rgba(${glowRgb}, ${0.055 + dustTrailStrength * 0.285})`;
      context.lineWidth = 0.58 + dustTrailStrength * 0.88;
      context.lineCap = "round";
      context.beginPath();

      for (let i = 0; i < pointCount; i += 2) {
        const dx = renderedX[i] - previousRenderedX[i];
        const dy = renderedY[i] - previousRenderedY[i];
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < 0.05 || distanceSquared > 3600) continue;

        const distance = Math.sqrt(distanceSquared);
        const maxLength = 12 + dustTrailStrength * 24;
        const stretch = Math.min(1.05 + dustTrailStrength * 3.5, maxLength / distance);
        context.moveTo(renderedX[i] - dx * stretch, renderedY[i] - dy * stretch);
        context.lineTo(renderedX[i], renderedY[i]);
      }

      context.stroke();
    }

    if (litCount > 0) {
      context.fillStyle = `rgba(${glowRgb}, 0.28)`;
      context.beginPath();

      for (let position = 0; position < litCount; position += 1) {
        const i = litIndices[position];
        const illumination = renderedLight[i];
        const glowRadius = renderedRadius[i] + illumination * (1.6 + renderedRadius[i] * 0.18);
        context.moveTo(renderedX[i] + glowRadius, renderedY[i]);
        context.arc(renderedX[i], renderedY[i], glowRadius, 0, tau);
      }

      context.fill();
    }

    context.fillStyle = `rgb(${starRgb})`;
    context.beginPath();

    for (let i = 0; i < pointCount; i += 1) {
      const radius = renderedRadius[i];
      if (radius < 0.01) continue;
      context.moveTo(renderedX[i] + radius, renderedY[i]);
      context.arc(renderedX[i], renderedY[i], radius, 0, tau);
    }

    context.fill();

    if (litCount > 0) {
      context.fillStyle = `rgb(${glowRgb})`;

      for (const band of lightBands) {
        context.globalAlpha = band.alpha;
        context.beginPath();

        for (let position = 0; position < litCount; position += 1) {
          const i = litIndices[position];
          const illumination = renderedLight[i];
          if (illumination < band.min || illumination >= band.max) continue;
          const litRadius = renderedRadius[i] * band.scale;
          context.moveTo(renderedX[i] + litRadius, renderedY[i]);
          context.arc(renderedX[i], renderedY[i], litRadius, 0, tau);
        }

        context.fill();
      }

      context.globalAlpha = 1;
    }

    previousRenderedX.set(renderedX);
    previousRenderedY.set(renderedY);
    hasPreviousFrame = true;
  }

  function animate(now) {
    if (previousAt === undefined) previousAt = now;
    updateThemeTransition(now);
    updateShapeTransition(now);
    const deltaFrames = Math.min(3, Math.max(0.25, (now - previousAt) / frameDuration));
    previousAt = now;

    if (
      interactionEnabled
      && dragging
      && pressCandidate
      && magnetMode === 0
      && !freezeEngaged
      && now - pressStartedAt >= longPressDelay
    ) {
      if (holdMode === "freeze") {
        setFreezeEngaged(true);
      } else {
        setMagnetMode(magnetPolarity);
      }
    }

    const timeScaleTarget = freezeEngaged ? 0 : 1;
    const timeScaleEase = 1 - Math.pow(freezeEngaged ? 0.62 : 0.88, deltaFrames);
    timeScale += (timeScaleTarget - timeScale) * timeScaleEase;
    if (freezeEngaged && timeScale < 0.001) timeScale = 0;
    if (!freezeEngaged && 1 - timeScale < 0.001) timeScale = 1;

    if (resetting) {
      const resetEase = 1 - Math.pow(0.8, deltaFrames);
      const deltaX = shortestAngle(rotationX, defaultRotationX);
      const deltaY = shortestAngle(rotationY, defaultRotationY);
      rotationX += deltaX * resetEase;
      rotationY += deltaY * resetEase;
      velocityX = 0;
      velocityY = 0;

      if (Math.abs(deltaX) + Math.abs(deltaY) < 0.001) {
        rotationX = defaultRotationX;
        rotationY = defaultRotationY;
        resetting = false;
      }
    } else if (interactionEnabled && !dragging) {
      rotationX += velocityX * deltaFrames * timeScale;
      rotationY += velocityY * deltaFrames * timeScale;
      const damping = Math.pow(0.9, deltaFrames * timeScale);
      velocityX *= damping;
      velocityY *= damping;

      if (Math.abs(velocityX) < 0.00002) velocityX = 0;
      if (Math.abs(velocityY) < 0.00002) velocityY = 0;
    }

    const magnetTarget = interactionEnabled && dragging ? magnetMode : 0;
    const magnetEase = 1 - Math.pow(magnetTarget === 0 ? 0.78 : 0.66, deltaFrames);
    magnetStrength += (magnetTarget - magnetStrength) * magnetEase;

    const lightTarget = pointerInside ? 1 : 0;
    const lightEase = 1 - Math.pow(lightTarget > lightStrength ? 0.45 : 0.82, deltaFrames);
    lightStrength += (lightTarget - lightStrength) * lightEase;
    burstScale *= Math.pow(0.84, deltaFrames);

    const zoomEase = 1 - Math.pow(0.76, deltaFrames);
    zoom += (targetZoom - zoom) * zoomEase;
    if (Math.abs(targetZoom - zoom) < 0.0001) zoom = targetZoom;

    simulationFrame += deltaFrames * timeScale;
    simulationTimeMs += frameDuration * deltaFrames * timeScale;
    const t = Math.floor(simulationFrame) * 0.02;

    if (now - lastRenderedAt >= frameDuration - 1) {
      render(t, simulationTimeMs);
      lastRenderedAt = now;
    }

    animationFrame = requestAnimationFrame(animate);
  }

  function finishDrag(event, cancelled = false) {
    if (!dragging || event.pointerId !== activePointerId) return;
    if (Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
      updatePointerPosition(event.clientX, event.clientY);
    }

    const heldLongEnough = performance.now() - pressStartedAt >= longPressDelay;
    const usedHoldAction = magnetMode !== 0 || freezeEngaged || (pressCandidate && heldLongEnough);
    const shouldPulse = !cancelled && pressCandidate && !dragMoved && !usedHoldAction;
    dragging = false;
    pressCandidate = false;
    dragMoved = false;
    pressStartedAt = 0;
    canvas.classList.remove("is-dragging");
    setMagnetMode(0);
    setFreezeEngaged(false);

    if (shouldPulse) {
      emitEnergyWave(pointerX, pointerY);
    } else if (!cancelled) {
      burstScale = Math.max(burstScale, Math.min(0.035, Math.hypot(velocityX, velocityY) * 0.35));
    }

    if (event.pointerType && event.pointerType !== "mouse") pointerInside = false;

    if (canvas.hasPointerCapture(activePointerId)) {
      canvas.releasePointerCapture(activePointerId);
    }
    activePointerId = null;
  }

  function setInteraction(enabled) {
    interactionEnabled = enabled;
    toggle.setAttribute("aria-pressed", String(enabled));
    toggle.setAttribute("aria-label", enabled ? "关闭星环交互" : "开启星环交互");
    canvas.classList.toggle("is-interactive", enabled);

    if (!enabled) {
      if (dragging && activePointerId !== null) {
        finishDrag({ pointerId: activePointerId }, true);
      }
      dragging = false;
      activePointerId = null;
      pressCandidate = false;
      dragMoved = false;
      velocityX = 0;
      velocityY = 0;
      setMagnetMode(0);
      setFreezeEngaged(false);
      canvas.classList.remove("is-dragging");
    }

    updateInteractionReadout();
  }

  toggle.addEventListener("click", () => {
    setInteraction(!interactionEnabled);
  });

  holdModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setHoldMode(button.dataset.holdMode);
    });
  });

  shapeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setShape(button.dataset.shape);
    });
  });

  panelToggle.addEventListener("click", () => {
    setPanelCollapsed(!controlPanel.classList.contains("is-collapsed"));
  });

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const presetId = button.dataset.theme;
      applyTheme(themePresets[presetId], { presetId });
    });
  });

  [backgroundInput, starInput, glowInput].forEach((input) => {
    input.addEventListener("input", applyThemeFromInputs);
  });

  resetViewButton.addEventListener("click", resetView);
  resetThemeButton.addEventListener("click", () => {
    applyTheme(themePresets.mono, { presetId: "mono" });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !controlPanel.classList.contains("is-collapsed")) {
      setPanelCollapsed(true);
      panelToggle.focus();
    }
  });

  canvas.addEventListener("pointerdown", (event) => {
    if (!interactionEnabled || event.button !== 0 || dragging) return;
    event.preventDefault();
    activePointerId = event.pointerId;
    dragging = true;
    dragMoved = false;
    pressCandidate = true;
    pressStartedAt = performance.now();
    pressStartClientX = event.clientX;
    pressStartClientY = event.clientY;
    magnetPolarity = event.shiftKey ? -1 : 1;
    setMagnetMode(0);
    resetting = false;
    velocityX = 0;
    velocityY = 0;
    lastClientX = event.clientX;
    lastClientY = event.clientY;
    lastPointerAt = event.timeStamp;
    updatePointerPosition(event.clientX, event.clientY);
    pointerInside = true;
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("is-dragging");
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) {
      updatePointerPosition(event.clientX, event.clientY);
      return;
    }

    if (event.pointerId !== activePointerId) return;

    if (!interactionEnabled) return;

    event.preventDefault();
    const coalescedEvents = event.getCoalescedEvents ? event.getCoalescedEvents() : [];
    const samples = coalescedEvents.length ? coalescedEvents : [event];

    for (const sample of samples) {
      const bounds = updatePointerPosition(sample.clientX, sample.clientY);
      if (pressCandidate && magnetMode === 0) {
        magnetPolarity = sample.shiftKey ? -1 : 1;
      }

      if (magnetMode !== 0 || freezeEngaged) {
        lastClientX = sample.clientX;
        lastClientY = sample.clientY;
        lastPointerAt = sample.timeStamp;
        continue;
      }

      if (!dragMoved) {
        const distanceFromPress = Math.hypot(
          sample.clientX - pressStartClientX,
          sample.clientY - pressStartClientY
        );

        if (distanceFromPress > dragThreshold) {
          dragMoved = true;
          pressCandidate = false;
        }
      }

      if (!dragMoved) {
        lastClientX = sample.clientX;
        lastClientY = sample.clientY;
        lastPointerAt = sample.timeStamp;
        continue;
      }

      const deltaX = (sample.clientX - lastClientX) * Math.PI / bounds.width * 0.78;
      const deltaY = (sample.clientY - lastClientY) * Math.PI / bounds.height * 0.78;
      const elapsed = Math.max(4, sample.timeStamp - lastPointerAt);
      const velocityScale = frameDuration / elapsed;

      rotationX += deltaY;
      rotationY += deltaX;
      velocityX = velocityX * 0.68 + deltaY * velocityScale * 0.32;
      velocityY = velocityY * 0.68 + deltaX * velocityScale * 0.32;
      lastClientX = sample.clientX;
      lastClientY = sample.clientY;
      lastPointerAt = sample.timeStamp;
    }
  });

  canvas.addEventListener("pointerup", (event) => finishDrag(event));
  canvas.addEventListener("pointercancel", (event) => finishDrag(event, true));
  canvas.addEventListener("lostpointercapture", (event) => finishDrag(event, true));
  canvas.addEventListener("pointerenter", (event) => {
    pointerInside = true;
    updatePointerPosition(event.clientX, event.clientY);
    lightStrength = Math.max(lightStrength, 0.55);
  });
  canvas.addEventListener("pointerleave", () => {
    pointerInside = false;
  });

  canvas.addEventListener("wheel", (event) => {
    if (!interactionEnabled) return;
    event.preventDefault();
    updatePointerPosition(event.clientX, event.clientY);
    pointerInside = true;
    zoomOriginX = pointerX;
    zoomOriginY = pointerY;

    const delta = event.deltaMode === 1
      ? event.deltaY * 16
      : (event.deltaMode === 2 ? event.deltaY * canvas.height : event.deltaY);
    targetZoom = Math.min(1.5, Math.max(0.62, targetZoom * Math.exp(-delta * 0.0014)));
    lightStrength = Math.max(lightStrength, 0.5);
  }, { passive: false });

  canvas.addEventListener("dblclick", (event) => {
    if (!interactionEnabled) return;
    event.preventDefault();
    resetView();
  });

  canvas.addEventListener("contextmenu", (event) => {
    if (interactionEnabled) event.preventDefault();
  });

  window.addEventListener("blur", () => {
    pointerInside = false;
    if (dragging && activePointerId !== null) {
      finishDrag({ pointerId: activePointerId }, true);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      hasPreviousFrame = false;
      return;
    }

    previousAt = undefined;
    lastRenderedAt = -Infinity;
    if (!animationFrame) animationFrame = requestAnimationFrame(animate);
  });

  initializeThemeAndPanel();
  initializeMotionControls();
  setInteraction(false);

  if (!animationFrame) {
    animationFrame = requestAnimationFrame(animate);
  }
})();
