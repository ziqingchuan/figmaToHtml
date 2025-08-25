import {
  retrieveGenericLinearGradients,
  retrieveGenericSolidUIColors,
} from "./common/retrieveUI/retrieveColors";
import {
  clearWarnings,
  warnings,
} from "./common/commonWarning";
import { postConversionComplete, postEmptyMessage } from "./messaging";
import { generateHTMLPreview } from "./html/htmlMain";
import { oldConvertNodesToAltNodes } from "./altNodes/oldAltConversion";
import {
  getNodeByIdAsyncCalls,
  getNodeByIdAsyncTime,
  getStyledTextSegmentsCalls,
  getStyledTextSegmentsTime,
  nodesToJSON,
  processColorVariablesCalls,
  processColorVariablesTime,
  resetPerformanceCounters,
} from "./altNodes/jsonNodeConversion";
import { PluginSettings } from "types";
import { htmlMain } from "./html/htmlMain";

/**
 * 将场景节点转换为代码
 * @param nodes 要转换的场景节点数组
 * @param settings 插件设置
 * @returns 返回生成的HTML代码
 */
export const convertToCode = async (
  nodes: SceneNode[],
  settings: PluginSettings,
) => {
  return (await htmlMain(nodes, settings)).html;
};

/**
 * 主运行函数，处理节点转换和代码生成全流程
 * @param settings 插件设置
 */
export const run = async (settings: PluginSettings) => {
  // 重置性能计数器
  resetPerformanceCounters();
  // 清空之前的警告信息
  clearWarnings();

  const { useOldPluginVersion2025 } = settings;
  const selection = figma.currentPage.selection;

  // 如果没有选中任何节点，发送空消息并返回
  if (selection.length === 0) {
    postEmptyMessage();
    return;
  }

  // 开始节点转换计时
  const nodeToJSONStart = Date.now();

  let convertedSelection: any;
  // 根据设置决定使用旧版还是新版转换逻辑
  if (useOldPluginVersion2025) {
    convertedSelection = oldConvertNodesToAltNodes(selection, null);
    console.log("[调试] 转换后的节点数据(旧版):", convertedSelection);
  } else {
    convertedSelection = await nodesToJSON(selection, settings);
    console.log(`[性能监控] 节点转换耗时: ${Date.now() - nodeToJSONStart}毫秒`);
    console.log("[调试] 节点JSON数据:", convertedSelection);
  }

  // 调试输出第一个节点的信息
  console.log("[调试] 转换后的节点详情:", { ...convertedSelection[0] });

  // 如果转换结果为空，发送空消息并返回
  if (convertedSelection.length === 0) {
    postEmptyMessage();
    return;
  }

  // 开始代码生成计时
  const convertToCodeStart = Date.now();
  const code = await convertToCode(convertedSelection, settings);
  console.log(
    `[性能监控] 代码生成耗时: ${Date.now() - convertToCodeStart}毫秒`,
  );

  // 开始HTML预览生成计时
  const generatePreviewStart = Date.now();
  const htmlPreview = await generateHTMLPreview(convertedSelection, settings);
  console.log(
    `[性能监控] HTML预览生成耗时: ${Date.now() - generatePreviewStart}毫秒`,
  );

  // 开始颜色面板处理计时
  const colorPanelStart = Date.now();
  const colors = await retrieveGenericSolidUIColors(); // 获取纯色
  const gradients = await retrieveGenericLinearGradients(); // 获取线性渐变
  console.log(
    `[性能监控] 颜色和渐变面板处理耗时: ${Date.now() - colorPanelStart}毫秒`,
  );
  console.log(
    `[性能监控] 总生成时间: ${Date.now() - nodeToJSONStart}毫秒`,
  );

  // 输出性能统计信息
  console.log(
    `[性能监控] getNodeByIdAsync调用统计: ${getNodeByIdAsyncTime}毫秒 (${getNodeByIdAsyncCalls}次调用, 平均: ${(getNodeByIdAsyncTime / getNodeByIdAsyncCalls || 1).toFixed(2)}毫秒/次)`,
  );
  console.log(
    `[性能监控] getStyledTextSegments调用统计: ${getStyledTextSegmentsTime}毫秒 (${getStyledTextSegmentsCalls}次调用, 平均: ${
      getStyledTextSegmentsCalls > 0
        ? (getStyledTextSegmentsTime / getStyledTextSegmentsCalls).toFixed(2)
        : 0
    }毫秒/次)`,
  );
  console.log(
    `[性能监控] processColorVariables调用统计: ${processColorVariablesTime}毫秒 (${processColorVariablesCalls}次调用, 平均: ${
      processColorVariablesCalls > 0
        ? (processColorVariablesTime / processColorVariablesCalls).toFixed(2)
        : 0
    }毫秒/次)`,
  );

  // 发送转换完成消息，包含所有生成结果
  postConversionComplete({
    code,          // 生成的代码
    htmlPreview,   // HTML预览
    colors,        // 颜色数据
    gradients,     // 渐变数据
    settings,      // 插件设置
    warnings: [...warnings], // 收集的警告信息
  });
};
