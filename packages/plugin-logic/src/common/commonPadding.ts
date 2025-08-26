import { PaddingType } from "types";

/**
 * 提取节点的通用内边距设置
 * @param node 自动布局节点（需包含布局属性）
 * @returns 返回标准化后的内边距对象，如果不是自动布局节点则返回null
 *
 * 返回格式说明：
 * 1. 如果四边内边距相同 → { all: 值 }
 * 2. 如果左右/上下内边距相同 → { horizontal: 左右值, vertical: 上下值 }
 * 3. 如果四边都不相同 → { left: 左, right: 右, top: 上, bottom: 下 }
 */
export const commonPadding = (
  node: InferredAutoLayoutResult,
): PaddingType | null => {
  // 检查是否为自动布局节点
  if ("layoutMode" in node && node.layoutMode !== "NONE") {
    // console.log("[布局处理] 开始提取内边距设置");

    // 格式化内边距值（保留2位小数）
    const paddingLeft = parseFloat((node.paddingLeft ?? 0).toFixed(2));
    const paddingRight = parseFloat((node.paddingRight ?? 0).toFixed(2));
    const paddingTop = parseFloat((node.paddingTop ?? 0).toFixed(2));
    const paddingBottom = parseFloat((node.paddingBottom ?? 0).toFixed(2));

    // console.log(`[布局处理] 提取的内边距值: 左=${paddingLeft}, 右=${paddingRight}, 上=${paddingTop}, 下=${paddingBottom}`);

    // 判断内边距模式并返回对应格式
    if (
      paddingLeft === paddingRight &&
      paddingLeft === paddingBottom &&
      paddingTop === paddingBottom
    ) {
      // console.log("[布局处理] 四边内边距相同，返回all格式");
      return { all: paddingLeft };
    } else if (paddingLeft === paddingRight && paddingTop === paddingBottom) {
      // console.log("[布局处理] 左右/上下内边距相同，返回horizontal/vertical格式");
      return {
        horizontal: paddingLeft,
        vertical: paddingTop,
      };
    } else {
      // console.log("[布局处理] 四边内边距不同，返回完整格式");
      return {
        left: paddingLeft,
        right: paddingRight,
        top: paddingTop,
        bottom: paddingBottom,
      };
    }
  }

  // console.log("[布局处理] 非自动布局节点，返回null");
  return null;
};
