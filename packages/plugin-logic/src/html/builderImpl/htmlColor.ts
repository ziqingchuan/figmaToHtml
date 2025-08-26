import { numberToFixedString } from "../../common/utils/numToAutoFixed";
import { retrieveTopFill } from "../../common/retrieveUI/retrieveFill";
import { GradientPaint, Paint } from "../../api_types";

/**
 * 处理带有颜色变量的填充
 * @param fill 填充对象（包含颜色、透明度和变量名）
 * @returns 返回CSS颜色值（使用变量或回退颜色）
 */
export const processColorWithVariable = (fill: {
  color: RGB;
  opacity?: number;
  variableColorName?: string;
}): string => {
  const opacity = fill.opacity ?? 1;

  if (fill.variableColorName) {
    const varName = fill.variableColorName;
    const fallbackColor = htmlColor(fill.color, opacity);
    // console.log(`[颜色处理] 使用颜色变量: var(--${varName}, ${fallbackColor})`);
    return `var(--${varName}, ${fallbackColor})`;
  }
  return htmlColor(fill.color, opacity);
};

/**
 * 从填充中提取颜色、透明度和变量信息
 */
const getColorAndVariable = (
  fill: Paint,
): {
  color: RGB;
  opacity: number;
  variableColorName?: string;
} => {
  if (fill.type === "SOLID") {
    // console.log('[颜色提取] 提取纯色填充');
    return {
      color: fill.color,
      opacity: fill.opacity ?? 1,
      variableColorName: (fill as any).variableColorName,
    };
  } else if (
    (fill.type === "GRADIENT_LINEAR" ||
      fill.type === "GRADIENT_RADIAL" ||
      fill.type === "GRADIENT_ANGULAR" ||
      fill.type === "GRADIENT_DIAMOND") &&
    fill.gradientStops.length > 0
  ) {
    // console.log('[颜色提取] 提取渐变填充的首个色标');
    const firstStop = fill.gradientStops[0];
    return {
      color: firstStop.color,
      opacity: fill.opacity ?? 1,
      variableColorName: (firstStop as any).variableColorName,
    };
  }
  // console.log('[颜色提取] 无有效颜色，返回默认值');
  return { color: { r: 0, g: 0, b: 0 }, opacity: 0 };
};

/**
 * 从填充数组中生成HTML颜色字符串
 */
export const htmlColorFromFills = (
  fills: ReadonlyArray<Paint> | undefined,
): string => {
  const fill = retrieveTopFill(fills);
  if (fill) {
    // console.log('[颜色转换] 从填充数组转换颜色');
    const colorInfo = getColorAndVariable(fill);
    return processColorWithVariable(colorInfo);
  }
  // console.log('[颜色转换] 无有效填充，返回空字符串');
  return "";
};

/**
 * 从单个填充生成HTML颜色字符串
 */
export const htmlColorFromFill = (fill: Paint): string => {
  // console.log('[颜色转换] 从单个填充转换颜色');
  return processColorWithVariable(fill as any);
};

/**
 * RGB颜色转换为CSS颜色字符串
 */
export const htmlColor = (color: RGB, alpha: number = 1): string => {
  // 处理常见颜色简写
  if (color.r === 1 && color.g === 1 && color.b === 1 && alpha === 1) {
    // console.log('[颜色转换] 使用白色简写');
    return "white";
  }
  if (color.r === 0 && color.g === 0 && color.b === 0 && alpha === 1) {
    // console.log('[颜色转换] 使用黑色简写');
    return "black";
  }

  // 处理不透明颜色（HEX格式）
  if (alpha === 1) {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    const toHex = (num: number): string => num.toString(16).padStart(2, "0");
    const hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    // console.log(`[颜色转换] HEX颜色: ${hexColor}`);
    return hexColor;
  }

  // 处理透明颜色（RGBA格式）
  const r = numberToFixedString(color.r * 255);
  const g = numberToFixedString(color.g * 255);
  const b = numberToFixedString(color.b * 255);
  const a = numberToFixedString(alpha);
  const rgbaColor = `rgba(${r}, ${g}, ${b}, ${a})`;
  // console.log(`[颜色转换] RGBA颜色: ${rgbaColor}`);
  return rgbaColor;
};

/**
 * 处理渐变色标
 */
const processGradientStop = (
  stop: ColorStop,
  fillOpacity: number = 1,
  positionMultiplier: number = 100,
  unit: string = "%",
): string => {
  const fillInfo = {
    color: stop.color,
    opacity: stop.color.a * fillOpacity,
    boundVariables: stop.boundVariables,
    variableColorName: (stop as any).variableColorName,
  };

  const color = processColorWithVariable(fillInfo);
  const position = `${(stop.position * positionMultiplier).toFixed(0)}${unit}`;
  // console.log(`[渐变处理] 色标处理: ${color} ${position}`);
  return `${color} ${position}`;
};

/**
 * 处理所有渐变色标
 */
const processGradientStops = (
  stops: ReadonlyArray<ColorStop>,
  fillOpacity: number = 1,
  positionMultiplier: number = 100,
  unit: string = "%",
): string => {
  // console.log('[渐变处理] 处理渐变色标数组');
  return stops
    .map((stop) =>
      processGradientStop(stop, fillOpacity, positionMultiplier, unit),
    )
    .join(", ");
};

/**
 * 根据填充类型生成对应的CSS渐变
 */
