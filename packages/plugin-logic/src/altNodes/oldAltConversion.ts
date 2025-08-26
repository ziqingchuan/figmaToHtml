// @ts-nocheck
import { StyledTextSegmentSubset, ParentNode, AltNode } from "types";
import {
  assignParent,
  isNotEmpty,
  assignRectangleType,
  assignChildren,
} from "./altNodeUtils";
import { curry } from "../common/utils/curry";

/**
 * 检查节点是否为指定类型或包含指定类型的组
 * 使用柯里化函数，可以部分应用匹配类型
 * @param matchTypes - 要匹配的节点类型数组
 * @param node - 要检查的场景节点
 * @returns 如果节点是指定类型或组内所有子节点都是指定类型则返回true
 */
export const isTypeOrGroupOfTypes = curry(
  (matchTypes: NodeType[], node: SceneNode): boolean => {
    // 如果节点不可见或者是匹配的类型，返回true
    if (!node.visible || matchTypes.includes(node.type)) return true;

    // 如果节点有子节点，递归检查所有子节点
    if ("children" in node) {
      for (let i = 0; i < node.children.length; i++) {
        const childNode = node.children[i];
        const result = isTypeOrGroupOfTypes(matchTypes, childNode);
        if (result) continue;
        // 子节点检查结果为false
        return false;
      }
      // 所有子节点检查结果都为true
      return true;
    }

    // 不是组或矢量节点
    return false;
  },
);

/**
 * 全局文本样式段存储
 * 用于存储所有文本节点的样式段信息，键为节点ID，值为样式段数组
 */
export let globalTextStyleSegments: Record<string, StyledTextSegmentSubset[]> =
  {};

/**
 * 可以展平为SVG的节点类型列表
 * 使用isTypeOrGroupOfTypes函数检查节点是否可以展平
 */
const canBeFlattened = isTypeOrGroupOfTypes([
  "VECTOR",              // 矢量路径
  "STAR",                // 星形
  "POLYGON",             // 多边形
  "BOOLEAN_OPERATION",   // 布尔运算
]);

/**
 * 将场景节点转换为AltNode（替代节点）
 * 这是一个高阶函数，接收父节点参数并返回转换函数
 * @param parent - 父节点，可以为null
 * @returns 接收场景节点并返回转换后节点的函数
 */
export const convertNodeToAltNode =
  (parent: ParentNode | null) =>
    (node: SceneNode): SceneNode => {
      const type = node.type;

      // 根据节点类型进行不同的处理
      switch (type) {
        // 标准图形节点：矩形、椭圆、线条、星形、多边形、矢量、布尔运算
        case "RECTANGLE":
        case "ELLIPSE":
        case "LINE":
        case "STAR":
        case "POLYGON":
        case "VECTOR":
        case "BOOLEAN_OPERATION":
          return cloneNode(node, parent);  // 直接克隆节点

        // 组节点：画框、实例、组件、组件集
        case "FRAME":
        case "INSTANCE":
        case "COMPONENT":
        case "COMPONENT_SET":
          // 如果画框、实例等没有子节点，转换为矩形节点
          if (node.children.length === 0)
            return cloneAsRectangleNode(node, parent);
        // 继续执行SECTION case的处理

        case "GROUP":
          // 如果组可见且只有一个子节点，应该取消分组
          if (type === "GROUP" && node.children.length === 1 && node.visible)
            return convertNodeToAltNode(parent)(node.children[0]);

        case "SECTION":
          const group = cloneNode(node, parent);
          const groupChildren = oldConvertNodesToAltNodes(node.children, group);
          return assignChildren(groupChildren, group);

        // 文本节点
        case "TEXT":
          // @ts-ignore - 忽略TypeScript检查
          // 提取文本样式段并存储到全局变量中
          globalTextStyleSegments[node.id] = extractStyledTextSegments(node);
          return cloneNode(node, parent);

        // 不支持的节点类型
        case "SLICE":
          throw new Error(
            `抱歉，暂不支持SLICE节点 Type:${node.type} id:${node.id}`,
          );

        // 默认情况：未知节点类型
        default:
          throw new Error(
            `抱歉，检测到未知节点 Type:${node.type} id:${node.id}`,
          );
      }
    };

