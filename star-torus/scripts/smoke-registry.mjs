import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { build } from "esbuild";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registryDirectory = resolve(root, "public/r");
const index = await readJson(resolve(registryDirectory, "index.json"));
const itemNames = new Set(index.items.map((item) => item.name));

assert.equal(index.name, "formfield");
assert.equal(index.items.length, 41);
assert(itemNames.has("form-field-runtime"));
assert(itemNames.has("geometry-torus"));
assert(itemNames.has("geometry-galaxy-vortex"));
assert(itemNames.has("star-torus"));
assert(itemNames.has("galaxy-vortex"));
assert(itemNames.has("flow-ribbon"));
for (const name of [
  "network-globe",
  "particle-logo",
  "light-tunnel",
  "lissajous-orbit",
  "gyroid",
  "metaball",
  "particle-terrain",
  "dna-ring"
]) {
  assert(itemNames.has(name), `Missing visual registry item ${name}`);
  assert(itemNames.has(`geometry-${name}`), `Missing geometry registry item ${name}`);
}

for (const itemName of itemNames) {
  const item = await readJson(resolve(registryDirectory, `${itemName}.json`));
  assert.equal(item.name, itemName);
  assert(Array.isArray(item.files) && item.files.length > 0);
  for (const dependency of item.registryDependencies ?? []) {
    assert(itemNames.has(dependency), `${itemName} references missing ${dependency}`);
  }
  for (const file of item.files) {
    assert(file.target && file.content, `${itemName} contains an empty source file`);
    assert(!file.content.includes("@/components/star-field"));
    assert(!file.content.includes("@/domain/star-field"));
    assert(!file.content.includes("@/geometries/"));
  }
}

const sandbox = await mkdtemp(join(tmpdir(), "formfield-cli-"));
try {
  await mkdir(resolve(sandbox, "src"), { recursive: true });
  await writeFile(
    resolve(sandbox, "package.json"),
    `${JSON.stringify({ name: "formfield-smoke", private: true }, null, 2)}\n`
  );

  const cliResult = spawnSync(
    process.execPath,
    [
      resolve(root, "packages/cli/bin/formfield.mjs"),
      "add",
      "dna-ring",
      "--cwd",
      sandbox,
      "--registry",
      registryDirectory,
      "--skip-install"
    ],
    { encoding: "utf8" }
  );

  assert.equal(cliResult.status, 0, cliResult.stderr || cliResult.stdout);
  assert(existsSync(resolve(sandbox, "src/components/formfield/StarField.tsx")));
  assert(existsSync(resolve(sandbox, "src/components/formfield/geometries/dna-ring.ts")));
  assert(!existsSync(resolve(sandbox, "src/components/formfield/geometries/sphere.ts")));
  assert(!existsSync(resolve(sandbox, "src/components/formfield/geometries/torus.ts")));
  assert(!existsSync(resolve(sandbox, "src/components/formfield/geometries/registry.ts")));
  assert(existsSync(resolve(sandbox, "src/components/formfield/presets/DnaRingField.tsx")));
  const installedPreset = await readFile(
    resolve(sandbox, "src/components/formfield/presets/DnaRingField.tsx"),
    "utf8"
  );
  assert(installedPreset.includes('from "@/components/formfield"'));
  assert(installedPreset.includes('from "@/components/formfield/geometries/dna-ring"'));
  assert(installedPreset.includes("geometries={DnaRingFieldGeometries}"));

  await build({
    entryPoints: [resolve(sandbox, "src/components/formfield/presets/DnaRingField.tsx")],
    outdir: resolve(sandbox, ".build"),
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    target: "es2022",
    alias: {
      "@": resolve(sandbox, "src")
    },
    external: ["react", "react/*", "three", "three/*", "@react-three/fiber"]
  });
} finally {
  await rm(sandbox, { recursive: true, force: true });
}

process.stdout.write(`Validated ${index.items.length} registry items and CLI source installation.\n`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
