import { readFile, rm, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createPresetConfig,
  runtimeFiles,
  visualPresets
} from "../registry/registry.config.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(root, "public/r");
const schemaUrl = "https://formfield.dev/r/schema/registry-item.json";
const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(resolve(outputDirectory, "schema"), { recursive: true });

const runtimeItem = {
  $schema: schemaUrl,
  name: "form-field-runtime",
  title: "FormField Runtime",
  description: "FORMFIELD LAB 的 React Three Fiber 粒子形场运行时。",
  type: "registry:runtime",
  dependencies: ["react", "three", "@react-three/fiber"],
  devDependencies: ["@types/three"],
  registryDependencies: [],
  files: await Promise.all(runtimeFiles.map(async ([source, target, type]) => ({
    path: source,
    target,
    type,
    content: rewriteRuntimeImports(await readFile(resolve(root, source), "utf8"))
  }))),
  meta: {
    category: "field",
    tags: ["formfield", "runtime", "r3f", "particles"]
  }
};

const visualItems = visualPresets.map(([name, componentName, title, shape]) => {
  const config = createPresetConfig(shape);
  const componentSource = createPresetComponentSource(componentName, config);
  return {
    $schema: schemaUrl,
    name,
    title,
    description: `FORMFIELD LAB 的${title}生成式视觉组件。`,
    type: "registry:visual",
    dependencies: [],
    devDependencies: [],
    registryDependencies: ["form-field-runtime"],
    files: [
      {
        path: `registry/${name}/${componentName}.tsx`,
        target: `components/formfield/presets/${componentName}.tsx`,
        type: "registry:component",
        content: componentSource
      }
    ],
    meta: {
      category: "field",
      shape,
      tags: ["formfield", "r3f", "particles", shape]
    },
    config
  };
});

const items = [runtimeItem, ...visualItems];
const index = {
  name: "formfield",
  title: "形场实验室 / FORMFIELD LAB",
  version: packageJson.version,
  homepage: "https://formfield.dev",
  items: items.map(({ name, title, description, type, meta }) => ({
    name,
    title,
    description,
    type,
    meta
  }))
};

for (const item of items) {
  await writeJson(resolve(outputDirectory, `${item.name}.json`), item);
}
await writeJson(resolve(outputDirectory, "index.json"), index);
await writeJson(resolve(outputDirectory, "schema/registry-item.json"), createRegistrySchema());
await writeJson(resolve(outputDirectory, "schema/project.json"), createProjectSchema());

process.stdout.write(
  `Built ${items.length} FormField registry items in ${outputDirectory}\n`
);

function rewriteRuntimeImports(source) {
  return source
    .replaceAll("@/components/star-field", "@/components/formfield")
    .replaceAll("@/domain/star-field", "@/components/formfield/domain")
    .replaceAll("@/geometries/", "@/components/formfield/geometries/")
    .replaceAll("@/effects/", "@/components/formfield/effects/");
}

function createPresetComponentSource(componentName, config) {
  return `import { FormField, type FormFieldConfig } from "@/components/formfield";

export const ${componentName}Config = ${JSON.stringify(config, null, 2)} satisfies FormFieldConfig;

export function ${componentName}() {
  return (
    <div style={{ width: "100%", minHeight: 420, aspectRatio: "1 / 1" }}>
      <FormField config={${componentName}Config} />
    </div>
  );
}
`;
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function createRegistrySchema() {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: schemaUrl,
    title: "FormField Registry Item",
    type: "object",
    required: [
      "name",
      "title",
      "description",
      "type",
      "dependencies",
      "registryDependencies",
      "files",
      "meta"
    ],
    properties: {
      name: { type: "string", pattern: "^[a-z0-9-]+$" },
      title: { type: "string" },
      description: { type: "string" },
      type: { enum: ["registry:visual", "registry:runtime"] },
      dependencies: { type: "array", items: { type: "string" } },
      devDependencies: { type: "array", items: { type: "string" } },
      registryDependencies: { type: "array", items: { type: "string" } },
      files: {
        type: "array",
        items: {
          type: "object",
          required: ["target", "type", "content"],
          properties: {
            path: { type: "string" },
            target: { type: "string" },
            type: { enum: ["registry:file", "registry:component", "registry:style"] },
            content: { type: "string" }
          }
        }
      },
      meta: { type: "object" },
      config: { type: "object" }
    }
  };
}

function createProjectSchema() {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://formfield.dev/r/schema/project.json",
    title: "FormField Project Configuration",
    type: "object",
    properties: {
      registry: { type: "string" },
      sourceRoot: { type: "string", default: "src" },
      alias: { type: "string", default: "@/" }
    },
    additionalProperties: false
  };
}
