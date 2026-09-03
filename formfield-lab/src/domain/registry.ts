import type { ShapeId, StarFieldConfig } from "@/domain/star-field";

export const REGISTRY_SCHEMA = "https://formfield-lab.vercel.app/r/schema/registry-item.json";

export type RegistryItemType = "registry:visual" | "registry:runtime" | "registry:geometry";

export interface RegistrySourceFile {
  path: string;
  target: string;
  type: "registry:file" | "registry:component" | "registry:style";
  content?: string;
}

export interface FormFieldRegistryItem {
  $schema: typeof REGISTRY_SCHEMA;
  name: string;
  title: string;
  description: string;
  type: RegistryItemType;
  dependencies: string[];
  devDependencies: string[];
  registryDependencies: string[];
  files: RegistrySourceFile[];
  meta: {
    category: "field" | "geometry" | "effect";
    shape?: ShapeId;
    tags: string[];
  };
  config?: StarFieldConfig;
}

export interface FormFieldRegistryIndex {
  name: "formfield";
  homepage: string;
  items: Array<Pick<FormFieldRegistryItem, "name" | "title" | "description" | "type" | "meta">>;
}
