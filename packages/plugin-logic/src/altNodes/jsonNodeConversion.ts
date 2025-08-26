// @ts-nocheck
import { addWarning } from "../common/commonWarning";
import { PluginSettings } from "types";
import { HasGeometryTrait, Node, Paint } from "../api_types";
import { calculateRectangleFromBoundingBox } from "../common/commonPosition";
import { isLikelyIcon } from "./iconDetection";
import { AltNode } from "../node_types";

// 性能跟踪计数器
export let getNodeByIdAsyncTime = 0;        // getNodeByIdAsync函数总耗时
export let getNodeByIdAsyncCalls = 0;       // getNodeByIdAsync函数调用次数
export let getStyledTextSegmentsTime = 0;   // getStyledTextSegments函数总耗时
export let getStyledTextSegmentsCalls = 0;  // getStyledTextSegments函数调用次数
export let processColorVariablesTime = 0;   // processColorVariables函数总耗时
export let processColorVariablesCalls = 0;  // processColorVariables函数调用次数

/**
 * 重置性能计数器
 */
export const resetPerformanceCounters = () => {
  getNodeByIdAsyncTime = 0;
  getNodeByIdAsyncCalls = 0;
  getStyledTextSegmentsTime = 0;
  getStyledTextSegmentsCalls = 0;
  processColorVariablesTime = 0;
  processColorVariablesCalls = 0;
};

// 用于跟踪节点名称的序列号计数
const nodeNameCounters: Map<string, number> = new Map();

// 变量缓存，存储变量ID到颜色名称的映射
const variableCache = new Map<string, string>();

/**
 * 将变量ID映射到颜色名称并缓存结果
 * @param variableId - 变量ID
 * @returns 颜色名称的Promise
 */
const memoizedVariableToColorName = async (
  variableId: string,
): Promise<string> => {
  return variableCache.get(variableId)!;
};

/**
 * 收集节点及其后代中使用的所有颜色变量
 * @param node - 要收集颜色变量的节点
 * @returns 包含颜色变量映射的Map
 */
