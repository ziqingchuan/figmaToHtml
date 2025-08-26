import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并Tailwind类名工具函数
 * @param inputs 类名数组或对象
 * @returns 合并后的类名字符串
 *
 * 功能说明：
 * 1. 使用clsx处理类名合并
 * 2. 使用twMerge处理Tailwind类名冲突
 */
export function cn(...inputs: ClassValue[]): string {
  // console.log('[类名处理] 开始合并类名');
  const mergedClasses = twMerge(clsx(inputs));
  // console.log('[类名处理] 合并后的类名:', mergedClasses);
  return mergedClasses;
}

/**
 * 创建Canvas占位图URL
 * @param width 图片宽度
 * @param height 图片高度
 * @returns 返回Base64格式的图片URL
 *
 * 功能说明：
 * 1. 创建指定尺寸的Canvas画布
 * 2. 绘制灰色背景
 * 3. 添加尺寸文字标注
 */
const createCanvasPlaceholder = (width: number, height: number): string => {
  // console.log(`[占位图生成] 开始创建 ${width}x${height} 的占位图`);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.warn('[占位图生成] 无法获取Canvas上下文，返回默认占位图URL');
    return `https://placehold.co/${width}x${height}`;
  }

  // 绘制背景
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, width, height);
  // console.log('[占位图生成] 背景绘制完成');

  // 计算文字大小（自适应宽度）
  const fontSize = Math.max(12, Math.floor(width * 0.15));
  ctx.font = `bold ${fontSize}px Inter, Arial, Helvetica, sans-serif`;
  ctx.fillStyle = "#888888";
  // console.log(`[占位图生成] 设置文字样式: 大小${fontSize}px, 颜色#888888`);

  // 绘制文字
  const text = `${width} x ${height}`;
  const textWidth = ctx.measureText(text).width;
  const x = (width - textWidth) / 2;
  const y = (height + fontSize) / 2;
  ctx.fillText(text, x, y);
  // console.log('[占位图生成] 文字绘制完成', { text, x, y });

  const dataUrl = canvas.toDataURL();
  // console.log('[占位图生成] 生成Base64图片URL');
  return dataUrl;
};

/**
 * 替换HTML中的外部占位图为Canvas生成的图片
 * @param html 原始HTML字符串
 * @returns 替换后的HTML字符串
 *
 * 功能说明：
 * 1. 匹配placehold.co的图片URL
 * 2. 替换为本地生成的Canvas图片
 */
export function replacePlaceholderImages(html: string): string {
  // console.log('[HTML处理] 开始替换占位图');

  const result = html.replace(
    /https:\/\/placehold\.co\/(\d+)x(\d+)/g,
    (match, width, height) => {
      // console.log(`[HTML处理] 替换匹配到的图片: ${match}`);
      return createCanvasPlaceholder(parseInt(width), parseInt(height));
    }
  );

  // console.log('[HTML处理] 占位图替换完成');
  return result;
}
