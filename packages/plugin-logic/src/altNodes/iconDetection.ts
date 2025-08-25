// ========================================================================
//          Figma 图标识别算法 - 简化版 v5
// ========================================================================
// 本文件提供简化函数，用于基于结构和尺寸判断Figma节点是否可能作为图标使用

// --- 常量定义 ---

// 基础图形类型（基本形状）
const ICON_PRIMITIVE_TYPES: ReadonlySet<NodeType> = new Set([
  "ELLIPSE",    // 椭圆
  "RECTANGLE",  // 矩形
  "STAR",       // 星形
  "POLYGON",    // 多边形
  "LINE",       // 线条
]);

// 复杂矢量类型
const ICON_COMPLEX_VECTOR_TYPES: ReadonlySet<NodeType> = new Set([
  "VECTOR",             // 矢量路径
  "BOOLEAN_OPERATION",  // 布尔运算
]);

// 无论尺寸大小都视为图标的类型（如果是顶级节点）
const ICON_TYPES_IGNORE_SIZE: ReadonlySet<NodeType> = new Set([
  "VECTOR",             // 矢量路径
  "BOOLEAN_OPERATION",  // 布尔运算
  "POLYGON",            // 多边形
  "STAR",               // 星形
]);

// 可以作为图标容器的类型
const ICON_CONTAINER_TYPES: ReadonlySet<NodeType> = new Set([
  "FRAME",      // 画框
  "GROUP",      // 组
  "COMPONENT",  // 组件
  "INSTANCE",   // 实例
]);

// 明确不允许作为顶级图标或图标内嵌套的类型（GROUP除外）
const DISALLOWED_ICON_TYPES: ReadonlySet<NodeType> = new Set([
  "SLICE",            // 切片
  "CONNECTOR",        // 连接器
  "STICKY",           // 便签
  "SHAPE_WITH_TEXT",  // 带文本的形状
  "CODE_BLOCK",       // 代码块
  "WIDGET",           // 小组件
  "TEXT",             // 文本
  "COMPONENT_SET",    // 组件集（组件容器，本身不是图标）
]);

// 不允许在图标容器内出现的子节点类型（递归检查）
const DISALLOWED_CHILD_TYPES: ReadonlySet<NodeType> = new Set([
  "FRAME",           // 不允许嵌套画框
  "COMPONENT",       // 不允许嵌套组件
  "INSTANCE",        // 不允许嵌套实例
  "TEXT",            // 不允许文本
  "SLICE",           // 不允许切片
  "CONNECTOR",       // 不允许连接器
  "STICKY",          // 不允许便签
  "SHAPE_WITH_TEXT", // 不允许带文本的形状
  "CODE_BLOCK",      // 不允许代码块
  "WIDGET",          // 不允许小组件
  "COMPONENT_SET",   // 不允许组件集
]);

// ========================================================================
//                        辅助函数
// ========================================================================

/**
 * 检查节点的尺寸是否符合典型的图标最大尺寸
 * 简化版只检查最大尺寸
 * @param node - 要检查的场景节点
 * @param maxSize - 图标的最大尺寸（默认为64像素）
 * @returns 如果尺寸在典型图标范围内返回true，否则返回false
 */
function isTypicalIconSize(
  node: SceneNode,
  maxSize = 64, // 标准最大尺寸
): boolean {
  // 检查节点是否有有效的宽度和高度
  if (
    !("width" in node && "height" in node && node.width > 0 && node.height > 0)
  ) {
    return false; // 需要有效的尺寸信息
  }
  // 只检查尺寸是否超过允许的最大值
  return node.width <= maxSize && node.height <= maxSize;
}

/**
 * 检查节点是否有SVG导出设置
 * @param node - 要检查的场景节点
 * @returns 如果有SVG导出设置返回true，否则返回false
 */
function hasSvgExportSettings(node: SceneNode): boolean {
  // 获取节点的导出设置，如果没有则为空数组
  const settingsToCheck: ReadonlyArray<ExportSettings> =
    node.exportSettings || [];
  // 检查是否有任何导出设置格式为SVG
  return settingsToCheck.some((setting) => setting.format === "SVG");
}

/**
 * 递归检查容器节点的子节点
 * 返回一个对象，指示是否找到不允许的子节点和是否有有效的内容
 * @param children - 要检查的子节点数组
 * @returns 包含检查结果的对象
 */
function checkChildrenRecursively(children: ReadonlyArray<SceneNode>): {
  hasDisallowedChild: boolean; // 是否包含不允许的子节点类型
  hasValidContent: boolean;    // 是否有有效的图标内容
} {
  let hasDisallowedChild = false;
  let hasValidContent = false;

  // 遍历所有子节点
  for (const child of children) {
    // 跳过不可见的子节点
    if (!child.visible) {
      continue;
    }

    // 检查是否为不允许的类型
    if (DISALLOWED_CHILD_TYPES.has(child.type)) {
      hasDisallowedChild = true;
      break; // 找到不允许的类型，无需继续检查
    }

    // 检查是否为有效的矢量或基本图形类型
    if (
      ICON_COMPLEX_VECTOR_TYPES.has(child.type) ||
      ICON_PRIMITIVE_TYPES.has(child.type)
    ) {
      hasValidContent = true;
    }
    // 如果是组类型且有子节点，递归检查
    else if (child.type === "GROUP" && "children" in child) {
      const groupResult = checkChildrenRecursively(child.children);
      if (groupResult.hasDisallowedChild) {
        hasDisallowedChild = true;
        break; // 在嵌套组中找到不允许的子节点
      }
      if (groupResult.hasValidContent) {
        hasValidContent = true; // 在嵌套组中找到有效内容
      }
    }
    // 忽略其他未明确不允许的节点类型（例如SECTION等）
  }

  return { hasDisallowedChild, hasValidContent };
}

