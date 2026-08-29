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
  assert.equal(GEOMETRY_DEFINITIONS.length, 21);

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

  const celestialGyro = GEOMETRY_DEFINITIONS.find(({ id }) => id === "celestial-gyro");
  assert(celestialGyro, "celestial-gyro geometry is missing");
  const smallPositions = new Float32Array(3 * 2 * 3);
  const smallSizes = new Float32Array(3 * 2);
  celestialGyro.sample(smallPositions, smallSizes, { phase: 0.73, columns: 3, rows: 2 });
  assert([...smallPositions].every(Number.isFinite), "celestial-gyro fails for a single core point");

  const singularity = GEOMETRY_DEFINITIONS.find(({ id }) => id === "singularity");
  assert(singularity, "singularity geometry is missing");
  const pointCount = 80 * 40;
  const diskPoints = Math.floor(pointCount * 0.52);
  const photonRingPoints = Math.floor(pointCount * 0.22);
  const jetPoints = Math.floor(pointCount * 0.20);
  const jetHalf = Math.floor(jetPoints / 2);
  const singularityPositions = new Float32Array(pointCount * 3);
  const singularitySizes = new Float32Array(pointCount);
  singularity.sample(singularityPositions, singularitySizes, { phase: 0, columns: 80, rows: 40 });

  let innerDiskPoints = 0;
  for (let index = 0; index < diskPoints; index += 1) {
    const positionIndex = index * 3;
    const x = singularityPositions[positionIndex];
    const z = singularityPositions[positionIndex + 2] / 0.88;
    if (Math.hypot(x, z) <= (46 + 216) / 2) innerDiskPoints += 1;
  }
  assert(innerDiskPoints > diskPoints - innerDiskPoints, "singularity disk is not denser near its center");

  const jetStart = diskPoints + photonRingPoints;
  const northStartY = singularityPositions[(jetStart * 3) + 1];
  const southStartY = singularityPositions[((jetStart + jetHalf) * 3) + 1];
  const northEndY = singularityPositions[((jetStart + jetHalf - 1) * 3) + 1];
  const southEndY = singularityPositions[((jetStart + jetPoints - 1) * 3) + 1];
  assert(Math.abs(northStartY + southStartY) < 1e-5, "singularity jet roots are asymmetric");
  assert(Math.abs(northEndY + southEndY) < 1e-5, "singularity jet extents are asymmetric");

  process.stdout.write(`Validated ${GEOMETRY_DEFINITIONS.length} geometry samplers.\n`);
} finally {
  await rm(outputDirectory, { recursive: true, force: true });
}