/**
 * 将场景节点数组转换为AltNode数组（旧版本）
 * 主要用于向后兼容
 * @param sceneNode - 要转换的场景节点数组
 * @param parent - 父节点，可以为null
 * @returns 转换后的AltNode数组
 */
export const oldConvertNodesToAltNodes = (
  sceneNode: ReadonlyArray<SceneNode>,
  parent: ParentNode | null,
): Array<SceneNode> =>
  sceneNode.map(convertNodeToAltNode(parent)).filter(isNotEmpty);

/**
 * 克隆节点并创建AltNode
 * 复制节点的属性，排除不需要的属性，并添加AltNode特有的属性
 * @param node - 要克隆的基础节点
 * @param parent - 父节点，可以为null
 * @returns 克隆后的AltNode
 */
export const cloneNode = <T extends BaseNode>(
  node: T,
  parent: ParentNode | null,
): T => {
  // 创建具有正确原型链的克隆对象
  const cloned = {} as T;

  // 创建新对象，仅包含所需的属性描述符（排除'parent'、'children'等）
  for (const prop in node) {
    if (
      prop !== "parent" &&                   // 排除父节点引用
      prop !== "children" &&                 // 排除子节点数组
      prop !== "horizontalPadding" &&        // 排除水平内边距
      prop !== "verticalPadding" &&          // 排除垂直内边距
      prop !== "mainComponent" &&            // 排除主组件引用
      prop !== "masterComponent" &&          // 排除主组件引用（旧版）
      prop !== "variantProperties" &&        // 排除变体属性
      prop !== "get_annotations" &&          // 排除注解获取方法
      prop !== "componentPropertyDefinitions" && // 排除组件属性定义
      prop !== "exposedInstances" &&         // 排除暴露的实例
      prop !== "instances" &&                // 排除实例引用
      prop !== "componentProperties" &&      // 排除组件属性
      prop !== "componenPropertyReferences" && // 排除组件属性引用
      prop !== "constrainProportions"        // 排除约束比例
    ) {
      cloned[prop as keyof T] = node[prop as keyof T];
    }
  }

  // 除了使用assignParent外，显式设置父节点
  assignParent(parent, cloned);

  // 创建AltNode，添加额外属性
  const altNode = {
    ...cloned,
    parent: cloned.parent,
    originalNode: node,           // 保留原始节点引用
    canBeFlattened: canBeFlattened(node),  // 是否可以展平为SVG
  } as AltNode<T>;

  // 如果全局文本样式段中有此节点的样式，添加到AltNode
  if (globalTextStyleSegments[node.id]) {
    altNode.styledTextSegments = globalTextStyleSegments[node.id];
  }

  // // console.log("altnode:", altNode.parent, cloned.parent);

  return altNode;
};

/**
 * 将节点克隆为矩形节点
 * 当画框没有子节点时自动将画框转换为矩形
 * @param node - 要克隆的基础节点
 * @param parent - 父节点，可以为null
 * @returns 转换后的矩形节点
 */
const cloneAsRectangleNode = <T extends BaseNode>(
  node: T,
  parent: ParentNode | null,
): RectangleNode => {
  const clonedNode = cloneNode(node, parent);

  // 分配矩形类型
  assignRectangleType(clonedNode);

  return clonedNode as unknown as RectangleNode;
};

/**
 * 从文本节点提取样式文本段
 * 获取文本节点的所有样式段信息
 * @param node - 文本节点
 * @returns 样式文本段数组
 */
const extractStyledTextSegments = (node: TextNode) =>
  node.getStyledTextSegments([
    "fontName",          // 字体名称
    "fills",             // 填充样式
    "fontSize",          // 字体大小
    "fontWeight",        // 字体粗细
    "hyperlink",         // 超链接
    "indentation",       // 缩进
    "letterSpacing",     // 字母间距
    "lineHeight",        // 行高
    "listOptions",       // 列表选项
    "textCase",          // 文本大小写
    "textDecoration",    // 文本装饰
    "textStyleId",       // 文本样式ID
    "fillStyleId",       // 填充样式ID
    "openTypeFeatures",  // OpenType特性
  ]);
