import { indentString } from "../common/utils/indentString";
import { HtmlTextBuilder } from "./htmlTextBuilder";
import { HtmlDefaultBuilder } from "./htmlDefaultBuilder";
import { htmlAutoLayoutProps } from "./builderImpl/htmlAutoLayout";
import { format } from "../common/utils/formatTool";
import {
  AltNode,
  ExportableNode,
  HTMLPreview,
  HTMLSettings,
  PluginSettings,
} from "types";
import { renderAndAttachSVG } from "../altNodes/altNodeUtils";
import {
  exportNodeAsBase64PNG,
  getPlaceholderImage,
  nodeHasImageFill,
} from "../common/commonImage";
import { addWarning } from "../common/commonWarning";
import { parseHTMLToNodes } from "./tools/htmlToJSON";
import { parseNodesToHTML } from "./tools/jsonToHTML";
import { DSTotal } from "./tools/DeepSeekTotal";
import { cozeGenTotal } from "./tools/cozeForTotal";
import { isStructureIdentical } from "./tools/structureCompare";

// 全局预览标志
export let isPreviewGlobal = false;

// 用于缓存上一次执行的样式和文本
let previousExecutionCache: { style: string; text: string }[];

/**
 * HTML输出接口定义
 */
export interface HtmlOutput {
  html: string;  // HTML内容
  css?: string;  // 可选的CSS样式
}

/**
 * CSS集合类型定义
 */
interface CSSCollection {
  [className: string]: {
    styles: string[];    // 样式规则数组
    nodeName?: string;   // 节点名称
    nodeType?: string;   // 节点类型
    element?: string;    // 基础HTML元素
  };
}

// 全局CSS集合
export let cssCollection: CSSCollection = {};

/**
 * 获取收集的CSS样式字符串
 * @returns 格式化后的CSS字符串
 */
