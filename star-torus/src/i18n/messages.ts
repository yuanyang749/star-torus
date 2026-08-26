import type { RuntimeStatus, ShapeId } from "@/domain/star-field";
import type { ThemePresetId } from "@/domain/theme-presets";

export const LOCALES = ["zh-CN", "en-US"] as const;
export type Locale = (typeof LOCALES)[number];

interface ShapeCopy {
  label: string;
  ariaLabel: string;
}

export interface ExportCopy {
  initialNotice: string;
  copiedComponent(componentName: string): string;
  copiedConfig: string;
  copiedRegistry(registryName: string): string;
  copiedInstallCommand: string;
  generatedComponent(componentName: string): string;
  componentName: string;
  componentNameAria: string;
  copyTsx: string;
  downloadComponent: string;
  copyConfig: string;
  copyRegistry: string;
  copy: string;
}

interface Messages {
  language: {
    groupAria: string;
    chineseAria: string;
    englishAria: string;
  };
  panel: {
    ariaLabel: string;
    expand: string;
    collapse: string;
    title: string;
    pipelineAria: string;
    pipelineCreate: string;
    pipelinePreview: string;
    pipelineExport: string;
    previewSection: string;
    interactionEnableAria: string;
    interactionDisableAria: string;
    interactionLabel: string;
    interactionPrimaryNote: string;
    interactionFreezeNote: string;
    interactionMagnetNote: string;
    shapesSection: string;
    holdLabel: string;
    holdGroupAria: string;
    magnet: string;
    freeze: string;
    formLibrary: string;
    shapeCount(count: number): string;
    shapeGroupAria: string;
    parametersSection: string;
    reset: string;
    flowSpeed: string;
    pointSize: string;
    morphDuration: string;
    lightRadius: string;
    lightIntensity: string;
    trailIntensity: string;
    themesSection: string;
    themeGroupAria: string;
    colorsSection: string;
    backgroundColor: string;
    starColor: string;
    glowColor: string;
    selectColor(label: string): string;
    sourceSection: string;
    resetView: string;
    resetTheme: string;
  };
  statuses: Record<RuntimeStatus, string>;
  shapes: Record<ShapeId, ShapeCopy>;
  themes: Record<ThemePresetId, string>;
  export: ExportCopy;
}

