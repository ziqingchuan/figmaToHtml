import { formatMultipleArray } from "../../common/utils/formatTool";

/**
 * 获取Flex布局方向
 * @param node 自动布局节点
 * @returns 返回flex-direction值（垂直布局返回"column"，水平布局返回空字符串）
 */
const getFlexDirection = (node: InferredAutoLayoutResult): string => {
  const direction = node.layoutMode === "HORIZONTAL" ? "" : "column";
  // console.log(`[自动布局] 布局方向: ${direction || '水平(默认)'}`);
  return direction;
};

/**
 * 获取主轴对齐方式
 * @param node 自动布局节点
 * @returns 返回justify-content值
 */
const getJustifyContent = (node: InferredAutoLayoutResult): string => {
  let alignment;
  switch (node.primaryAxisAlignItems) {
    case undefined:
    case "MIN":
      alignment = "flex-start";
      break;
    case "CENTER":
      alignment = "center";
      break;
    case "MAX":
      alignment = "flex-end";
      break;
    case "SPACE_BETWEEN":
      alignment = "space-between";
      break;
  }
  // console.log(`[自动布局] 主轴对齐方式: ${alignment}`);
  return alignment;
};

/**
 * 获取交叉轴对齐方式
 * @param node 自动布局节点
 * @returns 返回align-items值
 */
const getAlignItems = (node: InferredAutoLayoutResult): string => {
  let alignment;
  switch (node.counterAxisAlignItems) {
    case undefined:
    case "MIN":
      alignment = "flex-start";
      break;
    case "CENTER":
      alignment = "center";
      break;
    case "MAX":
      alignment = "flex-end";
      break;
    case "BASELINE":
      alignment = "baseline";
      break;
  }
  // console.log(`[自动布局] 交叉轴对齐方式: ${alignment}`);
  return alignment;
};

/**
 * 获取子元素间距
 * @param node 自动布局节点
 * @returns 返回gap值（当有间距且不是space-between布局时返回间距值，否则返回空字符串）
 */
const getGap = (node: InferredAutoLayoutResult): string | number => {
  const gap = node.itemSpacing > 0 && node.primaryAxisAlignItems !== "SPACE_BETWEEN"
    ? node.itemSpacing
    : "";
  // console.log(`[自动布局] 子元素间距: ${gap || '无'}`);
  return gap;
};

/**
 * 获取换行方式
 * @param node 自动布局节点
 * @returns 返回flex-wrap值（允许换行返回"wrap"，否则返回空字符串）
 */
const getFlexWrap = (node: InferredAutoLayoutResult): string => {
  const wrap = node.layoutWrap === "WRAP" ? "wrap" : "";
  // console.log(`[自动布局] 换行方式: ${wrap || '不换行'}`);
  return wrap;
};

/**
 * 获取多行对齐方式
 * @param node 自动布局节点
 * @returns 返回align-content值（仅在允许换行时有效）
 */
const getAlignContent = (node: InferredAutoLayoutResult): string => {
  if (node.layoutWrap !== "WRAP") {
    // console.log('[自动布局] 多行对齐: 不适用(单行布局)');
    return "";
  }

  let alignment;
  switch (node.counterAxisAlignItems) {
    case undefined:
    case "MIN":
      alignment = "flex-start";
      break;
    case "CENTER":
      alignment = "center";
      break;
    case "MAX":
      alignment = "flex-end";
      break;
    case "BASELINE":
      alignment = "baseline";
      break;
    default:
      alignment = "normal";
  }
  // console.log(`[自动布局] 多行对齐方式: ${alignment}`);
  return alignment;
};

/**
 * 获取display属性值
 * @param node 当前节点
 * @param autoLayout 自动布局配置
 * @returns 返回flex或inline-flex
 */
const getFlex = (
  node: SceneNode,
  autoLayout: InferredAutoLayoutResult,
): string => {
  const display = node.parent &&
  "layoutMode" in node.parent &&
  node.parent.layoutMode === autoLayout.layoutMode
    ? "flex"
    : "inline-flex";
  // console.log(`[自动布局] 显示类型: ${display}`);
  return display;
};

/**
 * 生成自动布局CSS属性数组
 * @param node 自动布局节点
 * @returns 返回格式化后的CSS属性数组
 */
export const htmlAutoLayoutProps = (node: SceneNode & InferredAutoLayoutResult): string[] => {
  // console.log('[自动布局] 开始生成CSS属性');
  const props = {
    "flex-direction": getFlexDirection(node),
    "justify-content": getJustifyContent(node),
    "align-items": getAlignItems(node),
    gap: getGap(node),
    display: getFlex(node, node),
    "flex-wrap": getFlexWrap(node),
    "align-content": getAlignContent(node),
  };

  // console.log('[自动布局] 生成的CSS属性:', props);
  return formatMultipleArray(props);
};
