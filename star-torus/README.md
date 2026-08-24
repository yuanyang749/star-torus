# Star Torus Component Studio

基于 React、TypeScript、React Three Fiber 的可复用星场组件与参数实验台。

## 本地运行

```bash
npm install
npm run dev
```

生产检查：

```bash
npm run typecheck
npm run build
```

## 复用组件

```tsx
import {
  StarField,
  DEFAULT_STAR_FIELD_CONFIG,
  type StarFieldConfig
} from "@/components/star-field";

const config = {
  ...DEFAULT_STAR_FIELD_CONFIG,
  shape: "mobius"
} satisfies StarFieldConfig;

export function Example() {
  return <StarField config={config} />;
}
```

控制台中的“生成复用组件”可以直接复制或下载包含当前参数的 `.tsx` 文件，也可以复制 JSON 配置。

## 扩展几何形态

1. 在 `src/geometries/` 新建一个 `GeometryDefinition`。
2. 实现 `sample(positions, pointSizes, context)`。
3. 添加到 `src/geometries/registry.ts`。

注册后形态会自动出现在控制面板，并自动获得形变、主题、交互与导出能力。

特效组件位于 `src/effects/`，内置局部打光、方向尾迹与能量脉冲，并通过 `EFFECT_DEFINITIONS` 暴露能力元数据。

渲染帧内数据保留在 `StarRuntime`、TypedArray 和 Shader 中；React/Zustand 只管理低频、可序列化的组件参数。
