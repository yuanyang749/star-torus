import type { StarFieldConfig } from "@/domain/star-field";
import { createInstallCommand } from "@/domain/brand";
import {
  GEOMETRY_DISTRIBUTION,
  VISUAL_PRESET_REGISTRY_NAMES
} from "@/geometries/distribution";
import {
  REGISTRY_SCHEMA,
  type FormFieldRegistryItem
} from "@/domain/registry";

const INVALID_IDENTIFIER_CHARACTERS = /[^a-zA-Z0-9_$\u4e00-\u9fff]/g;

export function normalizeComponentName(input: string): string {
  const compact = input.trim().replace(INVALID_IDENTIFIER_CHARACTERS, "");
  const prefixed = /^[a-zA-Z_$\u4e00-\u9fff]/.test(compact) ? compact : `Form${compact}`;
  const candidate = prefixed || "GeneratedFormField";
  return candidate[0].toUpperCase() + candidate.slice(1);
}

export function normalizeRegistryName(input: string): string {
  const componentName = normalizeComponentName(input);
  const slug = componentName
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return slug || "generated-form-field";
}

export function generateReactComponent(
  config: StarFieldConfig,
  requestedName: string
): string {
  const componentName = normalizeComponentName(requestedName);
  const serializedConfig = JSON.stringify(config, null, 2);
  const geometry = GEOMETRY_DISTRIBUTION[config.shape];
  const geometryCollectionName = `${componentName}Geometries`;

  return `import { FormField, type FormFieldConfig } from "@/components/formfield";
import { ${geometry.exportName} } from "@/components/formfield/geometries/${geometry.moduleName}";

const ${geometryCollectionName} = [${geometry.exportName}] as const;

export const ${componentName}Config = ${serializedConfig} satisfies FormFieldConfig;

export function ${componentName}() {
  return (
    <div style={{ width: "100%", minHeight: 420, aspectRatio: "1 / 1" }}>
      <FormField config={${componentName}Config} geometries={${geometryCollectionName}} />
    </div>
  );
}
`;
}

export function generateConfigJson(config: StarFieldConfig): string {
  return `${JSON.stringify(config, null, 2)}\n`;
}

export function generateRegistryItem(
  config: StarFieldConfig,
  requestedName: string
): FormFieldRegistryItem {
  const componentName = normalizeComponentName(requestedName);
  const registryName = normalizeRegistryName(requestedName);
  const geometry = GEOMETRY_DISTRIBUTION[config.shape];

  return {
    $schema: REGISTRY_SCHEMA,
    name: registryName,
    title: componentName,
    description: `由 FORMFIELD LAB 生成的 ${config.shape} 视觉组件。`,
    type: "registry:visual",
    dependencies: [],
    devDependencies: [],
    registryDependencies: [geometry.registryName],
    files: [
      {
        path: `registry/${registryName}/${componentName}.tsx`,
        target: `components/formfield/${componentName}.tsx`,
        type: "registry:component",
        content: generateReactComponent(config, componentName)
      }
    ],
    meta: {
      category: "field",
      shape: config.shape,
      tags: ["formfield", "r3f", "particles", config.shape]
    },
    config
  };
}

export function generateRegistryJson(config: StarFieldConfig, requestedName: string): string {
  return `${JSON.stringify(generateRegistryItem(config, requestedName), null, 2)}\n`;
}

export function generateComponentInstallCommand(shape: StarFieldConfig["shape"]): string {
  return createInstallCommand(VISUAL_PRESET_REGISTRY_NAMES[shape]);
}
