// @ts-nocheck
import { format } from "../common/utils/formatTool";
import { htmlShadow } from "./builderImpl/htmlShadow";
import {
  htmlVisibility,
  htmlRotation,
  htmlOpacity,
  htmlBlendMode,
} from "./builderImpl/htmlBlend";
import {
  buildBackgroundValues,
  htmlColorFromFills,
} from "./builderImpl/htmlColor";
import { htmlPadding } from "./builderImpl/htmlPadding";
import { htmlSizePartial } from "./builderImpl/htmlSize";
import { htmlBorderRadius } from "./builderImpl/htmlBorderRadius";
import {
  commonIsAbsolutePosition,
  getCommonPositionValue,
} from "../common/commonPosition";
import {
  numberToFixedString,
} from "../common/utils/numToAutoFixed";
import { commonStroke } from "../common/commonStroke";
import {
  formatClassAttribute,
  formatDataAttribute,
  formatStyleAttribute,
} from "../common/commonFormatAttributes";
import { HTMLSettings } from "types";

/**
 * HTML默认构建器类
 * 用于处理各种节点的通用样式转换
 */
export class HtmlDefaultBuilder {
  styles: Array<string>; // 存储CSS样式
  data: Array<string>;   // 存储数据属性
  node: SceneNode;       // 当前处理的节点
  settings: HTMLSettings; // 插件设置

  // 获取节点名称（根据设置决定是否显示）
  get name() {
    return this.settings.showLayerNames ? this.node.name : "";
  }

  // 获取节点可见性
  get visible() {
    return this.node.visible;
  }

  constructor(node: SceneNode, settings: HTMLSettings) {
    this.node = node;
    this.settings = settings;
    this.styles = [];
    this.data = [];
  }

  /**
   * 添加通用位置相关样式
   */
  commonPositionStyles(): this {
    // console.log('[样式构建] 添加位置相关样式');
    this.size();
    this.autoLayoutPadding();
    this.position();
    this.blend();
    return this;
  }

  /**
   * 添加通用形状相关样式
   */
  commonShapeStyles(): this {
    // console.log('[样式构建] 添加形状相关样式');
    if ("fills" in this.node) {
      this.applyFillsToStyle(
        this.node.fills,
        this.node.type === "TEXT" ? "text" : "background",
      );
    }
    this.shadow();
    this.border();
    this.blur();
    return this;
  }

  /**
   * 添加样式到集合
   */
  addStyles = (...newStyles: string[]) => {
    const validStyles = newStyles.filter((style) => style);
    if (validStyles.length > 0) {
      // console.log('[样式构建] 添加样式:', validStyles);
      this.styles.push(...validStyles);
    }
  };

  /**
   * 处理混合模式相关样式
   */
  blend(): this {
    const { node } = this;
    // console.log('[样式构建] 处理混合模式');
    this.addStyles(
      htmlVisibility(node),
      ...htmlRotation(node as LayoutMixin),
      htmlOpacity(node as MinimalBlendMixin),
      htmlBlendMode(node as MinimalBlendMixin),
    );
    return this;
  }

