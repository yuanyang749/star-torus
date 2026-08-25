import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = await mkdtemp(join(tmpdir(), "formfield-geometries-"));
const outputFile = resolve(outputDirectory, "registry.mjs");

try {
  await build({
    entryPoints: [resolve(root, "src/geometries/registry.ts")],
    outfile: outputFile,
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node18",
    alias: {
      "@": resolve(root, "src")
    }
  });

  const { GEOMETRY_DEFINITIONS } = await import(pathToFileURL(outputFile).href);
  assert.equal(GEOMETRY_DEFINITIONS.length, 11);

  for (const definition of GEOMETRY_DEFINITIONS) {
    for (const phase of [0, 0.73, 2.15]) {
      const positions = new Float32Array(80 * 40 * 3);
      const pointSizes = new Float32Array(80 * 40);
      definition.sample(positions, pointSizes, { phase, columns: 80, rows: 40 });

      let maximumExtent = 0;
      for (const value of positions) {
        assert(Number.isFinite(value), `${definition.id} emitted a non-finite position`);
        maximumExtent = Math.max(maximumExtent, Math.abs(value));
      }
      for (const size of pointSizes) {
        assert(Number.isFinite(size) && size >= 0, `${definition.id} emitted an invalid size`);
      }
      assert(maximumExtent >= 80, `${definition.id} collapsed below the visible scale`);
      assert(maximumExtent <= 310, `${definition.id} exceeds the shared scene scale`);
    }
  }

  process.stdout.write(`Validated ${GEOMETRY_DEFINITIONS.length} geometry samplers.\n`);
} finally {
  await rm(outputDirectory, { recursive: true, force: true });
}