const collectNodeColorVariables = async (
  node: any,
): Promise<Map<string, { variableId: string; variableName: string }>> => {
  const colorMappings = new Map<
    string,
    { variableId: string; variableName: string }
  >();

  /**
   * 从paint对象添加映射的辅助函数
   * @param paint - 填充或描边样式对象
   */
  const addMappingFromPaint = (paint: any) => {
    // 确保是纯色填充、有解析的变量名称和颜色数据
    if (
      paint.type === "SOLID" &&
      paint.variableColorName &&
      paint.color &&
      paint.boundVariables?.color
    ) {
      // 优先使用绑定变量的实际变量名
      const variableName =
        paint.boundVariables.color.name || paint.variableColorName;

      if (variableName) {
        // 为CSS清理变量名称
        const sanitizedVarName = variableName.replace(/[^a-zA-Z0-9_-]/g, "-");

        const colorInfo = {
          variableId: paint.boundVariables.color.id,
          variableName: sanitizedVarName,
        };

        // 创建颜色的十六进制表示
        const r = Math.round(paint.color.r * 255);
        const g = Math.round(paint.color.g * 255);
        const b = Math.round(paint.color.b * 255);

        // 标准十六进制格式（小写以确保映射一致）
        const hexColor =
          `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toLowerCase();
        colorMappings.set(hexColor, colorInfo);

        // 添加SVG可能使用的常见命名颜色
        // 当builderImpl/htmlColor.ts中的htmlColor()将颜色转换为字符串时，
        // 对于RGB(1,1,1)返回"white"，对于RGB(0,0,0)返回"black"
        if (r === 255 && g === 255 && b === 255) {
          colorMappings.set("white", colorInfo); // 经典CSS颜色名称
          colorMappings.set("rgb(255,255,255)", colorInfo); // RGB格式
        } else if (r === 0 && g === 0 && b === 0) {
          colorMappings.set("black", colorInfo);
          colorMappings.set("rgb(0,0,0)", colorInfo);
        }
        // 如果需要，添加其他常用命名颜色
      }
    }
  };

  // 处理填充
  if (node.fills && Array.isArray(node.fills)) {
    node.fills.forEach(addMappingFromPaint);
  }

  // 处理描边
  if (node.strokes && Array.isArray(node.strokes)) {
    node.strokes.forEach(addMappingFromPaint);
  }

  // 递归处理子节点
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      const childMappings = await collectNodeColorVariables(child);
      // 将子节点映射合并到此节点的映射中
      childMappings.forEach((value, key) => {
        colorMappings.set(key, value);
      });
    }
  }

  return colorMappings;
};

/**
 * 处理paint样式中的颜色变量并添加预计算的变量名称
 * @param paint - 要处理的paint样式（填充或描边）
 */
export const processColorVariables = async (paint: Paint) => {
  const start = Date.now();
  processColorVariablesCalls++;

  if (
    paint.type === "GRADIENT_ANGULAR" ||
    paint.type === "GRADIENT_DIAMOND" ||
    paint.type === "GRADIENT_LINEAR" ||
    paint.type === "GRADIENT_RADIAL"
  ) {
    // 首先过滤具有绑定变量的色标，避免不必要的工作
    const stopsWithVariables = paint.gradientStops.filter(
      (stop) => stop.boundVariables?.color,
    );

    // 并行处理所有具有变量的渐变色标
    if (stopsWithVariables.length > 0) {
      await Promise.all(
        stopsWithVariables.map(async (stop) => {
          (stop as any).variableColorName = await memoizedVariableToColorName(
            stop.boundVariables!.color!.id,
          );
        }),
      );
    }
  } else if (paint.type === "SOLID" && paint.boundVariables?.color) {
    // 预计算并存储变量名称
    (paint as any).variableColorName = await memoizedVariableToColorName(
      paint.boundVariables.color.id,
    );
  }

  processColorVariablesTime += Date.now() - start;
};

/**
 * 处理效果变量（阴影效果）
 * @param paint - 要处理的阴影效果
 */
const processEffectVariables = async (
  paint: DropShadowEffect | InnerShadowEffect,
) => {
  const start = Date.now();
  processColorVariablesCalls++;

  if (paint.boundVariables?.color) {
    // 预计算并存储变量名称
    (paint as any).variableColorName = await memoizedVariableToColorName(
      paint.boundVariables.color.id,
    );
  }

  processColorVariablesTime += Date.now() - start;
};

/**
 * 获取节点的颜色变量
 * @param node - 具有几何特性的节点
 * @param settings - 插件设置
 */
const getColorVariables = async (
  node: HasGeometryTrait,
  settings: PluginSettings,
) => {
  // 尽可能快，使用Promise.all以便并行化调用
  if (settings.useColorVariables) {
    if (node.fills && Array.isArray(node.fills)) {
      await Promise.all(
        node.fills.map((fill: Paint) => processColorVariables(fill)),
      );
    }
    if (node.strokes && Array.isArray(node.strokes)) {
      await Promise.all(
        node.strokes.map((stroke: Paint) => processColorVariables(stroke)),
      );
    }
    if ("effects" in node && node.effects && Array.isArray(node.effects)) {
      await Promise.all(
        node.effects
          .filter(
            (effect: Effect) =>
              effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW",
          )
          .map((effect: DropShadowEffect | InnerShadowEffect) =>
            processEffectVariables(effect),
          ),
      );
    }
  }
};

/**
 * 调整子节点顺序（根据布局模式）
 * @param node - 要调整子节点顺序的节点
 */
function adjustChildrenOrder(node: any) {
  if (!node.itemReverseZIndex || !node.children || node.layoutMode === "NONE") {
    return;
  }

  const children = node.children;
  const absoluteChildren = [];   // 绝对定位的子节点
  const fixedChildren = [];      // 固定定位的子节点

  // 单次遍历分离绝对定位和固定定位的子节点
  for (let i = children.length - 1; i >= 0; i--) {
    const child = children[i];
    if (child.layoutPositioning === "ABSOLUTE") {
      absoluteChildren.push(child);
    } else {
      fixedChildren.unshift(child); // 添加到开头以保持原始顺序
    }
  }

  // 组合数组（反转的绝对定位子节点 + 原始顺序的固定定位子节点）
  node.children = [...absoluteChildren, ...fixedChildren];
}

/**
 * 递归处理JSON节点和Figma节点，使用JSON中不可用的数据更新
 * 现在包括convertNodeToAltNode的功能
 * @param jsonNode - 要处理的JSON节点
 * @param figmaNode - 对应的Figma节点
 * @param settings - 插件设置
 * @param parentNode - 可选的父节点引用
 * @param parentCumulativeRotation - 可选的父级累积旋转角度
 * @returns 可能修改的jsonNode、节点数组（用于内联组）或null
 */
const processNodePair = async (
  jsonNode: AltNode,
  figmaNode: SceneNode,
  settings: PluginSettings,
  parentNode?: AltNode,
  parentCumulativeRotation: number = 0,
): Promise<Node | Node[] | null> => {
  if (!jsonNode.id) return null;
  if (jsonNode.visible === false) return null;

  // 处理节点类型特定的转换（来自convertNodeToAltNode）
  const nodeType = jsonNode.type;

  // 存储累积旋转（父级的累积 + 节点自身的旋转）
  if (parentNode) {
    // 只有在有父节点时才添加累积。这对于GROUP -> FRAME转换很有用，
    // 我们希望将GROUP的旋转移动到子节点，但希望将FRAME设置为0。
    jsonNode.cumulativeRotation = parentCumulativeRotation;
  }

  // 处理空画框并转换为矩形
  if (
    (nodeType === "FRAME" ||
      nodeType === "INSTANCE" ||
      nodeType === "COMPONENT" ||
      nodeType === "COMPONENT_SET") &&
    (!jsonNode.children || jsonNode.children.length === 0)
  ) {
    // 转换为矩形
    // @ts-ignore
    jsonNode.type = "RECTANGLE";
    return processNodePair(
      jsonNode,
      figmaNode,
      settings,
      parentNode,
      parentCumulativeRotation,
    );
  }

  // 通过直接处理其子节点来内联所有GROUP节点
  if (nodeType === "GROUP" && jsonNode.children) {
    const processedChildren = [];

    if (
      Array.isArray(jsonNode.children) &&
      figmaNode &&
      "children" in figmaNode
    ) {
      // 获取可见的JSON子节点（过滤掉visible: false的节点）
      const visibleJsonChildren = jsonNode.children.filter(
        (child) => child.visible !== false,
      ) as AltNode[];

      // 将figma子节点映射到其ID以便匹配
      const figmaChildrenById = new Map();
      figmaNode.children.forEach((child) => {
        figmaChildrenById.set(child.id, child);
      });

      // 处理所有具有匹配Figma节点的可见JSON子节点
      for (const child of visibleJsonChildren) {
        const figmaChild = figmaChildrenById.get(child.id);
        if (!figmaChild) continue; // 如果未找到匹配的Figma节点则跳过

        const processedChild = await processNodePair(
          child,
          figmaChild,
          settings,
          parentNode, // 组的父节点
          parentCumulativeRotation + (jsonNode.rotation || 0),
        );

        // 直接推送处理后的组子节点
        if (processedChild !== null) {
          if (Array.isArray(processedChild)) {
            processedChildren.push(...processedChild);
          } else {
            processedChildren.push(processedChild);
          }
        }
      }
    }

    // 简单地返回处理后的子节点；跳过拼接父节点的子节点
    return processedChildren;
  }

  // 对于不支持的节点返回null
  if (nodeType === "SLICE") {
    return null;
  }

  // 如果提供了父节点，设置父节点引用
  if (parentNode) {
    (jsonNode as any).parent = parentNode;
  }

  // 确保节点具有带简单编号的唯一名称
  const cleanName = jsonNode.name.trim();

  // 使用简单计数器跟踪名称
  const count = nodeNameCounters.get(cleanName) || 0;
  nodeNameCounters.set(cleanName, count + 1);

  // 对于第一次出现，使用原始名称；对于重复项，添加顺序后缀
  jsonNode.uniqueName =
    count === 0
      ? cleanName
      : `${cleanName}_${count.toString().padStart(2, "0")}`;

  // 处理文本特定属性
  if (figmaNode.type === "TEXT") {
    const getSegmentsStart = Date.now();
    getStyledTextSegmentsCalls++;
    let styledTextSegments = figmaNode.getStyledTextSegments([
      "fontName",
      "fills",
      "fontSize",
      "fontWeight",
      "hyperlink",
      "indentation",
      "letterSpacing",
      "lineHeight",
      "listOptions",
      "textCase",
      "textDecoration",
      "textStyleId",
      "fillStyleId",
      "openTypeFeatures",
    ]);
    getStyledTextSegmentsTime += Date.now() - getSegmentsStart;

    // 为每个文本段分配唯一ID
    if (styledTextSegments.length > 0) {
      const baseSegmentName = (jsonNode.uniqueName || jsonNode.name)
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .toLowerCase();

      // 为每个段添加uniqueId
      styledTextSegments = await Promise.all(
        styledTextSegments.map(async (segment, index) => {
          const mutableSegment: any = Object.assign({}, segment);

          if (settings.useColorVariables && segment.fills) {
            mutableSegment.fills = await Promise.all(
              segment.fills.map(async (d) => {
                if (
                  d.blendMode !== "PASS_THROUGH" &&
                  d.blendMode !== "NORMAL"
                ) {
                  addWarning("文本颜色不支持BlendMode");
                }
                const fill = { ...d } as Paint;
                await processColorVariables(fill);
                return fill;
              }),
            );
          }

          // 对于单个段，不添加索引后缀
          if (styledTextSegments.length === 1) {
            (mutableSegment as any).uniqueId = `${baseSegmentName}_span`;
          } else {
            // 对于多个段，添加索引后缀
            (mutableSegment as any).uniqueId =
              `${baseSegmentName}_span_${(index + 1).toString().padStart(2, "0")}`;
          }
          return mutableSegment;
        }),
      );

      jsonNode.styledTextSegments = styledTextSegments;
    }

    // 内联文本样式
    Object.assign(jsonNode, jsonNode.style);
    if (!jsonNode.textAutoResize) {
      jsonNode.textAutoResize = "NONE";
    }
  }

  // 始终复制尺寸和位置
  if ("absoluteBoundingBox" in jsonNode && jsonNode.absoluteBoundingBox && jsonNode.absoluteRenderBounds) {
    if (jsonNode.parent) {
      // 从边界框和旋转中提取宽度和高度。这是必要的，因为Figma JSON API没有宽度和高度。
      const rect = calculateRectangleFromBoundingBox(
        {
          width: jsonNode.absoluteBoundingBox.width,
          height: jsonNode.absoluteBoundingBox.height,
          x:
            jsonNode.absoluteBoundingBox.x -
            (jsonNode.parent?.absoluteBoundingBox.x || 0),
          y:
            jsonNode.absoluteBoundingBox.y -
            (jsonNode.parent?.absoluteBoundingBox.y || 0),
        },
        -((jsonNode.rotation || 0) + (jsonNode.cumulativeRotation || 0)),
      );

      jsonNode.width = rect.width + 5;
      jsonNode.height = rect.height;
      jsonNode.x = rect.left;
      jsonNode.y = rect.top;
    } else {
      jsonNode.width = jsonNode.absoluteBoundingBox.width;
      jsonNode.height = jsonNode.absoluteBoundingBox.height;
      jsonNode.x = 0;
      jsonNode.y = 0;
    }
  }

  // 添加canBeFlattened属性
  if (settings.embedVectors && !parentNode?.canBeFlattened) {
    const isIcon = isLikelyIcon(jsonNode as any);
    (jsonNode as any).canBeFlattened = isIcon;

    // 如果此节点将被展平为SVG，收集其颜色变量
    if (isIcon && settings.useColorVariables) {
      // 在变量处理后安排颜色映射收集
      (jsonNode as any)._collectColorMappings = true;
    }
  } else {
    (jsonNode as any).canBeFlattened = false;
  }

  // 处理单独的描边权重
  if (
    "individualStrokeWeights" in jsonNode &&
    jsonNode.individualStrokeWeights
  ) {
    (jsonNode as any).strokeTopWeight = jsonNode.individualStrokeWeights.top;
    (jsonNode as any).strokeBottomWeight =
      jsonNode.individualStrokeWeights.bottom;
    (jsonNode as any).strokeLeftWeight = jsonNode.individualStrokeWeights.left;
    (jsonNode as any).strokeRightWeight =
      jsonNode.individualStrokeWeights.right;
  }

  // 获取颜色变量
  await getColorVariables(jsonNode, settings);

  // 某些地方检查paddingLeft是否存在。这确保它们都存在，即使为0。
  if ("layoutMode" in jsonNode && jsonNode.layoutMode) {
    if (jsonNode.paddingLeft === undefined) {
      jsonNode.paddingLeft = 0;
    }
    if (jsonNode.paddingRight === undefined) {
      jsonNode.paddingRight = 0;
    }
    if (jsonNode.paddingTop === undefined) {
      jsonNode.paddingTop = 0;
    }
    if (jsonNode.paddingBottom === undefined) {
      jsonNode.paddingBottom = 0;
    }
  }

  // 如果缺失，设置默认布局属性
  if (!jsonNode.layoutMode) jsonNode.layoutMode = "NONE";
  if (!jsonNode.layoutGrow) jsonNode.layoutGrow = 0;
  if (!jsonNode.layoutSizingHorizontal)
    jsonNode.layoutSizingHorizontal = "FIXED";
  if (!jsonNode.layoutSizingVertical) jsonNode.layoutSizingVertical = "FIXED";
  if (!jsonNode.primaryAxisAlignItems) {
    jsonNode.primaryAxisAlignItems = "MIN";
  }
  if (!jsonNode.counterAxisAlignItems) {
    jsonNode.counterAxisAlignItems = "MIN";
  }

  // 如果布局大小为HUG但没有子节点，将其设置为FIXED
  const hasChildren =
    "children" in jsonNode &&
    jsonNode.children &&
    Array.isArray(jsonNode.children) &&
    jsonNode.children.length > 0;

  if (jsonNode.layoutSizingHorizontal === "HUG" && !hasChildren) {
    jsonNode.layoutSizingHorizontal = "FIXED";
  }
  if (jsonNode.layoutSizingVertical === "HUG" && !hasChildren) {
    jsonNode.layoutSizingVertical = "FIXED";
  }

  // 如果两者都有子节点，则递归处理子节点
  if (
    "children" in jsonNode &&
    jsonNode.children &&
    Array.isArray(jsonNode.children) &&
    "children" in figmaNode
  ) {
    // 仅获取可见的JSON子节点
    const visibleJsonChildren = jsonNode.children.filter(
      (child) => child.visible !== false,
    ) as AltNode[];

    // 创建按ID映射的figma子节点以便更容易匹配
    const figmaChildrenById = new Map();
    figmaNode.children.forEach((child) => {
      figmaChildrenById.set(child.id, child);
    });

    const cumulative =
      parentCumulativeRotation +
      (jsonNode.type === "GROUP" ? jsonNode.rotation || 0 : 0);

    // 处理子节点并处理可能的null返回
    const processedChildren = [];

    // 处理所有具有匹配Figma节点的可见JSON子节点
    for (const child of visibleJsonChildren) {
      const figmaChild = figmaChildrenById.get(child.id);
      if (!figmaChild) continue; // 如果未找到匹配的Figma节点则跳过

      const processedChild = await processNodePair(
        child,
        figmaChild,
        settings,
        jsonNode,
        cumulative,
      );

      if (processedChild !== null) {
        if (Array.isArray(processedChild)) {
          processedChildren.push(...processedChild);
        } else {
          processedChildren.push(processedChild);
        }
      }
    }

    // 用处理后的子节点替换子节点数组
    jsonNode.children = processedChildren;

    // 检查是否需要相对定位
    if (
      jsonNode.layoutMode === "NONE" ||
      jsonNode.children.some(
        (d: any) =>
          "layoutPositioning" in d && d.layoutPositioning === "ABSOLUTE",
      )
    ) {
      jsonNode.isRelative = true;
    }

    // 调整子节点顺序
    adjustChildrenOrder(jsonNode);
  }

  // 所有处理完成后为SVG节点收集颜色变量
  if ((jsonNode as any)._collectColorMappings) {
    (jsonNode as any).colorVariableMappings =
      await collectNodeColorVariables(jsonNode);
    delete (jsonNode as any)._collectColorMappings;
  }

  return jsonNode;
};

/**
 * 将Figma节点转换为带有父节点引用的JSON格式
 * @param nodes - 要转换为JSON的Figma节点
 * @param settings - 插件设置
 * @returns 带有父节点引用的节点的JSON表示
 */
export const nodesToJSON = async (
  nodes: ReadonlyArray<SceneNode>,
  settings: PluginSettings,
): Promise<Node[]> => {
  // 为每次转换重置名称计数器
  nodeNameCounters.clear();
  const exportJsonStart = Date.now();

  // 首先获取带有旋转处理的节点的JSON表示
  const nodeResults = await Promise.all(
    nodes.map(async (node) => {
      // 将节点导出为JSON
      const nodeDoc = (
        (await node.exportAsync({
          format: "JSON_REST_V1",
        })) as any
      ).document;

      let nodeCumulativeRotation = 0;

      // 将GROUP连接到FRAME
      if (node.type === "GROUP") {
        nodeDoc.type = "FRAME";

        // 修复子节点的旋转
        if ("rotation" in nodeDoc && nodeDoc.rotation) {
          nodeCumulativeRotation = -nodeDoc.rotation * (180 / Math.PI);
          nodeDoc.rotation = 0;
        }
      }

      return {
        nodeDoc,
        nodeCumulativeRotation,
      };
    }),
  );

  // console.log("[调试] 初始化节点：", { ...nodes[0] });

  console.log(
    `[性能监控][nodesToJSON内部] JSON_REST_V1格式导出耗时: ${Date.now() - exportJsonStart}ms`,
  );

  // 现在处理每个顶级节点对（JSON节点 + Figma节点）
  const processNodesStart = Date.now();
  const result: Node[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const processedNode = await processNodePair(
      nodeResults[i].nodeDoc,
      nodes[i],
      settings,
      undefined,
      nodeResults[i].nodeCumulativeRotation,
    );
    if (processedNode !== null) {
      if (Array.isArray(processedNode)) {
        // 如果processNodePair返回数组（内联组），添加所有节点
        result.push(...processedNode);
      } else {
        // 如果返回单个节点，直接添加
        result.push(processedNode);
      }
    }
  }

  console.log(
    `[性能监控][nodesToJSON内部] 处理节点对耗时: ${Date.now() - processNodesStart}ms`,
  );

  return result;
};
