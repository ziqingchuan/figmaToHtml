import {
  ConversionMessage,
  ConversionStartMessage,
  EmptyMessage,
  PluginSettings,
  SettingsChangedMessage,
} from "types";

export const postBackendMessage = figma.ui.postMessage;

export const postEmptyMessage = () =>
  postBackendMessage({ type: "empty" } as EmptyMessage);

export const postConversionStart = () =>
  postBackendMessage({ type: "conversionStart" } as ConversionStartMessage);

export const postConversionComplete = (
  conversionData: ConversionMessage | Omit<ConversionMessage, "type">,
) => postBackendMessage({ ...conversionData, type: "code" });


export const postSettingsChanged = (settings: PluginSettings) =>
  postBackendMessage({
    type: "pluginSettingsChanged",
    settings,
  } as SettingsChangedMessage);
