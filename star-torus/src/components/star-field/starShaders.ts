export const starVertexShader = /* glsl */ `
  attribute float aPointSize;

  uniform vec2 uViewport;
  uniform vec2 uPointer;
  uniform float uPixelRatio;
  uniform float uPointScale;
  uniform float uHoverRadius;
  uniform float uLightStrength;
  uniform float uMagnetStrength;
  uniform float uWaveBand;
  uniform vec4 uWaves[4];

  varying float vGlow;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vec4 clipPosition = projectionMatrix * viewPosition;
    vec2 ndc = clipPosition.xy / clipPosition.w;
    vec2 screenPosition = vec2(
      (ndc.x * 0.5 + 0.5) * uViewport.x,
      (1.0 - (ndc.y * 0.5 + 0.5)) * uViewport.y
    );

    float pointerDistance = distance(screenPosition, uPointer);
    float hoverInfluence = pow(max(0.0, 1.0 - pointerDistance / uHoverRadius), 2.0);
    float illumination = hoverInfluence * uLightStrength;

    if (abs(uMagnetStrength) > 0.001) {
      screenPosition += (uPointer - screenPosition)
        * hoverInfluence
        * uMagnetStrength
        * 0.24;
    }

    float waveGlow = 0.0;
    vec2 waveOffset = vec2(0.0);

    for (int index = 0; index < 4; index += 1) {
      vec4 wave = uWaves[index];
      if (wave.w <= 0.001) continue;
      vec2 fromWave = screenPosition - wave.xy;
      float waveDistance = length(fromWave);
      float distanceFromFront = abs(waveDistance - wave.z);
      if (distanceFromFront >= uWaveBand) continue;
      float ridge = 1.0 - distanceFromFront / uWaveBand;
      float influence = ridge * ridge * wave.w;
      waveGlow = max(waveGlow, influence);
      if (waveDistance > 0.001) {
        waveOffset += normalize(fromWave) * influence * 12.0;
      }
    }

    screenPosition += waveOffset;
    ndc = vec2(
      screenPosition.x / uViewport.x * 2.0 - 1.0,
      (1.0 - screenPosition.y / uViewport.y) * 2.0 - 1.0
    );
    clipPosition.xy = ndc * clipPosition.w;
    gl_Position = clipPosition;

    vGlow = max(illumination, waveGlow);
    float perspectiveScale = 520.0 / max(260.0, -viewPosition.z);
    float baseSize = max(0.32, aPointSize * 2.15 * uPointScale * perspectiveScale);
    gl_PointSize = baseSize * (1.0 + vGlow * 0.82) * uPixelRatio;
  }
`;

export const starFragmentShader = /* glsl */ `
  uniform vec3 uStarColor;
  uniform vec3 uGlowColor;

  varying float vGlow;

  void main() {
    float radius = distance(gl_PointCoord, vec2(0.5));
    float glowAmount = clamp(vGlow, 0.0, 1.0);
    float coreRadius = mix(0.47, 0.31, glowAmount);
    float core = 1.0 - smoothstep(coreRadius - 0.075, coreRadius, radius);
    float sprite = 1.0 - smoothstep(0.43, 0.5, radius);
    float halo = max(0.0, sprite - core) * glowAmount * 0.46;
    float alpha = max(core, halo);

    if (alpha < 0.01) discard;

    vec3 color = mix(uStarColor, uGlowColor, glowAmount);
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
