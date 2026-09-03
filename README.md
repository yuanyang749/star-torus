# 视觉与交互实验场 / Playground

本仓库是一个聚焦于现代 Web 前端、生成式三维粒子视觉、数学拓扑艺术以及组件分发的探索型多项目工作区。

---

## 📁 目录导览

```text
.
├── formfield-lab/          # 【核心】形场实验室 (FORMFIELD LAB)
│   ├── packages/cli/       # 源码级组件安装器 (@yuanyang749/formfield-cli)
│   ├── public/r/           # 类 shadcn 风格的组件与几何 Registry (43项)
│   └── src/                # Studio 创作界面、21 种几何数学拓扑与 R3F 渲染核心
├── formfield-consumer/     # CLI 源码分发验证工程（独立的 React/Vite 项目）
├── feature-cards/          # 基于 GSAP 的高交互特性卡片展示页面
├── jianbihua.html          # 原生 Canvas 简笔画涂鸦交互演示
└── .github/workflows/      # GitHub Pages 多项目自动部署流水线
```

---

## 🪐 重点项目介绍

### 1. [形场实验室 (FORMFIELD LAB)](./formfield-lab/README.md)

基于 **React 19**、**TypeScript**、**React Three Fiber (Three.js)** 的高阶生成式 3D 粒子视觉组件创作、实时预览与源码分发生态平台。

- **21 种高等数学拓扑**：星环、球体、莫比乌斯环、三叶结、克莱因瓶、超椭球、双螺旋、星系漩涡、浑天星仪、时空奇点、文字粒子等。
- **解耦的六大交互体系**：局部打光、指针视差、拖拽全景旋转、滚轮视距缩放、短按脉冲、长按磁吸/冻结。
- **类 shadcn 源码级分发**：提供公开 Registry API 与官方 CLI 工具，按需拉取组件与核心算法源码，零臃肿黑盒依赖。
- **在线体验 (Vercel)**：[https://formfield-lab.vercel.app/](https://formfield-lab.vercel.app/)
- **详细文档**：查阅 [formfield-lab/README.md](./formfield-lab/README.md)。

### 2. [FormField Consumer](./formfield-consumer/README.md)

用于验证 `@yuanyang749/formfield-cli` 能否将 Registry 中的形场组件与对应几何采样器正确解析、安装进全新独立 React 项目并直接运行的工程化用例。

### 3. Feature Cards

基于 GSAP 动画引擎构建的现代风格特性卡片，展示微交互与平滑动画动效。

### 4. Jianbihua (简笔画)

轻量级单文件 Web 交互工具，探索 Canvas 画布涂鸦与手绘轨迹的灵感体验。

---

## 🚀 常用指令

```bash
# 启动 FormField Lab 创作工作室
cd formfield-lab
npm install
npm run dev

# 校验 21 种几何采样器与 Registry 完整性
npm run geometries:check
npm run registry:smoke

# 启动 Consumer 测试工程
cd ../formfield-consumer
npm install
npm run dev
```

---

## 🚢 CI/CD 自动化部署

仓库配置了 GitHub Actions 自动化部署流水线 (`.github/workflows/deploy.yml`)：
- 每次推送代码到 `main` 分支时，自动打包构建 `formfield-lab`。
- 将 `formfield-lab/dist` 作为 GitHub Pages 根目录发布。
- 同时将 `feature-cards` 与 `jianbihua.html` 作为子路径一并部署。

---

## 📄 License

[MIT](LICENSE)
