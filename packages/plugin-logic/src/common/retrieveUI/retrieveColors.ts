import {
  htmlColorFromFill,
  htmlGradientFromFills,
} from "../../html/builderImpl/htmlColor";
import { calculateContrastRatio } from "./commonUI";
import {
  LinearGradientConversion,
  SolidColorConversion,
} from "types";
import { processColorVariables } from "../../altNodes/jsonNodeConversion";

/**
 * 将RGB/RGBA颜色值转换为6位十六进制字符串
 * @param color RGB或RGBA颜色对象
 * @returns 6位十六进制颜色字符串（不含#前缀）
 */
const rgbTo6hex = (color: RGB | RGBA): string => {
  return (
    ((color.r * 255) | (1 << 8)).toString(16).slice(1) + // 转换R通道
    ((color.g * 255) | (1 << 8)).toString(16).slice(1) + // 转换G通道
    ((color.b * 255) | (1 << 8)).toString(16).slice(1)  // 转换B通道
  );
};

/**
 * 获取选中的通用纯色UI颜色
 * @returns 返回处理后的纯色数组，按十六进制值排序
 */
export const retrieveGenericSolidUIColors = async (): Promise<Array<SolidColorConversion>> => {
  // 获取Figma当前选中的颜色
  const selectionColors = figma.getSelectionColors();
  if (!selectionColors || selectionColors.paints.length === 0) return [];

  const colors: Array<SolidColorConversion> = [];

  // 并行处理所有颜色以提高性能（特别是处理变量时）
  await Promise.all(
    selectionColors.paints.map(async (d) => {
      // 复制paint对象避免修改原始数据
      const paint = { ...d } as Paint;

      // 处理颜色变量（如果有）
      await processColorVariables(paint as any);

      // 转换为纯色格式
      const fill = await convertSolidColor(paint);
      if (fill) {
        // 检查是否已存在相同颜色
        const exists = colors.find(
          (col) => col.exportValue === fill.exportValue,
        );
        if (!exists) {
          colors.push(fill);
        }
      }
    }),
  );

  // 按十六进制值排序后返回
  return colors.sort((a, b) => a.hex.localeCompare(b.hex));
};

/**
 * 将Paint对象转换为纯色格式
 * @param fill 填充对象
 * @returns 返回SolidColorConversion对象或null（如果不是纯色）
 */
const convertSolidColor = async (
  fill: Paint
): Promise<SolidColorConversion | null> => {
  // 定义黑白颜色用于对比度计算
  const black = { r: 0, g: 0, b: 0 };
  const white = { r: 1, g: 1, b: 1 };

  // 只处理SOLID类型
  if (fill.type !== "SOLID") return null;

  // 构建输出对象
  const output = {
    hex: rgbTo6hex(fill.color).toUpperCase(), // 转换为大写十六进制
    colorName: "", // 颜色名称（暂留空）
    exportValue: "", // 导出值（后面填充）
    contrastBlack: calculateContrastRatio(fill.color, black), // 与黑色的对比度
    contrastWhite: calculateContrastRatio(fill.color, white), // 与白色的对比度
  };

  // 生成HTML颜色值
  output.exportValue = htmlColorFromFill(fill as any);

  return output;
};

/**
 * 获取选中的线性渐变颜色
 * @returns 返回处理后的线性渐变数组
 */
export const retrieveGenericLinearGradients = async (): Promise<Array<LinearGradientConversion>> => {
  const selectionColors = figma.getSelectionColors();
  const colorStr: Array<LinearGradientConversion> = [];

  if (!selectionColors || selectionColors.paints.length === 0) return [];

  // 并行处理所有渐变填充
  await Promise.all(
    selectionColors.paints.map(async (paint) => {
      // 只处理线性渐变
      if (paint.type === "GRADIENT_LINEAR") {
        // 复制渐变对象
        let fill = { ...paint };
        const t = fill.gradientTransform;

        // 重新计算渐变控制点位置
        // @ts-ignore
        fill.gradientHandlePositions = [
          { x: t[0][2], y: t[1][2] }, // 起点: (e, f)
          { x: t[0][0] + t[0][2], y: t[1][0] + t[1][2] }, // 终点: (a + e, b + f)
        ];

        // 处理渐变停止点的颜色变量
        if (fill.gradientStops) {
          for (const stop of fill.gradientStops) {
            if (stop.boundVariables?.color) {
              try {
                // 获取颜色变量信息
                const variableId = stop.boundVariables.color.id;
                const variable = figma.variables.getVariableById(variableId);
                if (variable) {
                  // 添加变量名称（处理后作为CSS变量名使用）
                  (stop as any).variableColorName = variable.name
                    .replace(/\s+/g, "-") // 替换空格为连字符
                    .toLowerCase(); // 转为小写
                }
              } catch (e) {
                console.error(
                  "处理渐变停止点变量时出错:",
                  e,
                );
              }
            }
          }
        }

        // 生成CSS渐变值
        let exportValue: string;
        // @ts-ignore
        exportValue = htmlGradientFromFills(fill);

        // 添加到结果数组
        colorStr.push({
          // @ts-ignore
          cssPreview: htmlGradientFromFills(fill), // CSS预览值
          exportValue, // 导出值
        });
      }
    }),
  );

  return colorStr;
};
