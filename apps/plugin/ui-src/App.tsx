import { useEffect, useState } from "react";
import { PluginUI } from "plugin-ui";
import {
  Framework,
  PluginSettings,
  ConversionMessage,
  Message,
  HTMLPreview,
  LinearGradientConversion,
  SolidColorConversion,
  ErrorMessage,
  SettingsChangedMessage,
  Warning,
} from "types";
import copy from "copy-to-clipboard";

/**
 * 应用状态接口定义
 */
interface AppState {
  code: string;                   // 生成的代码
  selectedFramework: Framework;   // 当前选中的框架
  isLoading: boolean;            // 是否正在加载
  htmlPreview: HTMLPreview;      // HTML预览内容
  settings: PluginSettings | null; // 插件设置
  colors: SolidColorConversion[]; // 颜色数据
  gradients: LinearGradientConversion[]; // 渐变数据
  warnings: Warning[];            // 警告信息
}

// 空预览对象
const emptyPreview = { size: { width: 0, height: 0 }, content: "" };

/**
 * 主应用组件
 */
export default function App() {
  // 初始化应用状态
  const [state, setState] = useState<AppState>({
    code: "",
    selectedFramework: "HTML",
    isLoading: false,
    htmlPreview: emptyPreview,
    settings: null,
    colors: [],
    gradients: [],
    warnings: [],
  });

  // 获取Figma主题色
  const rootStyles = getComputedStyle(document.documentElement);
  const figmaColorBgValue = rootStyles
    .getPropertyValue("--figma-color-bg")
    .trim();

  /**
   * 处理来自Figma的消息
   */
  useEffect(() => {
    window.onmessage = (event: MessageEvent) => {
      const untypedMessage = event.data.pluginMessage as Message;
      // console.log("[界面] 收到消息:", untypedMessage);

      switch (untypedMessage.type) {
        case "conversionStart":  // 转换开始
          setState((prevState) => ({
            ...prevState,
            code: "",
            isLoading: true,
          }));
          break;

        case "code":  // 代码生成完成
          const conversionMessage = untypedMessage as ConversionMessage;
          setState((prevState) => ({
            ...prevState,
            ...conversionMessage,
            selectedFramework: conversionMessage.settings.framework,
            isLoading: false,
          }));
          break;

        case "pluginSettingChanged":  // 设置变更
          const settingsMessage = untypedMessage as SettingsChangedMessage;
          setState((prevState) => ({
            ...prevState,
            settings: settingsMessage.settings,
            selectedFramework: settingsMessage.settings.framework,
          }));
          break;

        case "empty":  // 空选择状态
          setState((prevState) => ({
            ...prevState,
            code: "",
            htmlPreview: emptyPreview,
            warnings: [],
            colors: [],
            gradients: [],
            isLoading: false,
          }));
          break;

        case "error":  // 错误处理
          const errorMessage = untypedMessage as ErrorMessage;
          setState((prevState) => ({
            ...prevState,
            colors: [],
            gradients: [],
            code: `错误 :(\n// ${errorMessage.error}`,
            isLoading: false,
          }));
          break;

        case "selection-json":  // 选择节点JSON数据
          const json = event.data.pluginMessage.data;
          // 复制到剪贴板
          copy(JSON.stringify(json, null, 2));
          break;

        default:
          break;
      }
    };

    // 组件卸载时清理
    return () => {
      window.onmessage = null;
    };
  }, []);

  // 判断是否为暗黑模式
  const darkMode = figmaColorBgValue !== "#ffffff";

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <PluginUI
        isLoading={state.isLoading}
        code={state.code}
        htmlPreview={state.htmlPreview}
      />
    </div>
  );
}