  /**
   * 处理边框相关样式
   */
  border(): this {
    const { node } = this;
    // console.log('[样式构建] 处理边框样式');
    this.addStyles(...htmlBorderRadius(node));

    const commonBorder = commonStroke(node);
    if (!commonBorder) {
      // console.log('[样式构建] 无边框设置');
      return this;
    }

    const strokes = ("strokes" in node && node.strokes) || undefined;
    const color = htmlColorFromFills(strokes as any);
    if (!color) {
      // console.log('[样式构建] 无边框颜色');
      return this;
    }

    const borderStyle =
      "dashPattern" in node && node.dashPattern.length > 0 ? "dotted" : "solid";
    const strokeAlign = "strokeAlign" in node ? node.strokeAlign : "INSIDE";

    // 创建边框值字符串
    const consolidateBorders = (border: number): string =>
      [`${numberToFixedString(border)}px`, color, borderStyle]
        .filter((d) => d)
        .join(" ");

    if ("all" in commonBorder) {
      if (commonBorder.all === 0) {
        // console.log('[样式构建] 边框宽度为0，跳过');
        return this;
      }
      const weight = commonBorder.all;

      if (
        strokeAlign === "CENTER" ||
        strokeAlign === "OUTSIDE" ||
        node.type === "FRAME" ||
        node.type === "INSTANCE" ||
        node.type === "COMPONENT"
      ) {
        // console.log('[样式构建] 使用outline实现边框');
        this.addStyles(format("outline", consolidateBorders(weight)));
        if (strokeAlign === "CENTER") {
          this.addStyles(format("outline-offset", `${numberToFixedString(-weight / 2)}px`));
        } else if (strokeAlign === "INSIDE") {
          this.addStyles(format("outline-offset", `${numberToFixedString(-weight)}px`));
        }
      } else {
        // console.log('[样式构建] 使用标准border属性');
        this.addStyles(format("border", consolidateBorders(weight)));
      }
    } else {
      // console.log('[样式构建] 处理非均匀边框');
      if (commonBorder.left !== 0) {
        this.addStyles(format("border-left", consolidateBorders(commonBorder.left)));
      }
      if (commonBorder.top !== 0) {
        this.addStyles(format("border-top", consolidateBorders(commonBorder.top)));
      }
      if (commonBorder.right !== 0) {
        this.addStyles(format("border-right", consolidateBorders(commonBorder.right)));
      }
      if (commonBorder.bottom !== 0) {
        this.addStyles(format("border-bottom", consolidateBorders(commonBorder.bottom)));
      }
    }
    return this;
  }

  /**
   * 处理定位样式
   */
  position(): this {
    const { node } = this;
    const isAbsolutePosition = commonIsAbsolutePosition(node);
    // console.log(`[样式构建] 定位处理: ${isAbsolutePosition ? '绝对定位' : '相对定位'}`);

    if (isAbsolutePosition) {
      const { x, y } = getCommonPositionValue(node, this.settings);
      if(x && y) {
        this.addStyles(
          format("left", x),
          format("top", y),
          format("position", "absolute"),
        );
      } else if(y && !x) {
        this.addStyles(
          format("top", y),
          format("position", "absolute"),
        );
      } else if(x && !y) {
        this.addStyles(
          format("left", x),
          format("position", "absolute"),
        );
      } else {
        this.addStyles(format("position", "absolute"));
      }
    } else {
      if (node.type === "GROUP" || (node as any).isRelative) {
        this.addStyles(format("position", "relative"));
      }
    }

    return this;
  }

  /**
   * 应用填充样式
   */
  applyFillsToStyle(
    paintArray: ReadonlyArray<Paint> | PluginAPI["mixed"],
    property: "text" | "background",
  ): this {
    // console.log(`[样式构建] 应用填充样式: ${property}`);
    if (property === "text") {
      this.addStyles(format("color", htmlColorFromFills(paintArray as any)));
      return this;
    }

    const backgroundValues = buildBackgroundValues(paintArray as any);
    if (backgroundValues) {
      // console.log('[样式构建] 设置背景样式:', backgroundValues);
      this.addStyles(format("background", backgroundValues));

      if (paintArray !== figma.mixed) {
        const blendModes = this.buildBackgroundBlendModes(paintArray);
        if (blendModes) {
          // console.log('[样式构建] 设置背景混合模式:', blendModes);
          this.addStyles(format("background-blend-mode", blendModes));
        }
      }
    }

    return this;
  }

  /**
   * 构建背景混合模式
   */
  buildBackgroundBlendModes(paintArray: ReadonlyArray<Paint>): string {
    if (
      paintArray.length === 0 ||
      paintArray.every(
        (d) => d.blendMode === "NORMAL" || d.blendMode === "PASS_THROUGH",
      )
    ) {
      return "";
    }

    // console.log('[样式构建] 构建背景混合模式');
    const blendModes = [...paintArray].reverse().map((paint) => {
      if (paint.blendMode === "PASS_THROUGH") {
        return "normal";
      }
      return paint.blendMode?.toLowerCase();
    });

    return blendModes.join(", ");
  }

