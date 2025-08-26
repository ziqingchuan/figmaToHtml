import { numberToFixedString } from "../../common/utils/numToAutoFixed";
import { format } from "../../common/utils/formatTool";
import { AltNode } from "../../node_types";

/**
 * 生成透明度CSS样式
 * @param node 具有混合属性的节点
 * @returns 返回opacity样式字符串（透明度不为1时返回样式，否则返回空字符串）
 */
export const htmlOpacity = (
  node: MinimalBlendMixin,
): string => {
  // 测试环境下node.opacity可能为undefined
  if (node.opacity !== undefined && node.opacity !== 1) {
    const opacityValue = numberToFixedString(node.opacity);
    // console.log(`[样式生成] 生成透明度样式: opacity=${opacityValue}`);
    return `opacity: ${opacityValue}`;
  }
  // console.log('[样式生成] 透明度为1或未定义，跳过生成');
  return "";
};

/**
 * 生成混合模式CSS样式
 * @param node 具有混合属性的节点
 * @returns 返回mix-blend-mode样式字符串（非NORMAL/PASS_THROUGH模式时返回样式）
 */
export const htmlBlendMode = (
  node: MinimalBlendMixin,
): string => {
  if (node.blendMode !== "NORMAL" && node.blendMode !== "PASS_THROUGH") {
    let blendMode = "";

    // 转换Figma混合模式为CSS混合模式
    switch (node.blendMode) {
      case "MULTIPLY":
        blendMode = "multiply"; break;
      case "SCREEN":
        blendMode = "screen"; break;
      case "OVERLAY":
        blendMode = "overlay"; break;
      case "DARKEN":
        blendMode = "darken"; break;
      case "LIGHTEN":
        blendMode = "lighten"; break;
      case "COLOR_DODGE":
        blendMode = "color-dodge"; break;
      case "COLOR_BURN":
        blendMode = "color-burn"; break;
      case "HARD_LIGHT":
        blendMode = "hard-light"; break;
      case "SOFT_LIGHT":
        blendMode = "soft-light"; break;
      case "DIFFERENCE":
        blendMode = "difference"; break;
      case "EXCLUSION":
        blendMode = "exclusion"; break;
      case "HUE":
        blendMode = "hue"; break;
      case "SATURATION":
        blendMode = "saturation"; break;
      case "COLOR":
        blendMode = "color"; break;
      case "LUMINOSITY":
        blendMode = "luminosity"; break;
    }

    if (blendMode) {
      // console.log(`[样式生成] 生成混合模式样式: mix-blend-mode=${blendMode}`);
      return format("mix-blend-mode", blendMode);
    }
  }
  // console.log('[样式生成] 无特殊混合模式，跳过生成');
  return "";
};

/**
 * 生成可见性CSS样式
 * @param node 场景节点
 * @returns 返回visibility样式字符串（不可见时返回hidden）
 *
 * 注意：Figma中不可见的元素仍然存在，只是不显示
 */
export const htmlVisibility = (
  node: SceneNodeMixin,
): string => {
  // 测试环境下node.visible可能为undefined
  if (node.visible !== undefined && !node.visible) {
    // console.log('[样式生成] 生成可见性样式: visibility=hidden');
    return format("visibility", "hidden");
  }
  // console.log('[样式生成] 元素可见，跳过生成');
  return "";
};

/**
 * 生成旋转CSS样式
 * @param node AltNode节点
 * @returns 返回包含transform和transform-origin的样式数组（无旋转时返回空数组）
 */
export const htmlRotation = (node: AltNode): string[] => {
  // 计算总旋转角度（Figma角度取反并加上累积旋转）
  const rotation = -Math.round((node.rotation || 0) + (node.cumulativeRotation || 0)) || 0;

  if (rotation !== 0) {
    const rotationValue = numberToFixedString(rotation);
    // console.log(`[样式生成] 生成旋转样式: 旋转${rotationValue}度`);
    return [
      format("transform", `rotate(${rotationValue}deg)`),
      format("transform-origin", "top left") // 设置变换原点为左上角
    ];
  }
  // console.log('[样式生成] 无旋转角度，跳过生成');
  return [];
};
