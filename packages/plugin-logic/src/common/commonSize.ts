import { Size } from "types";

/**
 * 获取节点的尺寸信息
 * @param node 场景节点
 * @returns 返回标准化后的尺寸对象
 *
 * 返回值格式说明：
 * 1. 对于自动布局节点：
 *    - 水平填充 → width: "fill"
 *    - 水平自适应 → width: null
 *    - 固定宽度 → width: 数值
 *    - 垂直方向同理
 * 2. 对于普通节点 → 直接返回width/height数值
 */
export const nodeSize = (node: SceneNode): Size => {
  // console.log('[尺寸计算] 开始获取节点尺寸');

  // 检查是否为自动布局节点
  if ("layoutSizingHorizontal" in node && "layoutSizingVertical" in node) {
    // console.log('[尺寸计算] 节点为自动布局类型');

    // 处理水平尺寸
    const width =
      node.layoutSizingHorizontal === "FILL"
        ? "fill"
        : node.layoutSizingHorizontal === "HUG"
          ? null
          : node.width;

    // 处理垂直尺寸
    const height =
      node.layoutSizingVertical === "FILL"
        ? "fill"
        : node.layoutSizingVertical === "HUG"
          ? null
          : node.height;

    // console.log(`[尺寸计算] 计算后尺寸: width=${width}, height=${height}`);
    return { width, height };
  }

  // 普通节点直接返回尺寸
  // console.log(`[尺寸计算] 普通节点尺寸: width=${node.width}, height=${node.height}`);
  return { width: node.width, height: node.height };
};
