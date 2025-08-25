import { curry } from "../common/utils/curry";
import { exportAsyncProxy } from "../common/utils/exportAsyncProxy";
import { addWarning } from "../common/commonWarning";

// 使用柯里化创建一个函数，用于覆盖对象的只读属性
export const overrideReadonlyProperty = curry(
  <T, K extends keyof T>(prop: K, value: any, obj: T): T =>
    Object.defineProperty(obj, prop, {
      value: value,
      writable: true,      // 使属性可写
      configurable: true,  // 使属性可配置
    }),
);

// 为节点分配父节点属性的快捷函数
export const assignParent = overrideReadonlyProperty("parent");
// 为节点分配子节点属性的快捷函数
export const assignChildren = overrideReadonlyProperty("children");
// 为节点分配类型属性的快捷函数
export const assignType = overrideReadonlyProperty("type");
// 将节点类型设置为矩形的快捷函数
export const assignRectangleType = assignType("RECTANGLE");

// 检查值是否非空（非null且非undefined）的类型守卫函数
export function isNotEmpty<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  return value !== null && value !== undefined;
}

// 使用柯里化创建一个函数，检查节点是否属于指定类型或其所有子节点都属于指定类型
export const isTypeOrGroupOfTypes = curry(
  (matchTypes: NodeType[], node: SceneNode): boolean => {
    // 检查当前节点类型是否在匹配类型数组中
    if (matchTypes.includes(node.type)) return true;

    // 只有容器类型的节点才检查其子节点
    if ("children" in node) {
      for (let i = 0; i < node.children.length; i++) {
        const childNode = node.children[i];
        const result = isTypeOrGroupOfTypes(matchTypes, childNode);
        // 如果任何子节点不属于指定类型，返回false
        if (!result) {
          return false;
        }
      }
      // 所有子节点都是有效类型，并且节点有子节点时才返回true
      return node.children.length > 0;
    }

    // 非容器节点且类型不匹配时返回false
    return false;
  },
);

// 渲染节点为SVG并附加到节点对象上的异步函数
export const renderAndAttachSVG = async (node: any) => {
  // 只有可以扁平化的节点才处理SVG
  if (node.canBeFlattened) {
    // 如果已有SVG，直接返回节点
    if (node.svg) {
      return node;
    }

    try {
      // 使用代理异步导出SVG字符串
      const svg = (await exportAsyncProxy<string>(node, {
        format: "SVG_STRING",
      })) as string;

      // 如果有颜色变量映射，处理SVG中的颜色替换
      if (node.colorVariableMappings && node.colorVariableMappings.size > 0) {
        let processedSvg = svg;

        // 正则表达式匹配fill="COLOR"或stroke="COLOR"模式
        const colorAttributeRegex = /(fill|stroke)="([^"]*)"/g;

        processedSvg = processedSvg.replace(colorAttributeRegex, (match, attribute, colorValue) => {
          // 清理颜色值并标准化
          const normalizedColor = colorValue.toLowerCase().trim();

          // 在映射中查找颜色
          const mapping = node.colorVariableMappings.get(normalizedColor);
          if (mapping) {
            // 如果有变量引用，使用CSS变量并保留原始颜色作为回退
            return `${attribute}="var(--${mapping.variableName}, ${colorValue})"`;
          }

          // 没有映射则保留原始颜色
          return match;
        });

        // 处理style属性中的fill:或stroke:属性
        const styleRegex = /style="([^"]*)(?:(fill|stroke):\s*([^;"]*))(;|\s|")([^"]*)"/g;

        processedSvg = processedSvg.replace(styleRegex, (match, prefix, property, colorValue, separator, suffix) => {
          // 清理颜色值中的多余空格
          const normalizedColor = colorValue.toLowerCase().trim();

          // 在映射中查找颜色
          const mapping = node.colorVariableMappings.get(normalizedColor);
          if (mapping) {
            // 将颜色值替换为CSS变量并保留原始颜色作为回退
            return `style="${prefix}${property}: var(--${mapping.variableName}, ${colorValue})${separator}${suffix}"`;
          }

          return match;
        });

        // 将处理后的SVG保存到节点
        node.svg = processedSvg;
      } else {
        // 没有颜色映射则直接保存原始SVG
        node.svg = svg;
      }
    } catch (error) {
      // SVG渲染失败时添加警告并记录错误
      addWarning(`SVG渲染失败： ${node.name}`);
      console.error(`SVG渲染失败： ${node.type}:${node.id}`);
      console.error(error);
    }
  }
  return node;
};
