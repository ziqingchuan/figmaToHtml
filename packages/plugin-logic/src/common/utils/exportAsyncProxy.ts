import { postConversionStart } from "../../messaging";

// 运行状态标志，防止重复触发
let isRunning = false;

/**
 * exportAsync的代理函数
 * 主要作用是在执行耗时操作时通知UI显示加载状态
 * 避免在每次UI变化时都显示加载提示，只在真正执行exportAsync时显示
 *
 * @template T 返回类型，默认为Uint8Array，也可以是字符串
 * @param node 要导出的场景节点
 * @param settings 导出设置（支持SVG字符串或其他格式）
 * @returns 返回导出结果的Promise
 */
export const exportAsyncProxy = async <
  T extends string | Uint8Array = Uint8Array,
>(
  node: SceneNode,
  settings: ExportSettings | ExportSettingsSVGString,
): Promise<T> => {
  // 检查是否已经在运行，避免重复触发
  if (!isRunning) {
    isRunning = true;
    // 发送转换开始消息
    postConversionStart();
    // 确保消息发送完成（等待30ms）
    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  // 异步获取节点实例
  const figmaNode = (await figma.getNodeByIdAsync(node.id)) as ExportMixin;
  // console.log("[导出代理] 获取节点实例:", figmaNode);

  // 检查节点是否支持导出
  if (figmaNode.exportAsync === undefined) {
    console.error("[导出代理] 错误节点详情:", node);
    throw new TypeError(
      "导出失败：该节点不支持exportAsync()方法。调用前请检查节点类型。",
    );
  }

  let result;
  try {
    // 根据格式类型调用不同的导出方法
    if (settings.format === "SVG_STRING") {
      // console.log("[导出代理] 导出SVG字符串");
      result = await figmaNode.exportAsync(settings as ExportSettingsSVGString);
    } else {
      // console.log("[导出代理] 导出其他格式");
      result = await figmaNode.exportAsync(settings as ExportSettings);
    }
  } catch (error) {
    console.error("[导出代理] 导出过程中出错:", error);
    throw error;
  } finally {
    // 无论成功失败，都重置运行状态
    isRunning = false;
  }

  return result as T;
};
