#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const DEFAULT_REGISTRY = "https://temporary-spry-copper-io6ia77.vercel.app/r";
const args = process.argv.slice(2);
const command = args.shift();
const options = parseOptions(args);

if (command === "add") {
  await addComponent(options);
} else if (command === "list") {
  await listComponents(options);
} else {
  printHelp();
  process.exitCode = command ? 1 : 0;
}

async function addComponent({ positionals, flags }) {
  const componentName = positionals[0];
  if (!componentName) fail("Missing component name. Example: formfield add star-torus");

  const cwd = resolve(String(flags.cwd ?? process.cwd()));
  const projectConfig = await readProjectConfig(cwd);
  const registry = resolveRegistrySource(
    String(flags.registry ?? projectConfig.registry ?? DEFAULT_REGISTRY),
    flags.registry ? process.cwd() : cwd
  );
  const sourceRoot = resolve(cwd, String(projectConfig.sourceRoot ?? "src"));
  const alias = String(projectConfig.alias ?? "@/");
  const overwrite = Boolean(flags.overwrite);
  const dryRun = Boolean(flags["dry-run"]);
  const skipInstall = Boolean(flags["skip-install"] || dryRun);
  const resolvedItems = [];
  const visited = new Set();

  await resolveItem(componentName);

  const files = resolvedItems.flatMap((item) => item.files ?? []);
  for (const file of files) {
    const destination = resolve(sourceRoot, file.target);
    assertInside(sourceRoot, destination);
    const exists = existsSync(destination);
    if (exists && !overwrite) {
      process.stdout.write(`skip  ${relative(cwd, destination)} (already exists)\n`);
      continue;
    }

    process.stdout.write(`${dryRun ? "plan" : "write"} ${relative(cwd, destination)}\n`);
    if (!dryRun) {
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, adaptAlias(String(file.content ?? ""), alias), "utf8");
    }
  }

  if (!skipInstall) {
    const dependencies = unique(resolvedItems.flatMap((item) => item.dependencies ?? []));
    const devDependencies = unique(resolvedItems.flatMap((item) => item.devDependencies ?? []));
    installDependencies(cwd, dependencies, false);
    installDependencies(cwd, devDependencies, true);
  }

  process.stdout.write(
    `\nInstalled ${componentName} from ${resolvedItems.length} registry item(s).\n`
  );

  async function resolveItem(name) {
    if (visited.has(name)) return;
    visited.add(name);
    const item = await readRegistryJson(registry, `${name}.json`);
    if (!item || typeof item !== "object" || !Array.isArray(item.files)) {
      fail(`Invalid registry item: ${name}`);
    }
    for (const dependency of item.registryDependencies ?? []) {
      await resolveItem(dependency);
    }
    resolvedItems.push(item);
  }
}

async function listComponents({ flags }) {
  const cwd = resolve(String(flags.cwd ?? process.cwd()));
  const projectConfig = await readProjectConfig(cwd);
  const registry = resolveRegistrySource(
    String(flags.registry ?? projectConfig.registry ?? DEFAULT_REGISTRY),
    flags.registry ? process.cwd() : cwd
  );
  const index = await readRegistryJson(registry, "index.json");

  for (const item of index.items ?? []) {
    process.stdout.write(`${item.name.padEnd(22)} ${item.title}\n`);
  }
}

function parseOptions(rawArgs) {
  const positionals = [];
  const flags = {};

  for (let index = 0; index < rawArgs.length; index += 1) {
    const value = rawArgs[index];
    if (!value.startsWith("--")) {
      positionals.push(value);
      continue;
    }

    const [rawName, inlineValue] = value.slice(2).split("=", 2);
    if (inlineValue !== undefined) {
      flags[rawName] = inlineValue;
      continue;
    }

    const next = rawArgs[index + 1];
    if (next && !next.startsWith("--")) {
      flags[rawName] = next;
      index += 1;
    } else {
      flags[rawName] = true;
    }
  }

  return { positionals, flags };
}

async function readProjectConfig(cwd) {
  const configPath = resolve(cwd, "formfield.json");
  if (!existsSync(configPath)) return {};
  return JSON.parse(await readFile(configPath, "utf8"));
}

async function readRegistryJson(registry, filename) {
  if (/^https?:\/\//.test(registry)) {
    const response = await fetch(`${registry.replace(/\/$/, "")}/${filename}`);
    if (!response.ok) fail(`Registry request failed: ${response.status} ${response.url}`);
    return response.json();
  }

  const basePath = registry.startsWith("file:")
    ? new URL(registry)
    : pathToFileURL(resolve(registry));
  const fileUrl = new URL(`${basePath.href.replace(/\/$/, "")}/${filename}`);
  return JSON.parse(await readFile(fileUrl, "utf8"));
}

function resolveRegistrySource(registry, baseDirectory) {
  if (/^https?:\/\//.test(registry) || registry.startsWith("file:") || isAbsolute(registry)) {
    return registry;
  }
  return resolve(baseDirectory, registry);
}

function adaptAlias(content, alias) {
  const normalizedAlias = alias.endsWith("/") ? alias : `${alias}/`;
  return content.replaceAll("@/", normalizedAlias);
}

function installDependencies(cwd, dependencies, dev) {
  if (dependencies.length === 0) return;
  const manager = detectPackageManager(cwd);
  const installArgs = manager === "npm"
    ? ["install", ...(dev ? ["--save-dev"] : []), ...dependencies]
    : ["add", ...(dev ? ["-D"] : []), ...dependencies];
  process.stdout.write(`\n${manager} ${installArgs.join(" ")}\n`);
  const result = spawnSync(manager, installArgs, { cwd, stdio: "inherit" });
  if (result.status !== 0) fail(`Dependency installation failed with ${manager}.`);
}

function detectPackageManager(cwd) {
  const candidates = [
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
    ["bun.lockb", "bun"],
    ["bun.lock", "bun"],
    ["package-lock.json", "npm"]
  ];
  return candidates.find(([lockfile]) => existsSync(resolve(cwd, lockfile)))?.[1] ?? "npm";
}

function assertInside(root, destination) {
  const pathFromRoot = relative(root, destination);
  if (pathFromRoot.startsWith("..") || isAbsolute(pathFromRoot)) {
    fail(`Registry target escapes source root: ${destination}`);
  }
}

function unique(values) {
  return [...new Set(values)];
}

function fail(message) {
  process.stderr.write(`formfield: ${message}\n`);
  process.exit(1);
}

function printHelp() {
  process.stdout.write(`FORMFIELD LAB CLI

Usage:
  formfield list [--registry <url-or-path>]
  formfield add <component> [options]

Options:
  --cwd <path>          Target project directory
  --registry <source>   Registry URL or local directory
  --overwrite           Replace existing files
  --skip-install        Do not install npm dependencies
  --dry-run             Print planned writes only
`);
}
