import { lowercaseFirstLetter } from "./utils/lowercaseFirstLetter";

/**
 * 将样式数组连接成字符串
 * @param styles 样式字符串数组
 * @returns 连接后的样式字符串（用分号分隔）
 */
export const joinStyles = (styles: string[]) =>
  styles.map((s) => s.trim()).join("; ");

/**
 * 格式化style属性
 * @param styles 样式字符串数组
 * @returns 格式化后的style属性字符串（如：` style="color:red; font-size:12px"`）
 */
export const formatStyleAttribute = (
  styles: string[],
): string => {
  const trimmedStyles = joinStyles(styles);

  if (trimmedStyles === "") return "";

  return ` style="${trimmedStyles}"`;
};

/**
 * 格式化data属性
 * @param label 属性名称（如："userName"）
 * @param value 属性值（可选）
 * @returns 格式化后的data属性字符串（如：`data-user-name="value"`）
 *
 * 示例：
 * formatDataAttribute("userName", "张三") → `data-user-name="张三"`
 * formatDataAttribute("isActive") → `data-is-active`
 */
export const formatDataAttribute = (label: string, value?: string) =>
  ` data-${lowercaseFirstLetter(label).replace(" ", "-")}${value === undefined ? `` : `="${value}"`}`;

/**
 * 格式化class属性
 * @param classes 类名字符串数组
 * @returns 格式化后的class属性字符串（如：` class="btn btn-primary"`）
 *
 * 示例：
 * formatClassAttribute(["btn", "primary"]) → ` class="btn primary"`
 * formatClassAttribute([]) → ""
 */
export const formatClassAttribute = (classes: string[]): string =>
  classes.length === 0 ? "" : ` class="${classes.join(" ")}"`;
