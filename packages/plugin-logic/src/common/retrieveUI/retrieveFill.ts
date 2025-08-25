import { Paint } from "../../api_types";

/**
 * 获取图层使用的第一个可见颜色（当存在多个颜色时）
 * @param fills 图层填充属性数组
 * @returns 返回第一个可见的填充属性，如果没有则返回undefined
 */
export const retrieveTopFill = (
  fills: ReadonlyArray<Paint> | undefined,
): Paint | undefined => {
  // 检查填充数组是否存在且非空
  if (fills && Array.isArray(fills) && fills.length > 0) {
    // 在Figma中，最顶层的填充总是位于数组最后位置
    // 先反转数组，然后查找第一个可见的填充层
    return [...fills].reverse().find((d) => d.visible !== false);
  }

  // 如果没有填充或数组为空，返回undefined
  return undefined;
};
