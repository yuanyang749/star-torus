import type {
  InteractionActionId,
  RuntimeStatus,
  ShapeId
} from "@/domain/star-field";
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
  interactionTitle: string;
  interactionGroupAria: string;
  interactionCount(selected: number, total: number): string;
  interactionActions: Record<InteractionActionId, string>;
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
    parallaxStrength: string;
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
      interactionPrimaryNote: "Hover 打光（常驻）· 指针视差 · 拖拽旋转",
      interactionFreezeNote: "滚轮缩放 · 单击脉冲 · 长按冻结",
      interactionMagnetNote: "滚轮缩放 · 单击脉冲 · 长按吸附 / 排斥",
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
      parallaxStrength: "视差强度",
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
      galaxy: { label: "星系漩涡", ariaLabel: "由四条星点旋臂组成并持续旋转的星系漩涡" },
      "network-globe": { label: "网络地球", ariaLabel: "由节点和跃迁弧线构成的三维网络地球" },
      "particle-logo": { label: "文字标志", ariaLabel: "由星点聚合形成的 FORMFIELD 三维文字标志" },
      "light-tunnel": { label: "光隧道", ariaLabel: "由连续粒子光环构成的纵深穿梭隧道" },
      "lissajous-orbit": { label: "星轨", ariaLabel: "由多组闭合利萨如轨道交错形成的三维星轨" },
      gyroid: { label: "极小曲面", ariaLabel: "满足三周期极小曲面方程的粒子 Gyroid" },
      metaball: { label: "流体软体", ariaLabel: "多个柔性体融合并呼吸变形的粒子 Metaball" },
      "particle-terrain": { label: "粒子地形", ariaLabel: "由多频波场生成并缓慢流动的粒子山脉地形" },
      "dna-ring": { label: "DNA 环链", ariaLabel: "首尾相连并带有梯级连接的环形 DNA 双螺旋" }
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
      initialNotice: "参数与所选交互会实时写入导出组件",
      copiedComponent: (componentName) => `已复制 ${componentName}.tsx`,
      copiedConfig: "已复制可序列化配置 JSON",
      copiedRegistry: (registryName) => `已复制 ${registryName}.json Registry 清单`,
      copiedInstallCommand: "已复制 CLI 安装命令",
      generatedComponent: (componentName) => `已生成 ${componentName}.tsx`,
      componentName: "组件名称",
      componentNameAria: "导出组件名称",
      interactionTitle: "保留交互",
      interactionGroupAria: "选择导出组件保留的交互动作",
      interactionCount: (selected, total) => `${selected}/${total} 已选`,
      interactionActions: {
        hoverLight: "跟随打光",
        pointerParallax: "指针视差",
        dragRotate: "拖拽旋转",
        wheelZoom: "滚轮缩放",
        clickPulse: "单击脉冲",
        holdAction: "长按行为"
      },
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
      interactionPrimaryNote: "Hover light · Pointer parallax · Drag to rotate",
      interactionFreezeNote: "Wheel zoom · Click pulse · Hold to freeze",
      interactionMagnetNote: "Wheel zoom · Click pulse · Hold to attract / repel",
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
      parallaxStrength: "Parallax Strength",
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
      galaxy: { label: "Galaxy", ariaLabel: "A rotating particle galaxy with four spiral arms" },
      "network-globe": { label: "Network Globe", ariaLabel: "A network globe made of nodes and elevated connection arcs" },
      "particle-logo": { label: "Particle Logo", ariaLabel: "A three-dimensional FORMFIELD wordmark assembled from particles" },
      "light-tunnel": { label: "Light Tunnel", ariaLabel: "A deep light tunnel assembled from continuous particle rings" },
      "lissajous-orbit": { label: "Star Orbits", ariaLabel: "Interwoven three-dimensional Lissajous particle orbits" },
      gyroid: { label: "Gyroid", ariaLabel: "A particle gyroid based on a triply periodic minimal surface" },
      metaball: { label: "Metaball", ariaLabel: "Breathing and merging particle metaballs" },
      "particle-terrain": { label: "Terrain", ariaLabel: "A flowing particle mountain terrain generated from layered waves" },
      "dna-ring": { label: "DNA Ring", ariaLabel: "A closed DNA double helix with particle rungs" }
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
      initialNotice: "Parameters and selected interactions are reflected in the export",
      copiedComponent: (componentName) => `Copied ${componentName}.tsx`,
      copiedConfig: "Copied serializable config JSON",
      copiedRegistry: (registryName) => `Copied ${registryName}.json registry manifest`,
      copiedInstallCommand: "Copied CLI install command",
      generatedComponent: (componentName) => `Generated ${componentName}.tsx`,
      componentName: "Component Name",
      componentNameAria: "Exported component name",
      interactionTitle: "Keep Interactions",
      interactionGroupAria: "Choose interactions to keep in the exported component",
      interactionCount: (selected, total) => `${selected}/${total} selected`,
      interactionActions: {
        hoverLight: "Hover Light",
        pointerParallax: "Pointer Parallax",
        dragRotate: "Drag Rotate",
        wheelZoom: "Wheel Zoom",
        clickPulse: "Click Pulse",
        holdAction: "Hold Action"
      },
      copyTsx: "Copy TSX",
      downloadComponent: "Download Component",
      copyConfig: "Copy Config",
      copyRegistry: "Copy Registry",
      copy: "Copy"
    }
  }
} satisfies Record<Locale, Messages>;
