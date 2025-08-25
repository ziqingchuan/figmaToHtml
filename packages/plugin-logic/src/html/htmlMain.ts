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
import { addWarning } from "../common/commonConversionWarnings";
import { parseHTMLToNodes } from "./tools/htmlToJSON";
import { parseNodesToHTML } from "./tools/jsonToHTML";
import { DSTotal } from "./tools/DeepSeekTotal";
import { cozeGenTotal } from "./tools/cozeForTotal";
import { isStructureIdentical } from "./tools/structureCompare";

export let isPreviewGlobal = false;

let previousExecutionCache: { style: string; text: string }[];

// Define better type for the output
export interface HtmlOutput {
  html: string;
  css?: string;
}

// CSS Collection for external stylesheet or styled-components
interface CSSCollection {
  [className: string]: {
    styles: string[];
    nodeName?: string;
    nodeType?: string;
    element?: string; // Base HTML element to use
  };
}

export let cssCollection: CSSCollection = {};

// Get the collected CSS as a string with improved formatting
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

export const htmlMain = async (
  sceneNode: Array<SceneNode>,
  settings: PluginSettings,
  isPreview: boolean = false,
): Promise<HtmlOutput> => {
  isPreviewGlobal = isPreview;
  previousExecutionCache = [];
  cssCollection = {};
  let htmlContent = await htmlWidgetGenerator(sceneNode, settings);
  if (htmlContent.length > 0 && htmlContent.startsWith("\n")) {
    htmlContent = htmlContent.slice(1, htmlContent.length);
  }
  const output: HtmlOutput = { html: htmlContent };

  if (Object.keys(cssCollection).length > 0) {
    output.css = getCollectedCSS();
  }
  // console.log("代码：", output);
  let jsonNodes; // 传入的Nodes
  let processedNodes; // AI处理后的Nodes
  // 先尝试用AI，这时className初始化为空，后续如果AI生成的结构出问题，就用人工生成的className，此时useAI为false
  jsonNodes = parseHTMLToNodes(output.html, true);
  console.log("完成jsonNodes：", jsonNodes);
  // output.html = parseNodesToHTML(jsonNodes);
  try {
    processedNodes = await mockTimeOut(jsonNodes);
    // processedNodes = await DSTotal(jsonNodes);
    console.log("processedNodes的内容：", processedNodes);
    // todo: 增加比对json结构的函数，如果大模型生成失败，就重新调用parseHTMLToNodes使用人工生成的类名
    console.log("jsonNodes & processedNodes 结构比对结果：", isStructureIdentical(jsonNodes, processedNodes))
    if(!isStructureIdentical(jsonNodes, processedNodes)) {
      processedNodes = parseHTMLToNodes(output.html, false);
    }
  } catch(error: any) {
    console.error(error);
  } finally {
    output.html = parseNodesToHTML(processedNodes);
  }
  return output;
};
export const mockTimeOut = async (data: any): Promise<any> => {
  // 返回一个Promise，在20秒后resolve
  return new Promise((resolve) => {
    console.log('开始模拟延迟，将在5秒后返回结果...');
    setTimeout(() => {
      console.log('延迟结束，返回结果');
      // 可以根据需要修改返回内容，这里直接返回输入数据
      resolve(data);

      // 如果需要模拟处理后的数据，可以这样写：
      // resolve({
      //     processed: true,
      //     data: data,
      //     timestamp: new Date().toISOString()
      // });
    }, 1000);
  });
};
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
const getVisibleNodes = (nodes: readonly SceneNode[]) =>
  nodes.filter((d) => d.visible ?? true);


const htmlWidgetGenerator = async (
  sceneNode: ReadonlyArray<SceneNode>,
  settings: HTMLSettings,
): Promise<string> => {
  // filter non visible nodes. This is necessary at this step because conversion already happened.
  const promiseOfConvertedCode = getVisibleNodes(sceneNode).map(
    convertNode(settings),
  );
  return (await Promise.all(promiseOfConvertedCode)).join("");
};

const convertNode = (settings: HTMLSettings) => async (node: SceneNode) => {
  if (settings.embedVectors && (node as any).canBeFlattened) {
    const altNode = await renderAndAttachSVG(node);
    if (altNode.svg) {
      return htmlWrapSVG(altNode, settings);
    }
  }

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
        addWarning("Vector is not supported");
      }
      return await htmlContainer(
        { ...node, type: "RECTANGLE" } as any,
        "",
        [],
        settings,
      );
    default:
      addWarning(`${node.type} node is not supported`);
      return "";
  }
};

