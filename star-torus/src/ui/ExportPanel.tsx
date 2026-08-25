import { useMemo, useState } from "react";
import type { StarFieldConfig } from "@/domain/star-field";
import {
  generateComponentInstallCommand,
  generateConfigJson,
  generateReactComponent,
  generateRegistryJson,
  normalizeComponentName,
  normalizeRegistryName
} from "@/export/generateComponent";

interface ExportPanelProps {
  config: StarFieldConfig;
}

export function ExportPanel({ config }: ExportPanelProps) {
  const [requestedName, setRequestedName] = useState("MyFormField");
  const [notice, setNotice] = useState("参数变化会实时写入导出组件");
  const componentName = useMemo(() => normalizeComponentName(requestedName), [requestedName]);
  const registryName = useMemo(() => normalizeRegistryName(requestedName), [requestedName]);
  const componentSource = useMemo(
    () => generateReactComponent(config, componentName),
    [componentName, config]
  );
  const registrySource = useMemo(
    () => generateRegistryJson(config, componentName),
    [componentName, config]
  );
  const installCommand = useMemo(
    () => generateComponentInstallCommand(componentName),
    [componentName]
  );

  const copyComponent = async () => {
    await copyText(componentSource);
    setNotice(`已复制 ${componentName}.tsx`);
  };

  const copyConfig = async () => {
    await copyText(generateConfigJson(config));
    setNotice("已复制可序列化配置 JSON");
  };

  const copyRegistry = async () => {
    await copyText(registrySource);
    setNotice(`已复制 ${registryName}.json Registry 清单`);
  };

  const copyInstallCommand = async () => {
    await copyText(installCommand);
    setNotice("已复制 CLI 安装命令");
  };

  const downloadComponent = () => {
    const blob = new Blob([componentSource], { type: "text/typescript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${componentName}.tsx`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice(`已生成 ${componentName}.tsx`);
  };

  return (
    <div className="export-panel">
      <label className="component-name">
        <span>组件名称</span>
        <input
          value={requestedName}
          spellCheck={false}
          aria-label="导出组件名称"
          onChange={(event) => setRequestedName(event.target.value)}
        />
        <code>.tsx</code>
      </label>
      <div className="registry-identity">
        <span>REGISTRY ID</span>
        <code>{registryName}</code>
      </div>
      <div className="export-actions">
        <button type="button" onClick={copyComponent}>复制 TSX</button>
        <button type="button" className="is-primary" onClick={downloadComponent}>下载组件</button>
        <button type="button" onClick={copyConfig}>复制配置</button>
        <button type="button" onClick={copyRegistry}>复制 Registry</button>
      </div>
      <button className="install-command" type="button" onClick={copyInstallCommand}>
        <span>CLI</span>
        <code>{installCommand}</code>
        <strong>复制</strong>
      </button>
      <p className="export-notice" aria-live="polite">
        <span aria-hidden="true"></span>{notice}
      </p>
    </div>
  );
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the DOM copy path when clipboard permission is denied.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}
