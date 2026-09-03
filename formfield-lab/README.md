# 形场实验室 / FORMFIELD LAB

基于 **React 19**、**TypeScript**、**React Three Fiber (Three.js)** 的高阶生成式 3D 粒子视觉组件创作、实时预览与源码分发生态平台。

[在线体验](https://formfield-lab.vercel.app/) · [Registry 索引](https://formfield-lab.vercel.app/r/index.json) · [CLI 文档](#cli-安装器)

---

## 🌟 核心特性

- **参数化实时创作**：主题调色、流动速率、粒子点径、拓扑形变时长、光照半径、尾迹强度与视差深度毫秒级实时调节。
- **21 种高等数学曲面与拓扑形态**：涵盖环面、流体、高维投影、生物结构等，全量支持连续无缝流场平滑形变（Morphing）。
- **解耦的六大交互系统**：支持独立开关或组合悬浮光照、指针视差、拖拽全景旋转、滚轮视距缩放、短按能量脉冲、长按磁吸/时间冻结。
- **自定义文字粒子化**：内置矢量粒子栅格引擎，任意文字即刻转化为三维粒子流场。
- **6 套官方视觉预设**：内置经典黑白、深空蓝、星云紫、熔岩橙、极光绿、月尘白，支持全局色板自由定制。
- **双语极速切换**：中英双语界面一键即时切换，本地偏好持久化。
- **类 shadcn 源码级分发**：无臃肿黑盒 npm 依赖，核心运行时与几何采样算法按需直落项目源码，完全掌控组件代码。
- **轻量自动化 CLI**：智能递归解析组件依赖，自动检测 npm/pnpm/yarn/bun，无缝适配项目路径别名。

---

## 🪐 21 种形态几何采样矩阵

形场实验室内置了 21 组严谨的数学参数方程与空间分布采样器，所有形态均支持在 `Float32Array` 层面的实时平滑插值过渡：

| 形态 ID | 中文名称 | 几何学 / 物理特征描述 |
| :--- | :--- | :--- |
| `torus` | **星环** | 经典环状星环面，粒子沿主副双半径旋转分布 |
| `sphere` | **粒子球体** | 斐波那契螺旋均布球体表面，具备极佳的各向同性 |
| `mobius` | **莫比乌斯环** | 经典单侧单边界拓扑纸带，流场循环无穷 |
| `torus-knot` | **三叶环面结** | (2, 3) 环面缠绕拓扑结构，具备高密度的空间层次 |
| `klein` | **克莱因瓶** | 四维闭合曲面在三维空间的无自交投影形场 |
| `superellipsoid` | **超椭球** | 连续曲率指数调节，介于超椭圆与立体方球之间 |
| `helicoid` | **螺旋曲面** | 经典极小曲面（Minimal Surface），呈阶梯螺旋延展 |
| `double-helix` | **双螺旋** | 类似生命遗传密码的双链拓扑交织旋转结构 |
| `wave-surface` | **波浪马鞍面** | 双曲抛物面空间波动，粒子如涌动流体起伏 |
| `flow-ribbon` | **流光丝带** | 沿空间空间三维曲线延展的流线型悬浮带 |
| `heart` | **心形曲面** | 严谨的三维心形隐式方程空间粒子化分布 |
| `galaxy` | **星系漩涡** | 模拟对数螺线旋转臂，呈现星系核心吸积盘动态 |
| `network-globe` | **网络地球** | 经纬网格骨架结合离散节点，呈现互联球体形态 |
| `particle-logo` | **文字/标志** | 空间粒子文字光栅化，支持任意中英文文本流场化 |
| `light-tunnel` | **光之隧道** | 纵深超空间光柱管道，强烈的景深透视推背感 |
| `lissajous-orbit` | **利萨如星轨** | 空间多频谐波利萨如三维参数轨迹 |
| `celestial-gyro` | **浑天星仪** | 古代天球浑仪多重倾角同心环交织旋转结构 |
| `singularity` | **时空奇点** | 粒子受中心大质量坍缩吸积，呈现重力透镜曲率 |
| `metaball` | **流体软体** | 多势能中心相互融合的有机流体泡球群 |
| `particle-terrain` | **粒子地形** | 基于空间分形噪声的流动起伏高低地势 |
| `dna-ring` | **DNA 环链** | 闭环缠绕的双螺旋碱基对微观粒子分子结构 |

---

## 🖐 六大交互动作体系

通过解耦的 Action 矩阵，在导出或使用组件时可任意保留或剔除指定交互能力：

1. **局部打光 (`hoverLight`)**：光标附近粒子屏幕空间能量激发，呈现高亮聚光漫射。
2. **指针视差 (`pointerParallax`)**：视角跟随光标位置轻度平滑偏移，呈现灵动立体层深。
3. **拖拽旋转 (`dragRotate`)**：鼠标/触控板按住拖拽任意旋转形场，带物理惯性阻尼。
4. **滚轮缩放 (`wheelZoom`)**：双指滑动或滚轮无级缩放相机距离（带最小/最大界限保护）。
5. **短按脉冲 (`clickPulse`)**：点击任意区域激发出屏幕空间圆环冲击波，粒子沿波前瞬间共振。
6. **长按动作 (`holdAction`)**：
   - **磁吸模式 (`magnet`)**：长按时四周粒子向指针聚拢坍缩。
   - **冻结模式 (`freeze`)**：长按时时间瞬间停止流动，流速归零。

---

## 🚀 快速上手

### 1. 本地启动 Studio

```bash
# 克隆仓库并进入主目录
cd formfield-lab

# 安装依赖
npm install

# 启动本地开发服务
npm run dev
```

浏览器打开 `http://localhost:5173` 即可进入交互式可视化配置面板。

### 2. 工程化校验流水线

项目包含完备的数学稳定性与分发产物校验脚本：

```bash
# 1. 验证 21 种几何采样器的数学稳定性与边界有效性（防止出现 NaN 或无穷大）
npm run geometries:check

# 2. 构建分发产物至 public/r/
npm run registry:build

# 3. 执行端到端 Registry 完整性与 CLI 模拟安装冒烟测试
npm run registry:smoke

# 4. 查看当前所有 43 项已注册项清单
npm run registry:list

# 5. 执行完整生产构建（含 TS 类型校验与 Vite 打包）
npm run build
```

---

## 📦 Registry 与 CLI 生态

形场实验室采用类似 **shadcn/ui** 的去中心化分发理念：**分发源码，而非黑盒依赖**。

构建后的 Registry 规范目录位于 `public/r/`（包含 43 个 JSON 实体）：
- `public/r/index.json`：全局注册表清单
- `public/r/form-field-runtime.json`：粒子场核心运行时（着色器、渲染画布、状态计算等）
- `public/r/geometry-*.json`：21 个独立的几何采样器（如 `geometry-torus.json`、`geometry-galaxy-vortex.json`）
- `public/r/*.json`：21 种预设组件定义（如 `star-torus.json`、`celestial-gyro.json`）
- `public/r/schema/project.json`：项目配置与属性约束描述

### CLI 安装器

在你的任意 React 项目中，仅需一条命令即可按需拉取组件源码及相关采样器：

```bash
# 通过 npx 直接运行官方发布版本
npx @yuanyang749/formfield-cli@latest add star-torus

# 或者指定安装浑天星仪、星系漩涡
npx @yuanyang749/formfield-cli@latest add celestial-gyro
```

#### 本地调试安装：

```bash
node packages/cli/bin/formfield.mjs add star-torus \
  --registry ./public/r \
  --cwd /path/to/your-react-app
```

#### CLI 特性：
- 自动递归解析依赖：安装 `star-torus` 时，会自动分析并安装 `form-field-runtime` 与 `geometry-torus`，**绝不多安装未使用的其他几何算法**。
- 自动检测包管理器：支持 `npm`、`pnpm`、`yarn`、`bun` 自动安装 peer 依赖（`three`、`@react-three/fiber`）。
- 路径别名自动适配：支持在项目根目录创建 `formfield.json` 自定义源码写入目录与导入路径别名：

```json
{
  "registry": "https://formfield-lab.vercel.app/r",
  "sourceRoot": "src",
  "alias": "@/"
}
```

---

## 💻 代码集成与使用

安装完成后，直接在 React 视图中导入即可：

```tsx
import {
  FormField,
  DEFAULT_FORM_FIELD_CONFIG,
  type FormFieldConfig
} from "@/components/formfield";
import { celestialGyroGeometry } from "@/components/formfield/geometries/celestial-gyro";

// 仅注入当前组件所需的几何采样器
const geometries = [celestialGyroGeometry] as const;

const config: FormFieldConfig = {
  ...DEFAULT_FORM_FIELD_CONFIG,
  shape: "celestial-gyro",
  theme: {
    background: "#050816",
    star: "#7DD3FC",
    glow: "#BAE6FD"
  },
  motion: {
    flowSpeed: 1.2,
    pointScale: 1.0,
    morphDuration: 1.5
  },
  effects: {
    hoverRadius: 260,
    hoverIntensity: 1.2,
    trailIntensity: 0.8
  },
  interaction: {
    enabled: true,
    holdMode: "magnet",
    actions: {
      hoverLight: true,
      pointerParallax: true,
      dragRotate: true,
      wheelZoom: true,
      clickPulse: true,
      holdAction: true
    }
  }
};

export default function HeroSection() {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <FormField config={config} geometries={geometries} />
    </div>
  );
}
```

---

## 🛠 扩展自定义几何形态

扩展新的几何形态仅需 5 步：

1. **新建采样器**：在 `src/geometries/` 下创建采样文件（如 `src/geometries/my-shape.ts`）。
2. **实现数学采样**：实现 `GeometryDefinition` 接口的 `sample(positions, pointSizes, context)` 方法，填充 `Float32Array`。
3. **注册几何定义**：将新定义添加至 `src/geometries/registry.ts` 的 `GEOMETRY_DEFINITIONS`。
4. **添加 Registry 项**：在 `registry/registry.config.mjs` 中添加对应的 `geometryItems` 与 `visualPresets`。
5. **执行完整性校验**：
   ```bash
   npm run geometries:check && npm run registry:build && npm run registry:smoke
   ```

添加完成后，该几何形态将立刻自动接入 Studio 实时变形管线、交互手势、调色板预设以及 Registry/CLI 分发能力。

---

## 🏛 架构边界与设计哲学

```text
formfield-lab/
├── packages/
│   └── cli/                       # 独立分发的源码安装器 (@yuanyang749/formfield-cli)
├── registry/
│   └── registry.config.mjs        # 组件与几何算法的分发清单描述
├── scripts/
│   ├── build-registry.mjs         # Registry JSON 序列化与文件路径别名重写
│   ├── validate-geometries.mjs    # 几何数值稳定性矩阵数学校验
│   └── smoke-registry.mjs         # 端到端闭环烟测
├── src/
│   ├── components/star-field/     # 核心粒子形场运行时 (StarRuntime, Shaders, R3F Scene)
│   ├── geometries/                # 21 种几何数学拓扑采样器与集中注册表
│   ├── effects/                   # 后处理渲染层与特效能力元数据 (打光、尾迹、脉冲)
│   ├── domain/                    # 领域实体模型 (配置Schema、色彩预设、动作映射)
│   ├── ui/                        # Web Studio 创作编辑面板与操作界面
│   ├── export/                    # 源码生成器、CLI 命令与 Registry 转换器
│   └── i18n/                      # 中英双语词条体系
└── public/
    └── r/                         # 构建产出的 43 项静态 Registry API
```

### 渲染与状态分离原则
- **高频渲染层（GPU & C-Like）**：基于 `Float32Array`（TypedArray）、Web Audio/Shader Uniforms 与 Three.js Frame Loop 处理 60fps+ 的无锁粒子动力学与插值计算。
- **低频配置层（React & Zustand）**：仅负责响应用户交互、保存可序列化 JSON、配置快照与多语言控制，彻底避免无关的 React 组件树 Re-render。

---

## 🌐 部署指南

### Vercel 部署
- **体验地址**：[https://formfield-lab.vercel.app/](https://formfield-lab.vercel.app/)
- **Root Directory**：`formfield-lab`
- **Build Command**：`npm run build`
- **Output Directory**：`dist`
- **正式域名写入（可选环境变量）**：
  ```bash
  FORMFIELD_PUBLIC_URL=https://formfield-lab.vercel.app npm run build
  ```
  `vercel.json` 已配置 CORS 跨域响应头和 CDN 重验证机制，确保外部 CLI 和项目可以通过 `https://formfield-lab.vercel.app/r/` 畅通访问 Registry。

### GitHub Pages / 多项目部署
工作区根目录配置了 GitHub Actions (`.github/workflows/deploy.yml`)，会在主分支提交时自动执行构建并将 `formfield-lab/dist` 部署为全站主入口。

---

## 📄 License

[MIT](LICENSE)