  /**
   * 处理阴影样式
   */
  shadow(): this {
    const { node } = this;
    if ("effects" in node) {
      const shadow = htmlShadow(node);
      if (shadow) {
        // console.log('[样式构建] 添加阴影样式:', shadow);
        this.addStyles(format("box-shadow", shadow));
      }
    }
    return this;
  }

  /**
   * 处理尺寸样式
   */
  size(): this {
    const { node } = this;
    // console.log('[样式构建] 处理尺寸样式');
    const { width, height, constraints } = htmlSizePartial(node);

    if (node.type === "TEXT") {
      switch (node.textAutoResize) {
        case "WIDTH_AND_HEIGHT":
          break;
        case "HEIGHT":
          this.addStyles(width);
          break;
        case "NONE":
        case "TRUNCATE":
          this.addStyles(width, height);
          break;
      }
    } else {
      this.addStyles(width, height);
    }

    if (constraints.length > 0) {
      // console.log('[样式构建] 添加尺寸约束:', constraints);
      this.addStyles(...constraints);
    }

    return this;
  }

  /**
   * 处理自动布局内边距
   */
  autoLayoutPadding(): this {
    const { node } = this;
    if ("paddingLeft" in node) {
      const paddingStyles = htmlPadding(node);
      // console.log('[样式构建] 添加内边距样式:', paddingStyles);
      this.addStyles(...paddingStyles);
    }
    return this;
  }

  /**
   * 处理模糊效果
   */
  blur() {
    const { node } = this;
    if ("effects" in node && node.effects.length > 0) {
      const blur = node.effects.find(
        (e) => e.type === "LAYER_BLUR" && e.visible,
      );
      if (blur) {
        this.addStyles(format("filter", `blur(${numberToFixedString(blur.radius / 2)}px)`));
      }

      const backgroundBlur = node.effects.find(
        (e) => e.type === "BACKGROUND_BLUR" && e.visible,
      );
      if (backgroundBlur) {
        this.addStyles(format("backdrop-filter", `blur(${numberToFixedString(backgroundBlur.radius / 2)}px)`));
      }
    }
  }

  /**
   * 添加数据属性
   */
  addData(label: string, value?: string): this {
    const attribute = formatDataAttribute(label, value);
    // console.log('[属性构建] 添加数据属性:', attribute);
    this.data.push(attribute);
    return this;
  }

  /**
   * 构建最终HTML属性字符串
   */
  build(additionalStyle: Array<string> = []): string {
    // console.log('[构建器] 开始构建最终HTML属性');
    this.addStyles(...additionalStyle);

    let classNames: string[] = [];
    if (this.name) {
      // console.log('[属性构建] 添加图层名称属性');
      this.addData("layer", this.name.trim());
    }

    if ("componentProperties" in this.node && this.node.componentProperties) {
      // console.log('[属性构建] 处理组件属性');
      Object.entries(this.node.componentProperties)
        ?.map((prop) => {
          if (prop[1].type === "VARIANT" || prop[1].type === "BOOLEAN") {
            const cleanName = prop[0]
              .split("#")[0]
              .replace(/\s+/g, "-")
              .toLowerCase();
            return formatDataAttribute(cleanName, String(prop[1].value));
          }
          return "";
        })
        .filter(Boolean)
        .sort()
        .forEach((d) => this.data.push(d));
    }

    const dataAttributes = this.data.join("");
    const classAttribute = formatClassAttribute(classNames);
    const styleAttribute = formatStyleAttribute(this.styles);

    // console.log('[构建器] 构建完成', {
    //   dataAttributes,
    //   classAttribute,
    //   styleAttribute
    // });

    return `${dataAttributes}${classAttribute}${styleAttribute}`;
  }
}