export function getCollectedCSS(): string {
  if (Object.keys(cssCollection).length === 0) {
    return "";
  }

  return Object.entries(cssCollection)
    .map(([className, { styles }]) => {
      if (!styles.length) return "";
      return `.${className} {\n  ${styles.join(";\n  ")}${styles.length ? ";" : ""}\n}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

/**
 * 主HTML生成函数
 * @param sceneNode 场景节点数组
 * @param settings 插件设置
 * @param isPreview 是否为预览模式
 * @returns 包含HTML和CSS的输出对象
 */
export const htmlMain = async (
  sceneNode: Array<SceneNode>,
  settings: PluginSettings,
  isPreview: boolean = false,
): Promise<HtmlOutput> => {
  isPreviewGlobal = isPreview;
  previousExecutionCache = [];
  cssCollection = {};

  // 生成HTML内容
  let htmlContent = await htmlWidgetGenerator(sceneNode, settings);

  // 去除开头的换行符
  if (htmlContent.length > 0 && htmlContent.startsWith("\n")) {
    htmlContent = htmlContent.slice(1, htmlContent.length);
  }

  const output: HtmlOutput = { html: htmlContent };

  // 如果有收集的CSS样式，添加到输出
  if (Object.keys(cssCollection).length > 0) {
    output.css = getCollectedCSS();
  }

  let jsonNodes;  // 解析后的节点数据
  let processedNodes; // AI处理后的节点数据

  // 解析HTML为节点结构
  jsonNodes = parseHTMLToNodes(output.html, true);
  console.log("[调试] 解析完成的节点数据:", jsonNodes);

  try {
    // 模拟AI处理过程
    processedNodes = await mockTimeOut(jsonNodes);
    console.log("[调试] AI处理后的节点数据:", processedNodes);

    // 检查结构是否一致
    console.log("[调试] 节点结构比对结果:", isStructureIdentical(jsonNodes, processedNodes))
    if(!isStructureIdentical(jsonNodes, processedNodes)) {
      // 如果结构不一致，使用人工生成的类名
      processedNodes = parseHTMLToNodes(output.html, false);
    }
  } catch(error: any) {
    console.error("[错误] 节点处理出错:", error);
  } finally {
    // 最终将处理后的节点转换为HTML
    output.html = parseNodesToHTML(processedNodes);
  }

  return output;
};

/**
 * 模拟AI处理延迟
 * @param data 输入数据
 * @returns 返回处理后的数据
 */
export const mockTimeOut = async (data: any): Promise<any> => {
  return new Promise((resolve) => {
    console.log('[调试] 开始模拟AI处理延迟...');
    setTimeout(() => {
      console.log('[调试] AI处理完成');
      resolve([{  }]);
    }, 1000);
  });
};

/**
 * 生成HTML预览
 * @param nodes 场景节点数组
 * @param settings 插件设置
 * @returns HTML预览对象
 */
export const generateHTMLPreview = async (
  nodes: SceneNode[],
  settings: PluginSettings,
): Promise<HTMLPreview> => {
  let result = await htmlMain(
    nodes,
    {
      ...settings,
      htmlGenerationMode: "html",
    },
    nodes.length <= 1,
  );

  // 多个节点时添加外层div
  if (nodes.length > 1) {
    result.html = `<div style="width: 100%; height: 100%">${result.html}</div>`;
  }

  return {
    size: {
      width: Math.max(...nodes.map((node) => node.width)),
      height: nodes.reduce((sum, node) => sum + node.height, 0),
    },
    content: result.html,
  };
};

/**
 * 获取可见节点
 * @param nodes 节点数组
 * @returns 可见节点数组
 */
const getVisibleNodes = (nodes: readonly SceneNode[]) =>
  nodes.filter((d) => d.visible ?? true);

/**
 * HTML组件生成器
 * @param sceneNode 场景节点数组
 * @param settings HTML设置
 * @returns 生成的HTML字符串
 */
const htmlWidgetGenerator = async (
  sceneNode: ReadonlyArray<SceneNode>,
  settings: HTMLSettings,
): Promise<string> => {
  // 过滤不可见节点并转换每个节点
  const promiseOfConvertedCode = getVisibleNodes(sceneNode).map(
    convertNode(settings),
  );
  return (await Promise.all(promiseOfConvertedCode)).join("");
};

/**
 * 节点转换函数
 * @param settings HTML设置
 * @returns 返回转换节点的函数
 */
const convertNode = (settings: HTMLSettings) => async (node: SceneNode) => {
  // 处理矢量图形
  if (settings.embedVectors && (node as any).canBeFlattened) {
    const altNode = await renderAndAttachSVG(node);
    if (altNode.svg) {
      return htmlWrapSVG(altNode, settings);
    }
  }

  // 根据节点类型调用不同的转换方法
  switch (node.type) {
    case "RECTANGLE":
    case "ELLIPSE":
      return await htmlContainer(node, "", [], settings);
    case "GROUP":
      return await htmlGroup(node, settings);
    case "FRAME":
    case "COMPONENT":
    case "INSTANCE":
    case "COMPONENT_SET":
      return await htmlFrame(node, settings);
    case "SECTION":
      return await htmlSection(node, settings);
    case "TEXT":
      return htmlText(node, settings);
    case "LINE":
      return htmlLine(node, settings);
    case "VECTOR":
      if (!settings.embedVectors && !isPreviewGlobal) {
        addWarning("矢量图形不支持");
      }
      return await htmlContainer(
        { ...node, type: "RECTANGLE" } as any,
        "",
        [],
        settings,
      );
    default:
      addWarning(`${node.type} 类型节点不支持`);
      return "";
  }
};

/**
 * 包装SVG内容
 * @param node 节点
 * @param settings HTML设置
 * @returns 包装后的SVG HTML字符串
 */
const htmlWrapSVG = (
  node: AltNode<SceneNode>,
  settings: HTMLSettings,
): string => {
  if (node.svg === "") return "";

  const builder = new HtmlDefaultBuilder(node, settings)
    .addData("svg-wrapper")
    .position();

  return `\n<div${builder.build()}>\n${indentString(node.svg ?? "")}</div>`;
};

/**
 * 处理组节点
 * @param node 组节点
 * @param settings HTML设置
 * @returns 生成的HTML字符串
 */
const htmlGroup = async (
  node: GroupNode,
  settings: HTMLSettings,
): Promise<string> => {
  // 忽略无效尺寸的节点
  if (node.width < 0 || node.height <= 0 || node.children.length === 0) {
    return "";
  }

  const builder = new HtmlDefaultBuilder(node, settings).commonPositionStyles();

  if (builder.styles) {
    const attr = builder.build();
    const generator = await htmlWidgetGenerator(node.children, settings);
    return `\n<div${attr}>${indentString(generator)}\n</div>`;
  }
  return await htmlWidgetGenerator(node.children, settings);
};

/**
 * 处理文本节点
 * @param node 文本节点
 * @param settings HTML设置
 * @returns 生成的HTML字符串
 */
const htmlText = (node: TextNode, settings: HTMLSettings): string => {
  let layoutBuilder = new HtmlTextBuilder(node, settings)
    .commonPositionStyles()
    .textTrim()
    .textAlignHorizontal()
    .textAlignVertical();

  const styledHtml = layoutBuilder.getTextSegments(node);
  previousExecutionCache.push(...styledHtml);

  // 处理单个文本段
  let content: string;
  if (styledHtml.length === 1) {
    layoutBuilder.addStyles(styledHtml[0].style);
    content = styledHtml[0].text;

    // 处理上下标
    const additionalTag =
      styledHtml[0].openTypeFeatures.SUBS
        ? "sub"
        : styledHtml[0].openTypeFeatures.SUPS
          ? "sup"
          : "";

    if (additionalTag) {
      content = `<${additionalTag}>${content}</${additionalTag}>`;
    }
  } else {
    // 处理多文本段
    content = styledHtml
      .map((style) => {
        const tag =
          style.openTypeFeatures.SUBS
            ? "sub"
            : style.openTypeFeatures.SUPS
              ? "sup"
              : "span";

        return `<${tag} style="${style.style}">${style.text}</${tag}>`;
      })
      .join("");
  }

  // 替换连续空格为HTML实体
  return `\n<span${layoutBuilder.build()}>${content.replace(/\s\s/g, "&nbsp;&nbsp;")}</span>`;
};

/**
 * 处理框架节点
 * @param node 框架节点
 * @param settings HTML设置
 * @returns 生成的HTML字符串
 */
const htmlFrame = async (
  node: SceneNode & BaseFrameMixin,
  settings: HTMLSettings,
): Promise<string> => {
  const childrenStr = await htmlWidgetGenerator(node.children, settings);

  if (node.layoutMode !== "NONE") {
    const rowColumn = htmlAutoLayoutProps(node);
    return await htmlContainer(node, childrenStr, rowColumn, settings);
  }

  return await htmlContainer(node, childrenStr, [], settings);
};

/**
 * 处理容器节点
 * @param node 节点
 * @param children 子节点HTML
 * @param additionalStyles 附加样式
 * @param settings HTML设置
 * @returns 生成的HTML字符串
 */
const htmlContainer = async (
  node: SceneNode &
    SceneNodeMixin &
    BlendMixin &
    LayoutMixin &
    GeometryMixin &
    MinimalBlendMixin,
  children: string,
  additionalStyles: string[] = [],
  settings: HTMLSettings,
): Promise<string> => {
  // 忽略无效尺寸的节点
  if (node.width <= 0 || node.height <= 0) {
    return children;
  }

  const builder = new HtmlDefaultBuilder(node, settings)
    .commonPositionStyles()
    .commonShapeStyles();

  if (builder.styles || additionalStyles) {
    let tag = "div";
    let src = "";

    // 处理图片填充
    if (nodeHasImageFill(node)) {
      const altNode = node as AltNode<ExportableNode>;
      const hasChildren = "children" in node && node.children.length > 0;
      let imgUrl: string;

      if (
        settings.embedImages &&
        (settings as PluginSettings).framework === "HTML"
      ) {
        imgUrl = (await exportNodeAsBase64PNG(altNode, hasChildren)) ?? "";
      } else {
        imgUrl = getPlaceholderImage(node.width, node.height);
        console.log("[调试] 图片占位URL:", imgUrl);
      }

      if (hasChildren) {
        builder.addStyles(
          format(
            "background-image",
            `url(${imgUrl})`,
          ),
        );
      } else {
        tag = "img";
        src = ` src="${imgUrl}"`;
      }
    }

    const build = builder.build(additionalStyles);

    if (children) {
      return `\n<${tag}${build}${src}>${indentString(children)}\n</${tag}>`;
    } else {
      return `\n<${tag}${build}${src}></${tag}>`;
    }
  }

  return children;
};

/**
 * 处理区域节点
 * @param node 区域节点
 * @param settings HTML设置
 * @returns 生成的HTML字符串
 */
const htmlSection = async (
  node: SectionNode,
  settings: HTMLSettings,
): Promise<string> => {
  const childrenStr = await htmlWidgetGenerator(node.children, settings);
  const builder = new HtmlDefaultBuilder(node, settings)
    .size()
    .position()
    .applyFillsToStyle(node.fills, "background");

  if (childrenStr) {
    return `\n<div${builder.build()}>${indentString(childrenStr)}\n</div>`;
  } else {
    return `\n<div${builder.build()}></div>`;
  }
};

/**
 * 处理线条节点
 * @param node 线条节点
 * @param settings HTML设置
 * @returns 生成的HTML字符串
 */
const htmlLine = (node: LineNode, settings: HTMLSettings): string => {
  const builder = new HtmlDefaultBuilder(node, settings)
    .commonPositionStyles()
    .commonShapeStyles();

  return `\n<div${builder.build()}></div>`;
};

/**
 * 生成文本样式代码
 * @returns 文本样式代码字符串
 */
export const htmlCodeGenTextStyles = () => {
  const result = previousExecutionCache
    .map(
      (style) =>
        `// ${style.text}\n${style.style.split(";").join(";\n")}`,
    )
    .join("\n---\n");

  if (!result) {
    return "// 当前选择中没有文本样式";
  }
  return result;
};
