import type { StarFieldConfig } from "@/domain/star-field";

const INVALID_IDENTIFIER_CHARACTERS = /[^a-zA-Z0-9_$\u4e00-\u9fff]/g;

export function normalizeComponentName(input: string): string {
  const compact = input.trim().replace(INVALID_IDENTIFIER_CHARACTERS, "");
  const prefixed = /^[a-zA-Z_$\u4e00-\u9fff]/.test(compact) ? compact : `Star${compact}`;
  const candidate = prefixed || "GeneratedStarField";
  return candidate[0].toUpperCase() + candidate.slice(1);
}

export function generateReactComponent(
  config: StarFieldConfig,
  requestedName: string
): string {
  const componentName = normalizeComponentName(requestedName);
  const serializedConfig = JSON.stringify(config, null, 2);

  return `import { StarField, type StarFieldConfig } from "@/components/star-field";

export const ${componentName}Config = ${serializedConfig} satisfies StarFieldConfig;

export function ${componentName}() {
  return (
    <div style={{ width: "100%", minHeight: 420, aspectRatio: "1 / 1" }}>
      <StarField config={${componentName}Config} />
    </div>
  );
}
`;
}

export function generateConfigJson(config: StarFieldConfig): string {
  return `${JSON.stringify(config, null, 2)}\n`;
}
