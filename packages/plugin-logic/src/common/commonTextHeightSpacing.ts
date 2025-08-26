/**
 * 计算行高值
 * @param lineHeight 行高配置对象
 * @param fontSize 当前字体大小（用于百分比计算）
 * @returns 返回计算后的行高数值（像素值）
 *
 * 处理规则：
 * - AUTO：返回0（表示自动行高）
 * - PIXELS：直接返回像素值
 * - PERCENT：根据字体大小计算实际像素值
 */
export const commonLineHeight = (
  lineHeight: LineHeight,
  fontSize: number,
): number => {
  // console.log('[文字排版] 开始计算行高值');

  switch (lineHeight.unit) {
    case "AUTO":
      // console.log('[文字排版] 使用自动行高');
      return 0;
    case "PIXELS":
      // console.log(`[文字排版] 使用固定行高: ${lineHeight.value}px`);
      return lineHeight.value;
    case "PERCENT":
      const calculatedHeight = (fontSize * lineHeight.value) / 100;
      // console.log(`[文字排版] 计算百分比行高: 字体${fontSize}px * ${lineHeight.value}% = ${calculatedHeight}px`);
      return calculatedHeight;
  }
};

/**
 * 计算字间距值
 * @param letterSpacing 字间距配置对象
 * @param fontSize 当前字体大小（用于百分比计算）
 * @returns 返回计算后的字间距数值（像素值）
 *
 * 处理规则：
 * - PIXELS：直接返回像素值
 * - PERCENT：根据字体大小计算实际像素值
 */
export const commonLetterSpacing = (
  letterSpacing: LetterSpacing,
  fontSize: number,
): number => {
  // console.log('[文字排版] 开始计算字间距');

  switch (letterSpacing.unit) {
    case "PIXELS":
      // console.log(`[文字排版] 使用固定字间距: ${letterSpacing.value}px`);
      return letterSpacing.value;
    case "PERCENT":
      const calculatedSpacing = (fontSize * letterSpacing.value) / 100;
      // console.log(`[文字排版] 计算百分比字间距: 字体${fontSize}px * ${letterSpacing.value}% = ${calculatedSpacing}px`);
      return calculatedSpacing;
  }
};