// ========================================================================
//                  主图标识别函数
// ========================================================================

/**
 * 判断一个Figma节点是否可能作为图标使用
 * @param node - 要检查的场景节点
 * @param logDetails - 是否在控制台输出详细日志信息
 * @returns 如果节点可能作为图标返回true，否则返回false
 */
export function isLikelyIcon(node: SceneNode, logDetails = false): boolean {
  // 收集日志信息
  const info: string[] = [`节点: ${node.name} (${node.type}, ID: ${node.id})`];
  let result: boolean;  // 最终结果
  let reason: string;   // 结果原因说明

  // --- 1. 初始过滤（先检查不允许的类型）---
  if (DISALLOWED_ICON_TYPES.has(node.type)) {
    reason = `不允许的类型: ${node.type}`;
    result = false;
  }
  // --- 2. 检查SVG导出设置（仅当不是不允许的类型时）---
  else if (hasSvgExportSettings(node)) {
    reason = "有SVG导出设置";
    result = true;
  }
  // --- 3. 尺寸检查 ---
  else if (
    !("width" in node && "height" in node && node.width > 0 && node.height > 0)
  ) {
    // 特殊情况：允许特定类型即使没有尺寸信息
    if (ICON_TYPES_IGNORE_SIZE.has(node.type)) {
      reason = `直接的${node.type}类型（无需尺寸检查）`;
      result = true;
    } else {
      reason = "无尺寸信息";
      result = false;
    }
  } else {
    // --- 4. 直接矢量/布尔运算/基本图形 ---
    // 特殊情况：VECTOR, BOOLEAN_OPERATION, POLYGON, STAR 总是视为图标
    if (ICON_TYPES_IGNORE_SIZE.has(node.type)) {
      reason = `直接的${node.type}类型（忽略尺寸）`;
      result = true;
    }
    // 检查其他基本图形（椭圆、矩形、线条）并应用尺寸约束
    else if (ICON_PRIMITIVE_TYPES.has(node.type)) {
      if (isTypicalIconSize(node)) {
        reason = `直接的${node.type}类型且尺寸典型`;
        result = true;
      } else {
        reason = `直接的${node.type}类型但尺寸过大 (${Math.round(node.width)}x${Math.round(node.height)})`;
        result = false;
      }
    }
    // --- 5. 容器逻辑 ---
    else if (ICON_CONTAINER_TYPES.has(node.type) && "children" in node) {
      // 容器尺寸检查仍然使用简化的isTypicalIconSize
      if (!isTypicalIconSize(node)) {
        reason = `容器但尺寸过大 (${Math.round(node.width)}x${Math.round(node.height)})`;
        result = false;
      } else {
        // 过滤出可见的子节点
        const visibleChildren = node.children.filter(
          (child) => child.visible,
        );

        // 检查空容器的情况（尺寸已经检查过）
        if (visibleChildren.length === 0) {
          // 检查空容器的样式（填充和描边）
          const hasVisibleFill =
            "fills" in node &&
            Array.isArray(node.fills) &&
            node.fills.some(
              (f) =>
                typeof f === "object" &&
                f !== null &&
                f.visible !== false &&
                ("opacity" in f ? (f.opacity ?? 1) : 1) > 0,
            );
          const hasVisibleStroke =
            "strokes" in node &&
            Array.isArray(node.strokes) &&
            node.strokes.some((s) => s.visible !== false);

          // 如果有可见的填充或描边，视为有效图标
          if (hasVisibleFill || hasVisibleStroke) {
            reason = "空容器但有可见的填充/描边且尺寸典型";
            result = true;
          } else {
            reason = "空容器且无可见样式";
            result = false; // 尺寸合适，但无内容或样式
          }
        } else {
          // 检查非空容器的内容（尺寸已经检查过）
          const checkResult = checkChildrenRecursively(visibleChildren);

          if (checkResult.hasDisallowedChild) {
            reason = "容器包含不允许的子节点类型（文本、画框、组件、实例等）";
            result = false;
          } else if (!checkResult.hasValidContent) {
            // 允许容器如果只包含其他组，只要这些组最终包含有效内容
            // checkResult.hasValidContent 会处理这种情况
            reason = "容器无矢量或基本图形内容";
            result = false;
          } else {
            reason = "容器包含有效的子节点且尺寸典型";
            result = true; // 通过尺寸检查，无不允许的子节点，有有效内容
          }
        }
      }
    }
    // --- 6. 默认情况 ---
    else {
      reason = "不是识别的图标结构（矢量、基本图形或有效容器）";
      result = false;
    }
  }

  // 添加结果信息到日志
  info.push(`结果: ${result ? "是" : "否"} (${reason})`);
  // 如果需要记录详细日志，输出到控制台
  if (logDetails) console.log(info.join(" | "));
  return result;
}
