# 形场实验室 / FORMFIELD LAB

基于 React、TypeScript、React Three Fiber 的生成式视觉组件创作、实时预览与源码分发平台。

## 平台能力

- **创作**：主题、运动、形态、光照、尾迹与交互参数实时调节。
- **预览**：TypedArray + Shader 驱动的实时粒子形场。
- **界面**：中文与英文即时切换，并在本地持久化语言偏好。
- **形态**：星环、球体、莫比乌斯环、三叶结、克莱因瓶、超椭球、螺旋面、双螺旋、波浪面、流光丝带、心形面与星系漩涡。
- **源码输出**：复制 TSX、配置 JSON、Registry JSON 与 CLI 安装命令。
- **Registry**：核心运行时与几何采样器独立分发，安装组件时只拉取所用形态。
- **CLI**：递归解析组件依赖，并将源码写入 React 项目。

## 本地运行

```bash
npm install
npm run dev
```

代码级校验：

```bash
npm run typecheck
npm run geometries:check
npm run registry:build
npm run registry:smoke
npm run build
```

## 复用运行时

```tsx
import {
  FormField,
  DEFAULT_FORM_FIELD_CONFIG,
  type FormFieldConfig
} from "@/components/star-field";
import { torusGeometry } from "@/geometries/torus";

const geometries = [torusGeometry] as const;

const config = {
  ...DEFAULT_FORM_FIELD_CONFIG,
  shape: "torus-knot"
} satisfies FormFieldConfig;

export function Example() {
  return <FormField config={config} geometries={geometries} />;
}
```

## Registry

构建后的公开文件位于 `public/r/`：

```text
public/r/index.json
public/r/form-field-runtime.json
public/r/geometry-torus.json
public/r/star-torus.json
public/r/torus-knot.json
public/r/flow-ribbon.json
public/r/galaxy-vortex.json
```

查看当前注册项：

```bash
npm run registry:build
npm run registry:list
```

Registry 配置位于 `registry/registry.config.mjs`，源码文件内容会在构建时写入每个组件 JSON。

## CLI

本地 Registry 安装：

```bash
node packages/cli/bin/formfield.mjs add star-torus \
  --registry ./public/r \
  --cwd /path/to/react-project
```

发布 CLI 与 Registry 后，对外命令为：

```bash
npx @formfield/cli@latest add star-torus
```

CLI 支持：

- npm、pnpm、yarn、bun 自动检测
- Registry 依赖递归安装
- 按组件依赖安装核心运行时与所需几何采样器
- React 项目路径别名适配
- `--overwrite`
- `--skip-install`
- `--dry-run`

项目可通过 `formfield.json` 覆盖默认设置：

```json
{
  "registry": "https://formfield.dev/r",
  "sourceRoot": "src",
  "alias": "@/"
}
```

## 扩展形态

1. 在 `src/geometries/` 新建 `GeometryDefinition`。
2. 实现 `sample(positions, pointSizes, context)`。
3. 将定义加入 `src/geometries/registry.ts`。
4. 在 `registry/registry.config.mjs` 注册可分发预设。
5. 执行 `npm run geometries:check && npm run registry:build`。

注册后会自动获得连续变形、主题、Hover 光照、拖拽、冻结、尾迹、配置导出与 Registry 分发能力。

## 代码边界

- `src/components/star-field/`：可安装粒子形场运行时
- `src/geometries/`：形态采样器与注册表
- `src/effects/`：渲染层与特效能力元数据
- `src/ui/`：Studio 创作与分发界面
- `src/export/`：源码和 Registry 生成器
- `registry/`：公开 Registry 定义
- `packages/cli/`：源码安装器

React/Zustand 仅管理低频可序列化参数；高频渲染数据保留在 Runtime、TypedArray 与 Shader 中。
