export const FORMFIELD_BRAND = {
  name: "形场实验室",
  englishName: "FORMFIELD LAB",
  descriptor: "生成式视觉组件实验室",
  cliPackage: "@yuanyang749/formfield-cli",
  registryName: "FormField Registry"
} as const;

export function createInstallCommand(componentName: string): string {
  return `npx ${FORMFIELD_BRAND.cliPackage}@latest add ${componentName}`;
}
