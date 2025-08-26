import { BorderSide } from "types";

/**
 * 获取节点的边框样式
 * @param node 场景节点
 * @param divideBy 边框宽度除数（可选，默认为1）
 * @returns 返回标准化后的边框样式对象，若无边框则返回null
 *
 * 返回值格式说明：
 * 1. 四边边框宽度相同 → { all: 值 }
 * 2. 四边边框宽度不同 → { left, top, right, bottom }
 * 3. 无边框或边框宽度为0 → null
 */
export const commonStroke = (
  node: SceneNode,
  divideBy: number = 1,
): BorderSide | null => {
  // console.log('[边框处理] 开始处理节点边框样式');

  // 检查节点是否有边框设置
  if (!("strokes" in node) || !node.strokes || node.strokes.length === 0) {
    // console.log('[边框处理] 节点无边框设置');
    return null;
  }

  // 处理具有独立四边边框宽度的节点
  if ("strokeTopWeight" in node) {
    // console.log('[边框处理] 节点具有独立四边边框宽度属性');

    // 检查四边宽度是否相同
    if (
      node.strokeTopWeight === node.strokeBottomWeight &&
      node.strokeTopWeight === node.strokeLeftWeight &&
      node.strokeTopWeight === node.strokeRightWeight
    ) {
      const width = node.strokeTopWeight / divideBy;
      // console.log(`[边框处理] 四边边框宽度相同，返回统一值: ${width}`);
      return { all: width };
    }

    // console.log('[边框处理] 四边边框宽度不同，返回独立值');
    return {
      left: node.strokeLeftWeight / divideBy,
      top: node.strokeTopWeight / divideBy,
      right: node.strokeRightWeight / divideBy,
      bottom: node.strokeBottomWeight / divideBy,
    };
  }
  // 处理具有统一边框宽度的节点
  else if (node.strokeWeight !== figma.mixed && node.strokeWeight !== 0) {
    const width = node.strokeWeight / divideBy;
    // console.log(`[边框处理] 节点具有统一边框宽度: ${width}`);
    return { all: width };
  }

  // console.log('[边框处理] 节点无有效边框设置');
  return null;
};