export const MESSAGES = {
  "zh-CN": {
    language: {
      groupAria: "切换界面语言",
      chineseAria: "切换为中文",
      englishAria: "切换为英文"
    },
    panel: {
      ariaLabel: "形场实验室控制面板",
      expand: "展开控制面板",
      collapse: "收起控制面板",
      title: "形场实验室",
      pipelineAria: "创作、预览与源码分发流程",
      pipelineCreate: "创作",
      pipelinePreview: "实时预览",
      pipelineExport: "源码分发",
      previewSection: "预览与交互",
      interactionEnableAria: "开启形场交互",
      interactionDisableAria: "关闭形场交互",
      interactionLabel: "形场交互",
      interactionPrimaryNote: "Hover 打光（常驻）· 拖拽旋转 · 滚轮缩放",
      interactionFreezeNote: "单击脉冲 · 长按冻结 · 松开渐进恢复",
      interactionMagnetNote: "单击脉冲 · 长按吸附 · Shift 长按排斥",
      shapesSection: "形态目录",
      holdLabel: "长按行为",
      holdGroupAria: "选择长按行为",
      magnet: "磁力",
      freeze: "冻结",
      formLibrary: "FORM LIBRARY",
      shapeCount: (count) => `${count} 个注册形态`,
      shapeGroupAria: "选择几何形态",
      parametersSection: "创作参数",
      reset: "RESET",
      flowSpeed: "流动速度",
      pointSize: "星点尺寸",
      morphDuration: "变形时长",
      lightRadius: "光照半径",
      lightIntensity: "光照强度",
      trailIntensity: "尾迹强度",
      themesSection: "主题预设",
      themeGroupAria: "选择主题预设",
      colorsSection: "自定义颜色",
      backgroundColor: "背景色",
      starColor: "星点色",
      glowColor: "光照色",
      selectColor: (label) => `选择${label}`,
      sourceSection: "源码分发",
      resetView: "复位视角",
      resetTheme: "恢复黑白"
    },
    statuses: {
      disabled: "已关闭",
      idle: "已开启",
      dragging: "旋转中",
      attracting: "吸附中",
      repelling: "排斥中",
      frozen: "时空冻结"
    },
    shapes: {
      torus: { label: "星环", ariaLabel: "由星点组成并持续流动的三维星环" },
      sphere: { label: "球体", ariaLabel: "由星点组成并持续流动的三维球体" },
      mobius: { label: "莫比乌斯", ariaLabel: "由星点组成并持续流动的莫比乌斯环" },
      "torus-knot": { label: "三叶结", ariaLabel: "由星点组成并持续流动的三叶环面结" },
      klein: { label: "克莱因瓶", ariaLabel: "由星点组成并持续流动的克莱因瓶曲面" },
      superellipsoid: { label: "超椭球", ariaLabel: "由星点组成并持续流动的超椭球曲面" },
      helicoid: { label: "螺旋面", ariaLabel: "由星点组成并持续旋转的螺旋曲面" },
      "double-helix": { label: "双螺旋", ariaLabel: "由两束相互缠绕的星点链组成的双螺旋" },
      "wave-surface": { label: "波浪面", ariaLabel: "由星点展开形成并持续起伏的波浪马鞍曲面" },
      "flow-ribbon": { label: "流光丝带", ariaLabel: "由星点编织并持续流动的三维流光丝带" },
      heart: { label: "心形面", ariaLabel: "由星点组成并持续流动的三维心形曲面" },
      galaxy: { label: "星系漩涡", ariaLabel: "由四条星点旋臂组成并持续旋转的星系漩涡" }
    },
    themes: {
      mono: "经典黑白",
      deep: "深空蓝",
      nebula: "星云紫",
      ember: "熔岩橙",
      aurora: "极光绿",
      pearl: "月尘白"
    },
    export: {
      initialNotice: "参数变化会实时写入导出组件",
      copiedComponent: (componentName) => `已复制 ${componentName}.tsx`,
      copiedConfig: "已复制可序列化配置 JSON",
      copiedRegistry: (registryName) => `已复制 ${registryName}.json Registry 清单`,
      copiedInstallCommand: "已复制 CLI 安装命令",
      generatedComponent: (componentName) => `已生成 ${componentName}.tsx`,
      componentName: "组件名称",
      componentNameAria: "导出组件名称",
      copyTsx: "复制 TSX",
      downloadComponent: "下载组件",
      copyConfig: "复制配置",
      copyRegistry: "复制 Registry",
      copy: "复制"
    }
  },
  "en-US": {
    language: {
      groupAria: "Switch interface language",
      chineseAria: "Switch to Chinese",
      englishAria: "Switch to English"
    },
    panel: {
      ariaLabel: "FormField Lab control panel",
      expand: "Expand control panel",
      collapse: "Collapse control panel",
      title: "FORMFIELD LAB",
      pipelineAria: "Create, preview, and distribute source code",
      pipelineCreate: "CREATE",
      pipelinePreview: "PREVIEW",
      pipelineExport: "EXPORT",
      previewSection: "Preview & Interaction",
      interactionEnableAria: "Enable field interaction",
      interactionDisableAria: "Disable field interaction",
      interactionLabel: "Field Interaction",
      interactionPrimaryNote: "Hover light · Drag to rotate · Scroll to zoom",
      interactionFreezeNote: "Click pulse · Hold to freeze · Release to resume",
      interactionMagnetNote: "Click pulse · Hold to attract · Shift-hold to repel",
      shapesSection: "Shape Library",
      holdLabel: "Hold Action",
      holdGroupAria: "Select hold action",
      magnet: "Magnet",
      freeze: "Freeze",
      formLibrary: "FORM LIBRARY",
      shapeCount: (count) => `${count} REGISTERED FORMS`,
      shapeGroupAria: "Select geometry",
      parametersSection: "Creative Parameters",
      reset: "RESET",
      flowSpeed: "Flow Speed",
      pointSize: "Point Size",
      morphDuration: "Morph Duration",
      lightRadius: "Light Radius",
      lightIntensity: "Light Intensity",
      trailIntensity: "Trail Intensity",
      themesSection: "Theme Presets",
      themeGroupAria: "Select a theme preset",
      colorsSection: "Custom Colors",
      backgroundColor: "Background",
      starColor: "Particles",
      glowColor: "Glow",
      selectColor: (label) => `Select ${label.toLowerCase()} color`,
      sourceSection: "Source Export",
      resetView: "Reset View",
      resetTheme: "Reset Theme"
    },
    statuses: {
      disabled: "Disabled",
      idle: "Enabled",
      dragging: "Rotating",
      attracting: "Attracting",
      repelling: "Repelling",
      frozen: "Time Frozen"
    },
    shapes: {
      torus: { label: "Torus", ariaLabel: "A flowing three-dimensional particle torus" },
      sphere: { label: "Sphere", ariaLabel: "A flowing three-dimensional particle sphere" },
      mobius: { label: "Möbius", ariaLabel: "A flowing particle Möbius strip" },
      "torus-knot": { label: "Trefoil", ariaLabel: "A flowing particle trefoil torus knot" },
      klein: { label: "Klein Bottle", ariaLabel: "A flowing particle Klein bottle surface" },
      superellipsoid: { label: "Superellipsoid", ariaLabel: "A flowing particle superellipsoid surface" },
      helicoid: { label: "Helicoid", ariaLabel: "A continuously rotating particle helicoid" },
      "double-helix": { label: "Double Helix", ariaLabel: "Two intertwined particle chains forming a double helix" },
      "wave-surface": { label: "Wave", ariaLabel: "A continuously undulating particle wave saddle surface" },
      "flow-ribbon": { label: "Ribbon", ariaLabel: "A three-dimensional ribbon woven from flowing particles" },
      heart: { label: "Heart", ariaLabel: "A flowing three-dimensional particle heart surface" },
      galaxy: { label: "Galaxy", ariaLabel: "A rotating particle galaxy with four spiral arms" }
    },
    themes: {
      mono: "Monochrome",
      deep: "Deep Space",
      nebula: "Nebula",
      ember: "Ember",
      aurora: "Aurora",
      pearl: "Lunar Pearl"
    },
    export: {
      initialNotice: "Parameter changes are reflected in the exported component",
      copiedComponent: (componentName) => `Copied ${componentName}.tsx`,
      copiedConfig: "Copied serializable config JSON",
      copiedRegistry: (registryName) => `Copied ${registryName}.json registry manifest`,
      copiedInstallCommand: "Copied CLI install command",
      generatedComponent: (componentName) => `Generated ${componentName}.tsx`,
      componentName: "Component Name",
      componentNameAria: "Exported component name",
      copyTsx: "Copy TSX",
      downloadComponent: "Download Component",
      copyConfig: "Copy Config",
      copyRegistry: "Copy Registry",
      copy: "Copy"
    }
  }
} satisfies Record<Locale, Messages>;
