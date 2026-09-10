import * as THREE from "three";

      // --- Audio Synth for Haptic Feedback on Click ---
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playLiquidDropSound = () => {
        if (audioCtx.state === "suspended") audioCtx.resume();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.22);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.22);
      };

      // --- Configuration ---
      const CONFIG = {
        preset: "cyber",
        radius: 0.17,
        distortion: 0.22,
        noiseScale: 4.8,
        speed: 0.15,
        edgeSoftness: 0.04,
        refraction: 0.20,
        chromaticAberration: 0.05,
        specularIntensity: 1.6,
        specularShininess: 38.0,
        iridescence: 0.85,
        fresnelRim: 1.1,
        parallax: 0.06,
        mouseSmoothness: 0.08,
        trailLength: 1.15,
        trailPersistence: 0.65,
        trailTaper: 0.88,
        autoPilot: false,
        soundEnabled: true,
      };

      const PRESETS = {
        cyber: {
          radius: 0.17,
          distortion: 0.22,
          noiseScale: 4.8,
          refraction: 0.22,
          chromaticAberration: 0.06,
          specularIntensity: 2.0,
          iridescence: 0.95,
          fresnelRim: 1.3,
          name: "Cybernetic Bust Dissection",
          outerImg: "./sculpture_outer.jpg",
          innerImg: "./cyber_inner.jpg"
        },
        vogue: {
          radius: 0.20,
          distortion: 0.26,
          noiseScale: 5.4,
          refraction: 0.25,
          chromaticAberration: 0.12,
          specularIntensity: 1.8,
          iridescence: 1.2,
          fresnelRim: 1.1,
          name: "Prism Vogue Iridescence",
          outerImg: "./vogue_outer.jpg",
          innerImg: "./vogue_inner.jpg"
        },
        car: {
          radius: 0.18,
          distortion: 0.20,
          noiseScale: 4.5,
          refraction: 0.24,
          chromaticAberration: 0.08,
          specularIntensity: 2.4,
          iridescence: 0.8,
          fresnelRim: 1.5,
          name: "Hypercar Chassis X-Ray",
          outerImg: "./supercar_outer.jpg",
          innerImg: "./supercar_inner.jpg"
        },
        butterfly: {
          radius: 0.19,
          distortion: 0.24,
          noiseScale: 5.8,
          refraction: 0.28,
          chromaticAberration: 0.14,
          specularIntensity: 2.2,
          iridescence: 1.4,
          fresnelRim: 1.3,
          name: "Bioluminescent Crystal Butterfly",
          outerImg: "./butterfly_outer.jpg",
          innerImg: "./butterfly_inner.jpg"
        }
      };

      const TRAIL_COUNT = 14;
      const trailPoints = Array.from(
        { length: TRAIL_COUNT },
        () => new THREE.Vector2(0.5, 0.5)
      );

      // Cinematic Slow-Motion Liquid Mercury Wave Controller (1.2s expansion, 1.3s recoil)
      const mercuryWaveDriver = {
        active: false,
        startTime: 0,
        expandDuration: 1.25, // 扩散阶段耗时整整 1.25 秒，让水波有充分时间层层推开至全屏 80%
        holdDuration: 0.15,   // 峰值悬停微展 0.15 秒
        recoilDuration: 1.35, // 回吸阶段耗时 1.35 秒，如液态水银胶体般丝滑弹性复原
        currentPulse: 0.0,
        trigger(time) {
          this.active = true;
          this.startTime = time;
        },
        update(time) {
          if (!this.active) {
            this.currentPulse = 0.0;
            return 0.0;
          }
          const elapsed = (time - this.startTime) / 1000;
          const totalDuration = this.expandDuration + this.holdDuration + this.recoilDuration;
          
          if (elapsed >= totalDuration) {
            this.active = false;
            this.currentPulse = 0.0;
            return 0.0;
          }

          if (elapsed < this.expandDuration) {
            // 阶段 1：慢速扩散推涌（0 ~ 1.25秒）
            // 采用流畅柔和缓出曲线，消除突发暴冲，水波缓缓从容推向 80% 全屏
            const t = elapsed / this.expandDuration;
            const ease = t * (2.0 - t);
            this.currentPulse = ease;
          } else if (elapsed < this.expandDuration + this.holdDuration) {
            // 阶段 2：峰值微滞留（1.25 ~ 1.4秒）
            this.currentPulse = 1.0;
          } else {
            // 阶段 3：富有张力的慢动作水银回吸（1.4 ~ 2.75秒）
            const t = (elapsed - this.expandDuration - this.holdDuration) / this.recoilDuration;
            const bounce = (1.0 - t) * (1.0 + Math.sin(t * Math.PI * 2.5) * 0.06 * (1.0 - t));
            this.currentPulse = Math.max(bounce, 0.0);
          }
          return this.currentPulse;
        }
      };

      // --- Scene & Renderer ---
      const canvas = document.getElementById("webgl");
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 1;

      // --- Uniforms (Dual-Buffer for Cross-fade Fluid Transitions) ---
      const uniforms = {
        u_imageOuterA: { value: null },
        u_imageInnerA: { value: null },
        u_imageOuterResA: { value: new THREE.Vector2(0, 0) },
        u_imageInnerResA: { value: new THREE.Vector2(0, 0) },

        u_imageOuterB: { value: null },
        u_imageInnerB: { value: null },
        u_imageOuterResB: { value: new THREE.Vector2(0, 0) },
        u_imageInnerResB: { value: new THREE.Vector2(0, 0) },

        u_transition: { value: 0.0 },

        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
        u_time: { value: 0.0 },
        u_visibility: { value: 1.0 },
        u_trail: { value: trailPoints },
        u_trailLength: { value: CONFIG.trailLength },
        u_trailTaper: { value: CONFIG.trailTaper },
        u_radius: { value: CONFIG.radius },
        u_distortion: { value: CONFIG.distortion },
        u_noiseScale: { value: CONFIG.noiseScale },
        u_speed: { value: CONFIG.speed },
        u_edgeSoftness: { value: CONFIG.edgeSoftness },
        u_refraction: { value: CONFIG.refraction },
        u_chromaticAberration: { value: CONFIG.chromaticAberration },
        u_specularIntensity: { value: CONFIG.specularIntensity },
        u_specularShininess: { value: CONFIG.specularShininess },
        u_iridescence: { value: CONFIG.iridescence },
        u_fresnelRim: { value: CONFIG.fresnelRim },
        u_parallax: { value: CONFIG.parallax },
        u_pulse: { value: 0.0 },
      };

      const vertexShader = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `;

      const fragmentShader = `
        uniform sampler2D u_imageOuterA;
        uniform sampler2D u_imageInnerA;
        uniform vec2 u_imageOuterResA;
        uniform vec2 u_imageInnerResA;

        uniform sampler2D u_imageOuterB;
        uniform sampler2D u_imageInnerB;
        uniform vec2 u_imageOuterResB;
        uniform vec2 u_imageInnerResB;

        uniform float u_transition;
        uniform vec2 u_resolution;
        
        uniform vec2 u_mouse;
        uniform float u_time;
        uniform float u_visibility;
        uniform vec2 u_trail[14];
        uniform float u_trailLength;
        uniform float u_trailTaper;
        
        uniform float u_radius;
        uniform float u_distortion;
        uniform float u_noiseScale;
        uniform float u_speed;
        uniform float u_edgeSoftness;
        uniform float u_refraction;
        uniform float u_chromaticAberration;
        uniform float u_specularIntensity;
        uniform float u_specularShininess;
        uniform float u_iridescence;
        uniform float u_fresnelRim;
        uniform float u_parallax;

        uniform float u_pulse;

        varying vec2 vUv;

        // Hash & Simplex-style Noise
        float hash(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          mat2 rot = mat2(0.87, -0.48, 0.48, 0.87);
          for (int i = 0; i < 4; i++) {
            v += a * noise(p);
            p = rot * p * 2.02;
            a *= 0.5;
          }
          return v;
        }

        // Tapered capsule distance & continuous gradient normal
        vec3 taperedCapsule(vec2 p, vec2 a, vec2 b, float ra, float rb) {
          vec2 segment = b - a;
          float segmentLength = length(segment);
          float radiusDelta = rb - ra;
          if (segmentLength <= abs(radiusDelta) + 0.00001) {
            vec2 offset = p - (ra >= rb ? a : b);
            float distanceToCenter = length(offset);
            return vec3(distanceToCenter - max(ra, rb), offset / max(distanceToCenter, 0.00001));
          }
          vec2 axis = segment / segmentLength;
          vec2 relative = p - a;
          float along = dot(relative, axis);
          vec2 perpendicular = relative - axis * along;
          float slope = radiusDelta / segmentLength;
          float tangent = sqrt(max(1.0 - slope * slope, 0.000001));
          float h = clamp((along + slope * length(perpendicular) / tangent) / segmentLength, 0.0, 1.0);
          vec2 offset = relative - segment * h;
          float distanceToCenter = length(offset);
          return vec3(distanceToCenter - mix(ra, rb, h), offset / max(distanceToCenter, 0.00001));
        }

        vec3 mergeFields(vec3 a, vec3 b, float width) {
          if (width < 0.000001) return a.x < b.x ? a : b;
          float h = clamp(0.5 + 0.5 * (b.x - a.x) / width, 0.0, 1.0);
          return vec3(mix(b.x, a.x, h) - width * h * (1.0 - h), mix(b.yz, a.yz, h));
        }

        vec2 getCoverUv(vec2 uv, vec2 res, vec2 texRes) {
          vec2 ratio = res / texRes;
          float coverRatio = max(ratio.x, ratio.y);
          vec2 scaledRes = texRes * coverRatio;
          vec2 offset = (scaledRes - res) * 0.5 / scaledRes;
          return uv * (res / scaledRes) + offset;
        }

        // High quality procedural graphics fallback for zero-downtime aesthetics
        vec3 getCyberProceduralInner(vec2 uv, float t) {
          vec2 grid = fract(uv * 24.0) - 0.5;
          float line = smoothstep(0.48, 0.5, max(abs(grid.x), abs(grid.y)));
          float pulses = sin(uv.y * 30.0 + t * 4.0) * 0.5 + 0.5;
          vec3 bg = mix(vec3(0.02, 0.05, 0.12), vec3(0.08, 0.02, 0.18), uv.x);
          vec3 neonCyan = vec3(0.0, 0.95, 1.0) * line * 1.5;
          vec3 neonMagenta = vec3(1.0, 0.1, 0.6) * pulses * line;
          return bg + neonCyan + neonMagenta;
        }

        vec3 getCyberProceduralOuter(vec2 uv) {
          float n = fbm(uv * 6.0);
          vec3 marble = mix(vec3(0.04, 0.04, 0.06), vec3(0.18, 0.18, 0.22), n);
          return marble;
        }

        // Palette for thin-film iridescence (Pearlescent Rainbow)
        vec3 rainbowPalette(float t) {
          return 0.5 + 0.5 * cos(6.28318 * (vec3(0.0, 0.33, 0.67) + t));
        }

        void main() {
          vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
          vec2 p = (vUv - u_mouse) * aspect;

          // 1. Noise disturbance
          float n = fbm(p * u_noiseScale + u_time * u_speed);

          // 2. Holographic Rainbow Ring Pulse Dynamics (Slow-Motion Liquid Mercury Propagation)
          float pulseAmp = clamp(u_pulse, 0.0, 1.25);
          
          // 原全息折射环慢速优雅扩张至整屏约 80% 视野（半径达到约 0.82），然后丝滑回弹
          float targetMaxRadius = 0.82;
          float pulseExpand = smoothstep(0.0, 1.0, clamp(pulseAmp, 0.0, 1.0)) + max(pulseAmp - 1.0, 0.0) * 0.35;
          float currentRadius = mix(u_radius, targetMaxRadius, pulseExpand);

          // 水银液体水波扩散：在扩张前锋附近激发出相干多层水银涟漪（Liquid Mercury Traveling Waves）
          float dist = length(p);
          float waveDist = dist - currentRadius;
          float waveFreq = 24.0;
          float waveSpeed = 2.2;
          float wavePhase = dist * waveFreq - u_time * waveSpeed;
          // 水波高斯包络：紧密跟随正在扩散的水银折射环边缘
          float rippleBand = exp(-waveDist * waveDist * 36.0) * pulseAmp;
          float waveSlope = cos(wavePhase) * rippleBand * 0.7;
          
          // 水银表面张力周向流动波动（慢速有机流体流动）
          float ringAngle = atan(p.y, p.x);
          float rimWobble = (sin(ringAngle * 6.0 - u_time * 2.2) * 0.03 + cos(ringAngle * 10.0 + u_time * 3.0) * 0.015) * pulseAmp;

          // 3. Fluid Distance Field calculation
          vec3 liquidField = vec3(dist - currentRadius, p / max(dist, 0.00001));
          float trailBaseRadius = mix(u_radius, 0.30, pulseExpand);
          for (int i = 0; i < 13; i++) {
            vec2 a = (u_trail[i] - u_mouse) * aspect * u_trailLength;
            vec2 b = (u_trail[i + 1] - u_mouse) * aspect * u_trailLength;
            float ra = trailBaseRadius * (1.0 - u_trailTaper * float(i) / 13.0);
            float rb = trailBaseRadius * (1.0 - u_trailTaper * float(i + 1) / 13.0);
            vec3 segmentField = taperedCapsule(p, a, b, ra, rb);
            float blendWidth = currentRadius * 0.12 * smoothstep(0.0, currentRadius * 0.15, length(b - a));
            liquidField = mergeFields(liquidField, segmentField, blendWidth);
          }

          float fieldDistort = (n - 0.5 + rimWobble) * (u_distortion * (1.0 - pulseExpand * 0.55) + pulseAmp * 0.06) * 2.0;
          float field = liquidField.x - currentRadius * fieldDistort;
          float mask = 1.0 - smoothstep(-u_edgeSoftness, u_edgeSoftness, field);

          // 4. Fluid 3D Normal & Liquid Mercury Multi-Wave Reconstruction
          float edgeProfile = smoothstep(0.0, 0.5, mask) * (1.0 - smoothstep(0.5, 1.0, mask));
          
          // 水银水波法线与凸透镜折射曲率融合
          vec2 normDir = p / max(dist, 0.00001);
          vec2 grad = liquidField.yz * edgeProfile + normDir * waveSlope * 0.055;
          float domeZ = sqrt(max(0.001, 1.0 - dot(grad, grad) * 3.0));
          vec3 surfNormal = normalize(vec3(-grad * 2.8, domeZ));

          // 5. Specular Lighting (Faded on Pulse to Eliminate Harsh Glare Ring)
          vec3 lightDir = normalize(vec3(0.4, 0.8, 0.9));
          vec3 viewDir = vec3(0.0, 0.0, 1.0);
          vec3 halfDir = normalize(lightDir + viewDir);
          float specAngle = max(dot(surfNormal, halfDir), 0.0);
          
          // 点击扩散时彻底消隐刺眼光圈（glowFade 降至接近 0，确保大范围扩散时完全清透不晃眼）
          float glowFade = 1.0 - smoothstep(0.0, 0.35, pulseExpand) * 0.95;
          float baseSpec = pow(specAngle, u_specularShininess) * u_specularIntensity * edgeProfile;
          float specular = baseSpec * glowFade;

          // 6. Fresnel & Holographic Iridescent Color (Gentle Tint without Harsh Ring)
          float fresnel = pow(1.0 - max(dot(surfNormal, viewDir), 0.0), 3.5) * u_fresnelRim * glowFade;
          float iridPhase = dot(surfNormal.xy, vec2(0.7, 0.7)) * 1.5 + u_time * 0.1;
          vec3 iridColor = rainbowPalette(iridPhase) * u_iridescence;

          // 7. Spectral Chromatic Aberration Sampling (Pure Refractive Liquid Water Waves)
          float currentRefract = u_refraction * (1.0 + pulseAmp * 0.5);
          float currentAberration = u_chromaticAberration;
          vec2 baseOffset = (liquidField.yz * edgeProfile + normDir * waveSlope * 0.05) * currentRefract * u_visibility;
          vec2 offsetR = baseOffset * (1.0 + currentAberration * 2.0);
          vec2 offsetG = baseOffset;
          vec2 offsetB = baseOffset * (1.0 - currentAberration * 2.0);

          // --- True Vertical Scroll Parallax Motion Engine ---
          // Physical vertical translation: As scroll progresses, Room A slides up and out, Room B pushes up from bottom.
          float t = clamp(u_transition, 0.0, 1.0);
          
          // Multi-layer differential parallax: Inner layer moves with higher speed to produce realistic 3D depth
          vec2 shiftOuterA = vec2(0.0, -t * 0.70);
          vec2 shiftOuterB = vec2(0.0, (1.0 - t) * 0.70);

          vec2 shiftInnerA = vec2(0.0, -t * 1.10);
          vec2 shiftInnerB = vec2(0.0, (1.0 - t) * 1.10);

          // 1. Sample Room A Outer (Moving Upwards)
          vec3 colOuterA = vec3(0.0);
          if (u_imageOuterResA.x > 0.0) {
            vec2 uvR = getCoverUv(vUv + offsetR + shiftOuterA, u_resolution, u_imageOuterResA);
            vec2 uvG = getCoverUv(vUv + offsetG + shiftOuterA, u_resolution, u_imageOuterResA);
            vec2 uvB = getCoverUv(vUv + offsetB + shiftOuterA, u_resolution, u_imageOuterResA);
            colOuterA.r = texture2D(u_imageOuterA, uvR).r;
            colOuterA.g = texture2D(u_imageOuterA, uvG).g;
            colOuterA.b = texture2D(u_imageOuterA, uvB).b;
          } else {
            colOuterA = getCyberProceduralOuter(vUv + offsetG + shiftOuterA);
          }

          // 2. Sample Room B Outer (Pushing Up from Viewport Bottom)
          vec3 colOuterB = vec3(0.0);
          if (u_imageOuterResB.x > 0.0) {
            vec2 uvR = getCoverUv(vUv + offsetR + shiftOuterB, u_resolution, u_imageOuterResB);
            vec2 uvG = getCoverUv(vUv + offsetG + shiftOuterB, u_resolution, u_imageOuterResB);
            vec2 uvB = getCoverUv(vUv + offsetB + shiftOuterB, u_resolution, u_imageOuterResB);
            colOuterB.r = texture2D(u_imageOuterB, uvR).r;
            colOuterB.g = texture2D(u_imageOuterB, uvG).g;
            colOuterB.b = texture2D(u_imageOuterB, uvB).b;
          } else {
            colOuterB = colOuterA;
          }

          // 3. Sample Room A Inner (With Deep Vertical Parallax)
          vec2 parallaxOffset = (u_mouse - 0.5) * u_parallax;
          vec3 colInnerA = vec3(0.0);
          if (u_imageInnerResA.x > 0.0) {
            vec2 inUvR = getCoverUv(vUv - offsetR + shiftInnerA, u_resolution, u_imageInnerResA) + parallaxOffset;
            vec2 inUvG = getCoverUv(vUv - offsetG + shiftInnerA, u_resolution, u_imageInnerResA) + parallaxOffset;
            vec2 inUvB = getCoverUv(vUv - offsetB + shiftInnerA, u_resolution, u_imageInnerResA) + parallaxOffset;
            colInnerA.r = texture2D(u_imageInnerA, inUvR).r;
            colInnerA.g = texture2D(u_imageInnerA, inUvG).g;
            colInnerA.b = texture2D(u_imageInnerA, inUvB).b;
          } else {
            colInnerA = getCyberProceduralInner(vUv - offsetG + parallaxOffset + shiftInnerA, u_time);
          }

          // 4. Sample Room B Inner (With Deep Vertical Parallax)
          vec3 colInnerB = vec3(0.0);
          if (u_imageInnerResB.x > 0.0) {
            vec2 inUvR = getCoverUv(vUv - offsetR + shiftInnerB, u_resolution, u_imageInnerResB) + parallaxOffset;
            vec2 inUvG = getCoverUv(vUv - offsetG + shiftInnerB, u_resolution, u_imageInnerResB) + parallaxOffset;
            vec2 inUvB = getCoverUv(vUv - offsetB + shiftInnerB, u_resolution, u_imageInnerResB) + parallaxOffset;
            colInnerB.r = texture2D(u_imageInnerB, inUvR).r;
            colInnerB.g = texture2D(u_imageInnerB, inUvG).g;
            colInnerB.b = texture2D(u_imageInnerB, inUvB).b;
          } else {
            colInnerB = colInnerA;
          }

          // 5. Clean Solid Parallax Stacking Push (Zero overlap ghosting, pure black art exhibition)
          // As t goes from 0 to 1, cutY pushes from below viewport bottom (-0.02) to above top (1.02)
          float cutY = mix(-0.02, 1.02, t);
          float feather = 0.008; // Ultra-fine anti-aliasing edge, strictly preventing double-exposure ghosting
          
          // Strictly 0.0 at t=0 everywhere on screen, strictly 1.0 at t=1 everywhere on screen
          float verticalMix = 1.0 - smoothstep(cutY - feather, cutY + feather, vUv.y);

          // Subtle natural card drop shadow cast on previous scene above the cut line
          float shadowAbove = (1.0 - smoothstep(cutY, cutY + 0.08, vUv.y) * 0.35) * (1.0 - verticalMix) + verticalMix;

          vec3 colOuter = mix(colOuterA * shadowAbove, colOuterB, verticalMix);
          vec3 colInner = mix(colInnerA * shadowAbove, colInnerB, verticalMix);

          // 8. Final Composite
          vec3 blended = mix(colOuter, colInner, mask * u_visibility);
          
          // 柔和水感边界：仅在静止时显示小环微光，点击扩散时完全隐去光圈，保持清澈通透
          vec3 liquidRim = (iridColor * 0.8 + vec3(0.5)) * specular + iridColor * fresnel * mask * u_visibility;
          vec3 finalColor = blended + liquidRim;

          // Cinematic subtle vignette
          float vig = 1.0 - smoothstep(0.65, 1.4, length((vUv - 0.5) * aspect));
          finalColor *= mix(0.75, 1.0, vig);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `;

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        depthTest: false,
        depthWrite: false,
      });

      const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      scene.add(quad);

      // --- Preload All 4 Exhibition Rooms Textures ---
      const PRESET_KEYS = ["cyber", "vogue", "car", "butterfly"];
      const loadedTextures = {};

      const lerp = (a, b, t) => a + (b - a) * t;

      const createTexture = (img) => {
        const tex = new THREE.Texture(img);
        tex.needsUpdate = true;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        return tex;
      };

      let currentRoomIdx = 0;
      let nextRoomIdx = 0;
      let currentTransition = 0.0;

      const updateSceneState = (idxA, idxB, t) => {
        currentRoomIdx = idxA;
        nextRoomIdx = idxB;
        currentTransition = t;

        const keyA = PRESET_KEYS[idxA];
        const keyB = PRESET_KEYS[idxB];
        const pA = PRESETS[keyA];
        const pB = PRESETS[keyB];

        const tA = loadedTextures[keyA];
        const tB = loadedTextures[keyB];

        if (tA) {
          if (tA.outer) {
            uniforms.u_imageOuterA.value = tA.outer;
            uniforms.u_imageOuterResA.value.copy(tA.outerRes);
          }
          if (tA.inner) {
            uniforms.u_imageInnerA.value = tA.inner;
            uniforms.u_imageInnerResA.value.copy(tA.innerRes);
          }
        }

        if (tB) {
          if (tB.outer) {
            uniforms.u_imageOuterB.value = tB.outer;
            uniforms.u_imageOuterResB.value.copy(tB.outerRes);
          }
          if (tB.inner) {
            uniforms.u_imageInnerB.value = tB.inner;
            uniforms.u_imageInnerResB.value.copy(tB.innerRes);
          }
        }

        uniforms.u_transition.value = t;

        // 平滑插值各个展厅的光学参数
        uniforms.u_radius.value = lerp(pA.radius, pB.radius, t);
        uniforms.u_distortion.value = lerp(pA.distortion, pB.distortion, t);
        uniforms.u_noiseScale.value = lerp(pA.noiseScale, pB.noiseScale, t);
        uniforms.u_refraction.value = lerp(pA.refraction, pB.refraction, t);
        uniforms.u_chromaticAberration.value = lerp(pA.chromaticAberration, pB.chromaticAberration, t);
        uniforms.u_specularIntensity.value = lerp(pA.specularIntensity, pB.specularIntensity, t);
        uniforms.u_iridescence.value = lerp(pA.iridescence, pB.iridescence, t);
        uniforms.u_fresnelRim.value = lerp(pA.fresnelRim, pB.fresnelRim, t);

        // 同步顶栏状态与底部导航高亮
        const activeIdx = t < 0.5 ? idxA : idxB;
        const activeKey = PRESET_KEYS[activeIdx];
        const statusEl = document.getElementById("status-title");
        if (statusEl) {
          statusEl.textContent = `Room 0${activeIdx + 1}: ${PRESETS[activeKey].name}`;
        }

        document.querySelectorAll(".dock-btn[data-target-room]").forEach((btn) => {
          const roomIdx = parseInt(btn.dataset.targetRoom, 10);
          btn.classList.toggle("active", roomIdx === activeIdx);
        });
      };

      const preloadAllTextures = () => {
        PRESET_KEYS.forEach((key) => {
          const p = PRESETS[key];
          loadedTextures[key] = {
            outer: null,
            inner: null,
            outerRes: new THREE.Vector2(0, 0),
            innerRes: new THREE.Vector2(0, 0),
          };

          const imgOuter = new Image();
          imgOuter.onload = () => {
            loadedTextures[key].outer = createTexture(imgOuter);
            loadedTextures[key].outerRes.set(imgOuter.naturalWidth || 1920, imgOuter.naturalHeight || 1080);
            updateSceneState(currentRoomIdx, nextRoomIdx, currentTransition);
          };
          imgOuter.src = p.outerImg;

          const imgInner = new Image();
          imgInner.onload = () => {
            loadedTextures[key].inner = createTexture(imgInner);
            loadedTextures[key].innerRes.set(imgInner.naturalWidth || 1920, imgInner.naturalHeight || 1080);
            updateSceneState(currentRoomIdx, nextRoomIdx, currentTransition);
          };
          imgInner.src = p.innerImg;
        });
      };

      preloadAllTextures();

      // --- GSAP & ScrollTrigger Parallax Orchestration ---
      gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

      // Scroll cue fade out
      gsap.to("#scroll-cue", {
        opacity: 0,
        y: 25,
        scrollTrigger: {
          trigger: "#room-0",
          start: "top top",
          end: "30% top",
          scrub: true,
        }
      });

      // Opening Editorial Reveal for Room 0
      gsap.fromTo("#room-0 .editorial-container",
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.1 }
      );

      // 4 Exhibition Rooms Editorial Parallax Animations
      const rooms = document.querySelectorAll(".gallery-room");
      rooms.forEach((room, i) => {
        const container = room.querySelector(".editorial-container");

        if (i === 0) {
          gsap.timeline({
            scrollTrigger: {
              trigger: room,
              start: "top top",
              end: "bottom top",
              scrub: 0.4,
            }
          })
          .to(container, { y: -180, opacity: 0, scale: 1.05, ease: "power2.in" });
        } else {
          gsap.timeline({
            scrollTrigger: {
              trigger: room,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.4,
            }
          })
          .fromTo(container,
            { y: 180, opacity: 0, scale: 0.94 },
            { y: 0, opacity: 1, scale: 1.0, ease: "power2.out", duration: 0.4 }
          )
          .to(container,
            { y: -180, opacity: 0, scale: 1.05, ease: "power2.in", duration: 0.4 },
            "+=0.15"
          );
        }
      });

      // Scroll-Driven WebGL Scene Fluid Transitions (Vertical Physical Translation)
      ScrollTrigger.create({
        trigger: "#scroll-gallery",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.4,
        onUpdate: (self) => {
          const progress = self.progress; // 0.0 ~ 1.0
          const scaled = progress * 3.0;  // 4 rooms -> 3 transition segments
          const idxA = Math.min(Math.floor(scaled), 2);
          const idxB = Math.min(idxA + 1, 3);
          const t = Math.min(Math.max(scaled - idxA, 0.0), 1.0);
          updateSceneState(idxA, idxB, t);
        }
      });

      // Bottom Dock Direct Room Navigation
      document.querySelectorAll(".dock-btn[data-target-room]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const targetIdx = parseInt(btn.dataset.targetRoom, 10);
          gsap.to(window, {
            duration: 1.4,
            scrollTo: { y: `#room-${targetIdx}`, autoKill: false },
            ease: "power3.inOut"
          });
        });
      });

      // --- Interactive Mouse & Motion Engine ---
      const currentMouse = new THREE.Vector2(0.5, 0.5);
      const targetMouse = new THREE.Vector2(0.5, 0.5);
      let pointerInside = true;
      let lastActivity = performance.now();

      const onPointerMove = (e) => {
        targetMouse.x = e.clientX / window.innerWidth;
        targetMouse.y = 1.0 - e.clientY / window.innerHeight;
        pointerInside = true;
        lastActivity = performance.now();
      };

      window.addEventListener("pointermove", onPointerMove);

      // Click interaction: trigger cinematic slow-motion liquid mercury wave diffusion
      window.addEventListener("pointerdown", (e) => {
        if (e.target.closest("button")) return;
        mercuryWaveDriver.trigger(performance.now());
        if (CONFIG.soundEnabled) playLiquidDropSound();
      });

      // --- Auto-Tour Mode (Harmonic Lissajous & Continuous Exhibition Parallax Tour) ---
      let autoAngleX = 0;
      let autoAngleY = 0;
      const updateAutoPilot = (delta) => {
        autoAngleX += delta * 1.2;
        autoAngleY += delta * 0.85;
        targetMouse.x = 0.5 + Math.sin(autoAngleX) * 0.32 + Math.cos(autoAngleY * 0.6) * 0.08;
        targetMouse.y = 0.5 + Math.cos(autoAngleY) * 0.28 + Math.sin(autoAngleX * 0.5) * 0.06;
      };

      let isAutoTouring = false;
      let autoTourTween = null;

      const toggleAutoTour = () => {
        isAutoTouring = !isAutoTouring;
        CONFIG.autoPilot = isAutoTouring;
        const btn = document.getElementById("btn-autopilot");
        const modeBadge = document.getElementById("badge-mode");
        btn.classList.toggle("active", isAutoTouring);
        document.getElementById("auto-icon").textContent = isAutoTouring ? "⏸" : "▶";
        document.getElementById("auto-label").textContent = isAutoTouring ? "Touring..." : "Auto-Tour";
        modeBadge.textContent = isAutoTouring ? "EXHIBITION TOUR" : "PARALLAX GALLERY";
        modeBadge.style.color = isAutoTouring ? "#a855f7" : "#38bdf8";
        modeBadge.style.background = isAutoTouring ? "rgba(168, 85, 247, 0.2)" : "rgba(0, 240, 255, 0.15)";

        if (isAutoTouring) {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          autoTourTween = gsap.to(window, {
            scrollTo: { y: maxScroll, autoKill: false },
            duration: 24,
            ease: "none",
            repeat: -1,
            yoyo: true,
          });
        } else {
          if (autoTourTween) autoTourTween.kill();
        }
      };

      document.getElementById("btn-autopilot").addEventListener("click", toggleAutoTour);

      window.addEventListener("wheel", () => {
        if (isAutoTouring) toggleAutoTour();
      }, { passive: true });

      // --- Resize Handling ---
      window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
        ScrollTrigger.refresh();
      });

      // --- Main Render Loop with Fixed Physics Ticking ---
      let previousTime = performance.now();
      let accumulator = 0;
      const fixedStep = 1 / 60;
      let frameCount = 0;
      let lastFpsUpdate = performance.now();
      const fpsElement = document.getElementById("fps-counter");

      renderer.setAnimationLoop((now) => {
        const delta = Math.min(Math.max((now - previousTime) / 1000, 0), 0.05);
        previousTime = now;

        // FPS meter
        frameCount++;
        if (now - lastFpsUpdate >= 1000) {
          fpsElement.textContent = `${frameCount} FPS`;
          frameCount = 0;
          lastFpsUpdate = now;
        }

        // Auto pilot motion generator
        if (CONFIG.autoPilot) {
          updateAutoPilot(delta);
        }

        // Update cinematic slow-motion liquid mercury wave propagation (1.25s expansion, 1.35s recoil)
        const waveValue = mercuryWaveDriver.update(now);
        uniforms.u_pulse.value = waveValue;

        uniforms.u_time.value += delta;
        accumulator += delta;

        const mouseAlpha = 1 - Math.pow(1 - CONFIG.mouseSmoothness, fixedStep * 60);
        const trailAlpha = 1 - Math.exp((-fixedStep * (TRAIL_COUNT - 1)) / CONFIG.trailPersistence);

        while (accumulator >= fixedStep) {
          currentMouse.lerp(targetMouse, mouseAlpha);
          trailPoints[0].copy(currentMouse);
          for (let i = TRAIL_COUNT - 1; i > 0; i--) {
            trailPoints[i].lerp(trailPoints[i - 1], trailAlpha);
          }
          accumulator -= fixedStep;
        }

        uniforms.u_mouse.value.copy(currentMouse);
        renderer.render(scene, camera);
      });

      // Initialize with Room 0
      updateSceneState(0, 0, 0.0);
