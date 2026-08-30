import { useEffect, useMemo, useState } from "react";
import {
  INTERACTION_ACTION_IDS,
  resolveInteractionActions,
  type InteractionActionId,
  type StarFieldConfig,
  type StarInteractionActions
} from "@/domain/star-field";
import type { ExportCopy } from "@/i18n/messages";
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
  copy: ExportCopy;
}

export function ExportPanel({ config, copy }: ExportPanelProps) {
  const [requestedName, setRequestedName] = useState("MyFormField");
  const [notice, setNotice] = useState(copy.initialNotice);
  const [interactionActions, setInteractionActions] = useState<StarInteractionActions>(
    () => resolveInteractionActions(config.interaction)
  );
  const componentName = useMemo(() => normalizeComponentName(requestedName), [requestedName]);
  const registryName = useMemo(() => normalizeRegistryName(requestedName), [requestedName]);
  const exportConfig = useMemo<StarFieldConfig>(() => ({
    ...config,
    interaction: {
      ...config.interaction,
      enabled: INTERACTION_ACTION_IDS.some(
        (action) => action !== "hoverLight" && interactionActions[action]
      ),
      actions: interactionActions
    }
  }), [config, interactionActions]);
  const selectedInteractionCount = INTERACTION_ACTION_IDS.reduce(
    (count, action) => count + Number(interactionActions[action]),
    0
  );
  const componentSource = useMemo(
    () => generateReactComponent(exportConfig, componentName),
    [componentName, exportConfig]
  );
  const registrySource = useMemo(
    () => generateRegistryJson(exportConfig, componentName),
    [componentName, exportConfig]
  );
  const installCommand = useMemo(
    () => generateComponentInstallCommand(config.shape),
    [config.shape]
  );

  useEffect(() => {
    setNotice(copy.initialNotice);
  }, [copy]);

  const copyComponent = async () => {
    await copyText(componentSource);
    setNotice(copy.copiedComponent(componentName));
  };

  const copyConfig = async () => {
    await copyText(generateConfigJson(exportConfig));
    setNotice(copy.copiedConfig);
  };

  const copyRegistry = async () => {
    await copyText(registrySource);
    setNotice(copy.copiedRegistry(registryName));
  };

  const copyInstallCommand = async () => {
    await copyText(installCommand);
    setNotice(copy.copiedInstallCommand);
  };

  const downloadComponent = () => {
    const blob = new Blob([componentSource], { type: "text/typescript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${componentName}.tsx`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice(copy.generatedComponent(componentName));
  };

  const toggleInteractionAction = (action: InteractionActionId) => {
    setInteractionActions((current) => ({
      ...current,
      [action]: !current[action]
    }));
  };

  return (
    <div className="export-panel">
      <label className="component-name">
        <span>{copy.componentName}</span>
        <input
          value={requestedName}
          spellCheck={false}
          aria-label={copy.componentNameAria}
          onChange={(event) => setRequestedName(event.target.value)}
        />
        <code>.tsx</code>
      </label>
      <div className="registry-identity">
        <span>REGISTRY ID</span>
        <code>{registryName}</code>
      </div>
      <div className="export-interactions">
        <div className="export-interactions__header">
          <span>{copy.interactionTitle}</span>
          <strong>{copy.interactionCount(
            selectedInteractionCount,
            INTERACTION_ACTION_IDS.length
          )}</strong>
        </div>
        <div
          className="export-interactions__options"
          role="group"
          aria-label={copy.interactionGroupAria}
        >
          {INTERACTION_ACTION_IDS.map((action) => (
            <button
              key={action}
              className="export-interaction-option"
              type="button"
              aria-pressed={interactionActions[action]}
              onClick={() => toggleInteractionAction(action)}
            >
              <span className="export-interaction-option__signal" aria-hidden="true" />
              <span>{copy.interactionActions[action]}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="export-actions">
        <button type="button" onClick={copyComponent}>{copy.copyTsx}</button>
        <button type="button" className="is-primary" onClick={downloadComponent}>{copy.downloadComponent}</button>
        <button type="button" onClick={copyConfig}>{copy.copyConfig}</button>
        <button type="button" onClick={copyRegistry}>{copy.copyRegistry}</button>
      </div>
      <button className="install-command" type="button" onClick={copyInstallCommand}>
        <span>CLI</span>
        <code>{installCommand}</code>
        <strong>{copy.copy}</strong>
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
