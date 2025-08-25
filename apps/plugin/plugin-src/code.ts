import { htmlMain, postSettingsChanged, run } from "backend";
import { nodesToJSON } from "backend/src/altNodes/jsonNodeConversion";
import { htmlCodeGenTextStyles } from "backend/src/html/htmlMain";
import { PluginSettings, SettingWillChangeMessage } from "types";

let userPluginSettings: PluginSettings;

// 默认插件设置
export const defaultPluginSettings: PluginSettings = {
  framework: "HTML",
  showLayerNames: false,
  useOldPluginVersion2025: false,
  responsiveRoot: false,
  useColorVariables: true,
  embedImages: true,
  embedVectors: true,
  htmlGenerationMode: "html",
};

// 类型守卫，确保key属于PluginSettings类型
function isKeyOfPluginSettings(key: string): key is keyof PluginSettings {
  return key in defaultPluginSettings;
}

// 获取用户设置
const getUserSettings = async () => {
  console.log("[调试] 开始获取用户设置");
  const possiblePluginSrcSettings =
    (await figma.clientStorage.getAsync("userPluginSettings")) ?? {};
  console.log(
    "[调试] 从存储中获取的原始设置:",
    possiblePluginSrcSettings,
  );

  // 合并默认设置和用户设置
  const updatedPluginSrcSettings = {
    ...defaultPluginSettings,
    ...Object.keys(defaultPluginSettings).reduce((validSettings, key) => {
      if (
        isKeyOfPluginSettings(key) &&
        key in possiblePluginSrcSettings &&
        typeof possiblePluginSrcSettings[key] ===
        typeof defaultPluginSettings[key]
      ) {
        validSettings[key] = possiblePluginSrcSettings[key] as any;
      }
      return validSettings;
    }, {} as Partial<PluginSettings>),
  };

  userPluginSettings = updatedPluginSrcSettings as PluginSettings;
  console.log("[调试] 最终用户设置:", userPluginSettings);
  return userPluginSettings;
};

// 初始化设置
const initSettings = async () => {
  console.log("[调试] 正在初始化插件设置");
  await getUserSettings();
  postSettingsChanged(userPluginSettings);
  console.log("[调试] 使用设置调用safeRun");
  safeRun(userPluginSettings);
};

// 防止重复执行的标志
let isLoading = false;

// 安全运行函数
const safeRun = async (settings: PluginSettings) => {
  console.log(
    "[调试] safeRun调用 - isLoading = ",
    isLoading,
    "当前选择 = ",
    figma.currentPage.selection,
  );
  if (!isLoading) {
    try {
      isLoading = true;
      console.log("[调试] 开始执行run, isLoading = " + isLoading);

      // 移除选择变化事件监听器
      figma.off("selectionchange", () => {
        console.log("[调试] 检测到selectionchange事件，已忽略");
      });

      await run(settings);
      console.log("[调试] run执行完成");

      // 延迟重置isLoading，确保在下一帧执行
      setTimeout(() => {
        console.log("[调试] 重置isLoading为false");
        isLoading = false;
      }, 1);
    } catch (e) {
      console.log("[调试] 执行过程中捕获错误");
      isLoading = false; // 确保出错时重置标志
      if (e && typeof e === "object" && "message" in e) {
        const error = e as Error;
        console.log("错误详情: ", error.stack);
        figma.ui.postMessage({ type: "error", error: error.message });
      } else {
        // 处理非标准错误或未知错误类型
        const errorMessage = String(e);
        console.log("未知错误: ", errorMessage);
        figma.ui.postMessage({
          type: "error",
          error: errorMessage || "发生未知错误",
        });
      }

      // 发送消息重置UI状态
      figma.ui.postMessage({ type: "conversion-complete", success: false });
    }
  } else {
    console.log(
      "[调试] 跳过执行，因为isLoading = ",
      isLoading,
    );
  }
};