const htmlWrapSVG = (
  node: AltNode<SceneNode>,
  settings: HTMLSettings,
): string => {
  if (node.svg === "") return "";

  const builder = new HtmlDefaultBuilder(node, settings)
    .addData("svg-wrapper")
    .position();

  // The SVG content already has the var() references, so we don't need
  // to add inline CSS variables in most cases. The browser will use the fallbacks
  // if the variables aren't defined in the CSS.

  return `\n<div${builder.build()}>\n${indentString(node.svg ?? "")}</div>`;
};

const htmlGroup = async (
  node: GroupNode,
  settings: HTMLSettings,
): Promise<string> => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  // also ignore if there are no children inside, which makes no sense
  if (node.width < 0 || node.height <= 0 || node.children.length === 0) {
    return "";
  }

  // this needs to be called after CustomNode because widthHeight depends on it
  const builder = new HtmlDefaultBuilder(node, settings).commonPositionStyles();

  if (builder.styles) {
    const attr = builder.build();
    const generator = await htmlWidgetGenerator(node.children, settings);
    return `\n<div${attr}>${indentString(generator)}\n</div>`;
  }
  return await htmlWidgetGenerator(node.children, settings);
};

// For htmlText and htmlContainer, use the htmlGenerationMode to determine styling approach
const htmlText = (node: TextNode, settings: HTMLSettings): string => {
  let layoutBuilder = new HtmlTextBuilder(node, settings)
    .commonPositionStyles()
    .textTrim()
    .textAlignHorizontal()
    .textAlignVertical();

  const styledHtml = layoutBuilder.getTextSegments(node);
  previousExecutionCache.push(...styledHtml);

  // Standard HTML/CSS approach for HTML, React or Svelte
  let content: string;
  if (styledHtml.length === 1) {
    layoutBuilder.addStyles(styledHtml[0].style);

    content = styledHtml[0].text;

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
    content = styledHtml
      .map((style) => {
        // Always use span for multi-segment text in Svelte mode
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
// 输出: "Hello world&nbsp;&nbsp;with&nbsp;&nbsp;multiple&nbsp;&nbsp;&nbsp;spaces"
  // Always use div as container to be consistent with styled-components
  return `\n<span${layoutBuilder.build()}>${content.replace(/\s\s/g, "&nbsp;&nbsp;")}</span>`;
};

const htmlFrame = async (
  node: SceneNode & BaseFrameMixin,
  settings: HTMLSettings,
): Promise<string> => {
  const childrenStr = await htmlWidgetGenerator(node.children, settings);

  if (node.layoutMode !== "NONE") {
    const rowColumn = htmlAutoLayoutProps(node);
    return await htmlContainer(node, childrenStr, rowColumn, settings);
  }

  // node.layoutMode === "NONE" && node.children.length > 1
  // children needs to be absolute
  return await htmlContainer(node, childrenStr, [], settings);
};

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
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
  // ignore the view when size is zero or less
  if (node.width <= 0 || node.height <= 0) {
    return children;
  }

  const builder = new HtmlDefaultBuilder(node, settings)
    .commonPositionStyles()
    .commonShapeStyles();

  if (builder.styles || additionalStyles) {
    let tag = "div";
    let src = "";

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
        console.log("imgUrl", imgUrl);
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

    // Standard HTML approach for HTML, React, or Svelte
    if (children) {
      return `\n<${tag}${build}${src}>${indentString(children)}\n</${tag}>`;
    } else {
      return `\n<${tag}${build}${src}></${tag}>`;
    }
  }

  return children;
};

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

const htmlLine = (node: LineNode, settings: HTMLSettings): string => {
  const builder = new HtmlDefaultBuilder(node, settings)
    .commonPositionStyles()
    .commonShapeStyles();

  return `\n<div${builder.build()}></div>`;
};

export const htmlCodeGenTextStyles = () => {
  const result = previousExecutionCache
    .map(
      (style) =>
        `// ${style.text}\n${style.style.split(";").join(";\n")}`,
    )
    .join("\n---\n");

  if (!result) {
    return "// No text styles in this selection";
  }
  return result;
};
