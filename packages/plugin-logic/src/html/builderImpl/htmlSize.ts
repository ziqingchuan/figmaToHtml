import { nodeSize } from "../../common/commonSize";
import { format } from "../../common/utils/formatTool";
import { isPreviewGlobal } from "../htmlMain";

/**
 * 生成节点尺寸相关的CSS样式
 * @param node 场景节点
 * @returns 返回包含宽度、高度和约束条件的对象
 *
 * 返回值结构：
 * {
 *   width: 宽度样式字符串,
 *   height: 高度样式字符串,
 *   constraints: 约束条件数组
 * }
 */
export const htmlSizePartial = (
  node: SceneNode,
): { width: string; height: string; constraints: string[] } => {
  // console.log('[尺寸处理] 开始处理节点尺寸');

  // 处理预览模式且无父节点的情况
  if (isPreviewGlobal && node.parent === undefined) {
    // console.log('[尺寸处理] 预览模式无父节点，使用100%宽高');
    return {
      width: format("width", "100%"),
      height: format("height", "100%"),
      constraints: [],
    };
  }

  // 获取节点标准化尺寸
  const size = nodeSize(node);
  const nodeParent = node.parent;
  // console.log('[尺寸处理] 获取到的节点尺寸:', size);

  // 处理宽度
  let w = "";
  if (typeof size.width === "number") {
    // console.log(`[尺寸处理] 固定宽度: ${size.width}`);
    w = format("width", size.width);
  } else if (size.width === "fill") {
    // console.log('[尺寸处理] 填充宽度处理');
    if (
      nodeParent &&
      "layoutMode" in nodeParent &&
      nodeParent.layoutMode === "HORIZONTAL"
    ) {
      // console.log('[尺寸处理] 水平布局父节点，使用flex填充');
      w = format("flex", "1 1 0");
    } else {
      if (node.maxWidth) {
        // console.log('[尺寸处理] 有最大宽度限制，使用100%宽度');
        w = format("width", "100%");
      } else {
        // console.log('[尺寸处理] 无最大宽度限制，使用拉伸对齐');
        w = format("align-self", "stretch");
      }
    }
  }

  // 处理高度
  let h = "";
  if (typeof size.height === "number") {
    // console.log(`[尺寸处理] 固定高度: ${size.height}`);
    h = format("height", size.height);
  } else if (typeof size.height === "string") {
    // console.log('[尺寸处理] 填充高度处理');
    if (
      nodeParent &&
      "layoutMode" in nodeParent &&
      nodeParent.layoutMode === "VERTICAL"
    ) {
      // console.log('[尺寸处理] 垂直布局父节点，使用flex填充');
      h = format("flex", "1 1 0");
    } else {
      if (node.maxHeight) {
        // console.log('[尺寸处理] 有最大高度限制，使用100%高度');
        h = format("height", "100%");
      } else {
        // console.log('[尺寸处理] 无最大高度限制，使用拉伸对齐');
        h = format("align-self", "stretch");
      }
    }
  }

  // 处理最小/最大尺寸约束
  const constraints = [];
  // console.log('[尺寸处理] 开始处理尺寸约束');

  if (node.maxWidth !== undefined && node.maxWidth !== null) {
    // console.log(`[尺寸处理] 最大宽度约束: ${node.maxWidth}`);
    constraints.push(format("max-width", node.maxWidth));
  }

  if (node.minWidth !== undefined && node.minWidth !== null) {
    // console.log(`[尺寸处理] 最小宽度约束: ${node.minWidth}`);
    constraints.push(format("min-width", node.minWidth));
  }

  if (node.maxHeight !== undefined && node.maxHeight !== null) {
    // console.log(`[尺寸处理] 最大高度约束: ${node.maxHeight}`);
    constraints.push(format("max-height", node.maxHeight));
  }

  if (node.minHeight !== undefined && node.minHeight !== null) {
    // console.log(`[尺寸处理] 最小高度约束: ${node.minHeight}`);
    constraints.push(format("min-height", node.minHeight));
  }

  // console.log('[尺寸处理] 最终生成的尺寸样式:', {
  //   width: w,
  //   height: h,
  //   constraints: constraints
  // });

  return {
    width: w,
    height: h,
    constraints: constraints,
  };
};