export const htmlGradientFromFills = (fill: Paint): string => {
  if (!fill) {
    // console.log('[渐变处理] 无有效填充');
    return "";
  }

  // console.log(`[渐变处理] 填充类型: ${fill.type}`);
  switch (fill.type) {
    case "GRADIENT_LINEAR":
      return htmlLinearGradient(fill);
    case "GRADIENT_ANGULAR":
      return htmlAngularGradient(fill);
    case "GRADIENT_RADIAL":
      return htmlRadialGradient(fill);
    case "GRADIENT_DIAMOND":
      return htmlDiamondGradient(fill);
    default:
      // console.log('[渐变处理] 不支持的渐变类型');
      return "";
  }
};

/**
 * 生成线性渐变CSS
 */
export const htmlLinearGradient = (fill: GradientPaint) => {
  // console.log('[渐变处理] 生成线性渐变');
  const [start, end] = fill.gradientHandlePositions;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  angle = (angle + 360) % 360;
  const cssAngle = (angle + 90) % 360;
  const mappedFill = processGradientStops(
    fill.gradientStops,
    fill.opacity ?? 1,
  );
  const gradient = `linear-gradient(${cssAngle.toFixed(0)}deg, ${mappedFill})`;
  // console.log(`[渐变处理] 线性渐变结果: ${gradient}`);
  return gradient;
};

/**
 * 生成径向渐变CSS
 */
export const htmlRadialGradient = (fill: GradientPaint) => {
  // console.log('[渐变处理] 生成径向渐变');
  const [center, h1, h2] = fill.gradientHandlePositions;
  const cx = center.x * 100;
  const cy = center.y * 100;
  const rx = Math.sqrt((h1.x - center.x) ** 2 + (h1.y - center.y) ** 2) * 100;
  const ry = Math.sqrt((h2.x - center.x) ** 2 + (h2.y - center.y) ** 2) * 100;
  const mappedStops = processGradientStops(
    fill.gradientStops,
    fill.opacity ?? 1,
  );
  const gradient = `radial-gradient(ellipse ${rx.toFixed(2)}% ${ry.toFixed(2)}% at ${cx.toFixed(2)}% ${cy.toFixed(2)}%, ${mappedStops})`;
  // console.log(`[渐变处理] 径向渐变结果: ${gradient}`);
  return gradient;
};

/**
 * 生成锥形渐变CSS
 */
export const htmlAngularGradient = (fill: GradientPaint) => {
  // console.log('[渐变处理] 生成锥形渐变');
  const [center, _, startDirection] = fill.gradientHandlePositions;
  const cx = center.x * 100;
  const cy = center.y * 100;
  const dx = startDirection.x - center.x;
  const dy = startDirection.y - center.y;
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  angle = (angle + 360) % 360;
  const mappedFill = processGradientStops(
    fill.gradientStops,
    fill.opacity ?? 1,
    360,
    "deg",
  );
  const gradient = `conic-gradient(from ${angle.toFixed(0)}deg at ${cx.toFixed(2)}% ${cy.toFixed(2)}%, ${mappedFill})`;
  // console.log(`[渐变处理] 锥形渐变结果: ${gradient}`);
  return gradient;
};

/**
 * 生成菱形渐变CSS（近似实现）
 */
export const htmlDiamondGradient = (fill: GradientPaint) => {
  // console.log('[渐变处理] 生成菱形渐变');
  const stops = processGradientStops(
    fill.gradientStops,
    fill.opacity ?? 1,
    50,
    "%",
  );
  const gradientConfigs = [
    { direction: "to bottom right", position: "bottom right" },
    { direction: "to bottom left", position: "bottom left" },
    { direction: "to top left", position: "top left" },
    { direction: "to top right", position: "top right" },
  ];
  const gradient = gradientConfigs
    .map(
      ({ direction, position }) =>
        `linear-gradient(${direction}, ${stops}) ${position} / 50% 50% no-repeat`,
    )
    .join(", ");
  // console.log(`[渐变处理] 菱形渐变结果: ${gradient}`);
  return gradient;
};

/**
 * 从填充数组构建CSS背景值
 */
export const buildBackgroundValues = (
  paintArray: ReadonlyArray<Paint> | PluginAPI["mixed"],
): string => {
  if (paintArray === figma.mixed) {
    // console.log('[背景构建] 混合填充类型，返回空字符串');
    return "";
  }

  // 单个填充处理
  if (paintArray.length === 1) {
    const paint = paintArray[0];
    // console.log('[背景构建] 处理单个填充');
    if (paint.type === "SOLID") {
      return htmlColorFromFills(paintArray);
    } else if (
      paint.type === "GRADIENT_LINEAR" ||
      paint.type === "GRADIENT_RADIAL" ||
      paint.type === "GRADIENT_ANGULAR" ||
      paint.type === "GRADIENT_DIAMOND"
    ) {
      return htmlGradientFromFills(paint);
    }
    return "";
  }

  // 多个填充处理（反转顺序匹配CSS层叠）
  // console.log('[背景构建] 处理多个填充');
  const styles = [...paintArray].reverse().map((paint, index) => {
    if (paint.type === "SOLID") {
      const color = htmlColorFromFills([paint]);
      if (index === 0) {
        return `linear-gradient(0deg, ${color} 0%, ${color} 100%)`;
      }
      return color;
    } else if (
      paint.type === "GRADIENT_LINEAR" ||
      paint.type === "GRADIENT_RADIAL" ||
      paint.type === "GRADIENT_ANGULAR" ||
      paint.type === "GRADIENT_DIAMOND"
    ) {
      return htmlGradientFromFills(paint);
    }
    return "";
  });

  const result = styles.filter((value) => value !== "").join(", ");
  // console.log(`[背景构建] 最终背景值: ${result}`);
  return result;
};
