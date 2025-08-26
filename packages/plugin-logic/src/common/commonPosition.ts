// @ts-nocheck
import { HTMLSettings } from "types";

/**
 * 获取节点的通用位置值
 * @param node 场景节点
 * @param settings HTML设置（可选）
 * @returns 返回包含x/y坐标的对象
 *
 * 位置计算规则：
 * 1. 如果父节点有绝对边界框且启用了矢量嵌入 → 使用绝对位置（考虑旋转）
 * 2. 如果父节点是GROUP类型 → 计算相对于父节点的位置
 * 3. 其他情况 → 直接返回节点坐标
 */
export const getCommonPositionValue = (
  node: SceneNode,
  settings?: HTMLSettings,
): { x: number; y: number } => {
  if (node.parent && node.parent.absoluteBoundingBox) {
    if (settings?.embedVectors && node.svg) {
      // console.log("[位置计算] 使用绝对位置（包含旋转）");
      return {
        x: node.absoluteBoundingBox.x - node.parent.absoluteBoundingBox.x,
        y: node.absoluteBoundingBox.y - node.parent.absoluteBoundingBox.y,
      };
    }
    // console.log("[位置计算] 使用基础坐标");
    return { x: node.x, y: node.y };
  }

  if (node.parent && node.parent.type === "GROUP") {
    // console.log("[位置计算] 计算相对于GROUP父节点的位置");
    return {
      x: node.x - node.parent.x,
      y: node.y - node.parent.y,
    };
  }

  // console.log("[位置计算] 使用节点原始坐标");
  return {
    x: node.x,
    y: node.y,
  };
};

/**
 * 边界框接口定义
 */
interface BoundingBox {
  width: number; // 边界框宽度 (w_b)
  height: number; // 边界框高度 (h_b)
  x: number; // X坐标 (x_b)
  y: number; // Y坐标 (y_b)
}

/**
 * 矩形样式接口定义
 */
interface RectangleStyle {
  width: number; // 原始宽度 (w)
  height: number; // 原始高度 (h)
  left: number; // 最终CSS left值
  top: number; // 最终CSS top值
  rotation: number; // 旋转角度（度）
}

/**
 * 根据边界框计算矩形样式
 * @param boundingBox 边界框数据
 * @param figmaRotationDegrees Figma旋转角度（度）
 * @returns 计算后的矩形样式
 *
 * 算法说明：
 * 1. 将Figma旋转角度转换为CSS旋转角度（取反）
 * 2. 通过三角函数计算实际宽高
 * 3. 计算旋转后的角点位置
 * 4. 确定最终定位坐标
 */
export function calculateRectangleFromBoundingBox(
  boundingBox: BoundingBox,
  figmaRotationDegrees: number,
): RectangleStyle {
  // console.log("[矩形计算] 开始计算旋转矩形样式");

  // 转换旋转角度（Figma → CSS）
  const cssRotationDegrees = -figmaRotationDegrees;
  // console.log(`[矩形计算] 旋转角度转换: Figma ${figmaRotationDegrees}° → CSS ${cssRotationDegrees}°`);

  // 计算三角函数值
  const theta = (cssRotationDegrees * Math.PI) / 180;
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const absCosTheta = Math.abs(cosTheta);
  const absSinTheta = Math.abs(sinTheta);

  const { width: w_b, height: h_b, x: x_b, y: y_b } = boundingBox;
  // console.log(`[矩形计算] 边界框参数: width=${w_b}, height=${h_b}, x=${x_b}, y=${y_b}`);

  // 计算原始宽高
  const denominator = absCosTheta * absCosTheta - absSinTheta * absSinTheta;
  const h = (w_b * absSinTheta - h_b * absCosTheta) / -denominator;
  const w = (w_b - h * absSinTheta) / absCosTheta;
  // console.log(`[矩形计算] 原始尺寸: width=${w.toFixed(2)}, height=${h.toFixed(2)}`);

  // 计算旋转后的角点
  const corners = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
  ];
  const rotatedCorners = corners.map(({ x, y }) => ({
    x: x * cosTheta + y * sinTheta,
    y: -x * sinTheta + y * cosTheta,
  }));

  // 计算最小偏移
  const minX = Math.min(...rotatedCorners.map((c) => c.x));
  const minY = Math.min(...rotatedCorners.map((c) => c.y));
  const left = x_b - minX;
  const top = y_b - minY;
  // console.log(`[矩形计算] 最终定位: left=${left.toFixed(2)}, top=${top.toFixed(2)}`);

  return {
    width: parseFloat(w.toFixed(2)),
    height: parseFloat(h.toFixed(2)),
    left: parseFloat(left.toFixed(2)),
    top: parseFloat(top.toFixed(2)),
    rotation: cssRotationDegrees,
  };
}

/**
 * 判断节点是否为绝对定位
 * @param node 场景节点
 * @returns 返回布尔值表示是否为绝对定位
 *
 * 判断规则：
 * 1. 节点明确设置为ABSOLUTE → true
 * 2. 没有父节点 → false
 * 3. 父节点没有布局模式或布局模式为NONE → true
 * 4. 其他情况 → false
 */
export const commonIsAbsolutePosition = (node: SceneNode) => {
  if ("layoutPositioning" in node && node.layoutPositioning === "ABSOLUTE") {
    // console.log("[定位判断] 节点明确设置为绝对定位");
    return true;
  }

  if (!node.parent) {
    // console.log("[定位判断] 无父节点，非绝对定位");
    return false;
  }

  const isAbsolute = ("layoutMode" in node.parent && node.parent.layoutMode === "NONE") ||
    !("layoutMode" in node.parent);

  // console.log(`[定位判断] 根据父节点布局判断结果: ${isAbsolute}`);
  return isAbsolute;
};
