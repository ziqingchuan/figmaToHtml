import { CornerRadius } from "types";

/**
 * 获取节点的圆角半径设置
 * @param node 场景节点
 * @returns 返回标准化后的圆角半径对象
 *
 * 返回值格式说明：
 * 1. 如果四个角半径相同 → { all: 值 }
 * 2. 如果四个角半径不同 → { topLeft, topRight, bottomRight, bottomLeft }
 * 3. 如果没有圆角设置 → { all: 0 }
 */
export const getCommonRadius = (node: SceneNode): CornerRadius => {
  // console.log('[圆角处理] 开始获取节点圆角设置');

  // 处理具有独立四角半径的节点（如复杂形状）
  if ("rectangleCornerRadii" in node) {
    // console.log('[圆角处理] 节点具有独立四角半径属性');
    const [topLeft, topRight, bottomRight, bottomLeft] =
      node.rectangleCornerRadii as any;

    // 检查四个角是否相同
    if (topLeft === topRight && topLeft === bottomRight && topLeft === bottomLeft) {
      // console.log(`[圆角处理] 四角半径相同，返回统一值: ${topLeft}`);
      return { all: topLeft };
    }

    // console.log('[圆角处理] 四角半径不同，返回独立值:', {
    //   topLeft, topRight, bottomRight, bottomLeft
    // });
    return {
      topLeft,
      topRight,
      bottomRight,
      bottomLeft,
    };
  }

  // 处理具有统一圆角半径的节点
  if ("cornerRadius" in node && node.cornerRadius !== figma.mixed && node.cornerRadius) {
    // console.log(`[圆角处理] 节点具有统一圆角半径: ${node.cornerRadius}`);
    return { all: node.cornerRadius };
  }

  // 处理具有独立四角半径的旧版节点
  if ("topLeftRadius" in node) {
    // console.log('[圆角处理] 节点具有旧版独立半径属性');

    // 检查四个角是否相同
    if (
      node.topLeftRadius === node.topRightRadius &&
      node.topLeftRadius === node.bottomRightRadius &&
      node.topLeftRadius === node.bottomLeftRadius
    ) {
      // console.log(`[圆角处理] 四角半径相同，返回统一值: ${node.topLeftRadius}`);
      return { all: node.topLeftRadius };
    }

    // console.log('[圆角处理] 四角半径不同，返回独立值:', {
    //   topLeft: node.topLeftRadius,
    //   topRight: node.topRightRadius,
    //   bottomRight: node.bottomRightRadius,
    //   bottomLeft: node.bottomLeftRadius
    // });
    return {
      topLeft: node.topLeftRadius,
      topRight: node.topRightRadius,
      bottomRight: node.bottomRightRadius,
      bottomLeft: node.bottomLeftRadius,
    };
  }

  // console.log('[圆角处理] 节点没有圆角设置，返回默认值0');
  return { all: 0 };
};