// 标准模式
const standardMode = async () => {
  console.log("[调试] 正在初始化标准模式");
  figma.showUI(__html__, { width: 450, height: 700, themeColors: true });
  await initSettings();

  // 监听选择变化事件
  figma.on("selectionchange", () => {
    console.log(
      "[调试] selectionchange事件 - 新选择:",
      figma.currentPage.selection,
    );
    safeRun(userPluginSettings);
  });

  // 加载所有页面并监听文档变化
  figma.loadAllPagesAsync();
  figma.on("documentchange", () => {
    console.log("[调试] 触发documentchange事件");
    // 注意：当尝试从包含子元素的组导出背景图像时，这会导致无限加载。
    // 原因是代码会临时隐藏组的子元素以导出干净的图像，然后恢复子元素的可见性。
    // 这构成了文档更改，因此会重新开始整个转换过程。
    // 为了避免这种情况，在进行转换时禁用safeRun（当isLoading === true时）。
    safeRun(userPluginSettings);
  });

  // 处理UI消息
  figma.ui.onmessage = async (msg) => {
    console.log("[调试] 收到UI消息", msg);

    if (msg.type === "pluginSettingWillChange") {
      const { key, value } = msg as SettingWillChangeMessage<unknown>;
      console.log(`[调试] 设置变更: ${key} = ${value}`);
      (userPluginSettings as any)[key] = value;
      figma.clientStorage.setAsync("userPluginSettings", userPluginSettings);
      safeRun(userPluginSettings);
    } else if (msg.type === "get-selection-json") {
      console.log("[调试] 收到get-selection-json消息");

      const nodes = figma.currentPage.selection;
      if (nodes.length === 0) {
        figma.ui.postMessage({
          type: "selection-json",
          data: { message: "未选择任何节点" },
        });
        return;
      }

      const result: {
        json?: SceneNode[];
        oldConversion?: any;
        newConversion?: any;
      } = {};

      try {
        // 导出JSON格式
        result.json = (await Promise.all(
          nodes.map(
            async (node) =>
              (
                (await node.exportAsync({
                  format: "JSON_REST_V1",
                })) as any
              ).document,
          ),
        )) as SceneNode[];
      } catch (error) {
        console.error("导出JSON时出错:", error);
      }

      try {
        // 转换为新格式
        const newNodes = await nodesToJSON(nodes, userPluginSettings);
        const removeParent = (node: any) => {
          if (node.parent) {
            delete node.parent;
          }
          if (node.children) {
            node.children.forEach(removeParent);
          }
        };
        newNodes.forEach(removeParent);
        result.newConversion = newNodes;
      } catch (error) {
        console.error("新格式转换出错:", error);
      }

      const nodeJson = result;

      console.log("[调试] 导出的节点JSON:", nodeJson);

      // 将JSON数据发送回UI
      figma.ui.postMessage({
        type: "selection-json",
        data: nodeJson,
      });
    }
  };
};

// 代码生成模式
const codegenMode = async () => {
  console.log("[调试] 正在初始化代码生成模式");
  await getUserSettings();

  // 监听代码生成事件
  figma.codegen.on(
    "generate",
    async ({ language, node }: CodegenEvent): Promise<CodegenResult[]> => {
      console.log(
        `[调试] codegen.generate - 语言: ${language}, 节点:`,
        node,
      );

      const convertedSelection = await nodesToJSON([node], userPluginSettings);
      console.log(
        "[调试] codegen.generate - 转换后的选择:",
        convertedSelection,
      );
      return [
        {
          title: "代码",
          code: (
            await htmlMain(
              // @ts-ignore
              convertedSelection,
              { ...userPluginSettings, htmlGenerationMode: "html" },
              true,
            )
          ).html,
          language: "HTML",
        },
        {
          title: "文本样式",
          code: htmlCodeGenTextStyles(),
          language: "HTML",
        },
      ];
    },
  );
};

// 根据Figma模式启动插件
switch (figma.mode) {
  case "default":
  case "inspect":
    console.log("[调试] 以", figma.mode, "模式启动插件");
    standardMode();
    break;
  case "codegen":
    console.log("[调试] 以代码生成模式启动插件");
    codegenMode();
    break;
  default:
    console.log("[调试] 未知插件模式:", figma.mode);
    break;
}
