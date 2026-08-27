# FormField Consumer

用于验证 FORMFIELD LAB 组件能否通过 CLI 安装进独立 React/Vite 项目并直接运行。

## 已验证安装

项目中的 `MyFormField` 通过本地打包 Registry 安装：

```bash
node ../star-torus/packages/cli/bin/formfield.mjs add my-form-field
```

安装结果：

- `src/components/formfield/`：FormField 核心运行时
- `src/components/formfield/geometries/torus.ts`：当前组件使用的星环采样器
- `src/components/formfield/MyFormField.tsx`：测试组件
- `three`、`@react-three/fiber`、`@types/three`：自动安装的依赖

## 本地运行

```bash
npm install
npm run dev
```

## 校验

```bash
npm run lint
npm run build
```

本地 Registry 位于 `.formfield-registry/`，只包含核心运行时、星环几何和
`my-form-field` 三个条目；项目配置位于 `formfield.json`。
