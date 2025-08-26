import { commonPadding } from "../../common/commonPadding";
import { format } from "../../common/utils/formatTool";

/**
 * 生成节点的内边距CSS样式
 * @param node 自动布局节点
 * @returns 返回内边距样式字符串数组
 *
 * 处理逻辑：
 * 1. 统一内边距 → 生成单个padding属性
 * 2. 水平/垂直内边距 → 分别生成对应样式
 * 3. 独立四边内边距 → 为每边生成独立样式
 * 4. 零值内边距 → 跳过生成
 */
export const htmlPadding = (node: InferredAutoLayoutResult): string[] => {
  // console.log('[内边距处理] 开始处理节点内边距');

  // 获取标准化内边距值
  const padding = commonPadding(node);

  if (padding === null) {
    // console.log('[内边距处理] 节点无内边距设置');
    return [];
  }

  // 处理统一内边距的情况
  if ("all" in padding) {
    if (padding.all !== 0) {
      // console.log(`[内边距处理] 统一内边距: ${padding.all}`);
      return [format("padding", padding.all)];
    }
    // console.log('[内边距处理] 统一内边距为0，跳过生成');
    return [];
  }

  let comp: string[] = [];

  // 处理水平+垂直内边距的情况
  if ("horizontal" in padding) {
    // console.log('[内边距处理] 处理水平/垂直内边距');

    if (padding.horizontal !== 0) {
      // console.log(`[内边距处理] 水平内边距: ${padding.horizontal}`);
      comp.push(
        format("padding-left", padding.horizontal),
        format("padding-right", padding.horizontal)
      );
    } else {
      // console.log('[内边距处理] 水平内边距为0，跳过生成');
    }

    if (padding.vertical !== 0) {
      // console.log(`[内边距处理] 垂直内边距: ${padding.vertical}`);
      comp.push(
        format("padding-top", padding.vertical),
        format("padding-bottom", padding.vertical)
      );
    } else {
      // console.log('[内边距处理] 垂直内边距为0，跳过生成');
    }

    return comp;
  }

  // 处理独立四边内边距的情况
  // console.log('[内边距处理] 处理独立四边内边距');

  if (padding.top !== 0) {
    // console.log(`[内边距处理] 上内边距: ${padding.top}`);
    comp.push(format("padding-top", padding.top));
  }
  if (padding.bottom !== 0) {
    // console.log(`[内边距处理] 下内边距: ${padding.bottom}`);
    comp.push(format("padding-bottom", padding.bottom));
  }
  if (padding.left !== 0) {
    // console.log(`[内边距处理] 左内边距: ${padding.left}`);
    comp.push(format("padding-left", padding.left));
  }
  if (padding.right !== 0) {
    // console.log(`[内边距处理] 右内边距: ${padding.right}`);
    comp.push(format("padding-right", padding.right));
  }

  // console.log(`[内边距处理] 最终生成的内边距样式:`, comp);
  return comp;
};
