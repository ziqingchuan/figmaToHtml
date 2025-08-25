/**
 * 计算两种颜色之间的对比度比率（基于WCAG标准）
 * @param color1 第一种RGB颜色
 * @param color2 第二种RGB颜色
 * @returns 返回对比度比率（范围通常在1-21之间）
 */
export const calculateContrastRatio = (color1: RGB, color2: RGB): number => {
  // 计算两种颜色的相对亮度
  const color1luminance = luminance(color1);
  const color2luminance = luminance(color2);

  // 根据WCAG标准计算对比度比率
  const contrast =
    color1luminance > color2luminance
      ? (color2luminance + 0.05) / (color1luminance + 0.05) // 颜色1更亮时的计算
      : (color1luminance + 0.05) / (color2luminance + 0.05); // 颜色2更亮时的计算

  // 返回对比度比率（取倒数）
  return 1 / contrast;
};

/**
 * 计算颜色的相对亮度（基于WCAG标准公式）
 * @param color RGB颜色对象
 * @returns 返回颜色的相对亮度值（0-1之间）
 */
function luminance(color: RGB) {
  // 将RGB分量从0-1范围转换到0-255范围
  const components = [color.r * 255, color.g * 255, color.b * 255].map((v) => {
    // 归一化到0-1范围
    v /= 255;
    // 根据WCAG标准应用不同的转换公式
    return v <= 0.03928
      ? v / 12.92 // 低亮度值的线性转换
      : ((v + 0.055) / 1.055) ** 2.4; // 高亮度值的伽马校正
  });

  // 应用亮度权重系数（基于人眼对不同颜色的敏感度）
  return (
    components[0] * 0.2126 + // 红色分量权重
    components[1] * 0.7152 + // 绿色分量权重（人眼最敏感）
    components[2] * 0.0722    // 蓝色分量权重
  );
}

/**
 * 深度扁平化场景节点树（递归展开所有子节点）
 * @param arr 场景节点数组
 * @returns 返回扁平化后的节点数组（保持原始顺序）
 */
export const deepFlatten = (arr: Array<SceneNode>): Array<SceneNode> => {
  let result: Array<SceneNode> = [];

  arr.forEach((node) => {
    if ("children" in node) {
      // 如果是父节点，先添加自身
      result.push(node);
      // 递归处理子节点并合并结果
      result = Object.assign(result, deepFlatten([...node.children]));
    } else {
      // 如果是叶子节点，直接添加
      result.push(node);
    }
  });

  return result;
};
