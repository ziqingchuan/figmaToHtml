import { formatMultipleStyle, format } from "../common/utils/formatTool";
import { HtmlDefaultBuilder } from "./htmlDefaultBuilder";
import { htmlColorFromFills } from "./builderImpl/htmlColor";
import {
  commonLetterSpacing,
  commonLineHeight,
} from "../common/commonTextHeightSpacing";
import { HTMLSettings, StyledTextSegmentSubset } from "types";

/**
 * HTML文本构建器类，继承自HtmlDefaultBuilder
 * 用于处理文本节点的样式转换
 */
export class HtmlTextBuilder extends HtmlDefaultBuilder {
  constructor(node: TextNode, settings: HTMLSettings) {
    super(node, settings);
  }

  /**
   * 获取文本段落的样式和内容
   * @param node 文本节点
   * @returns 返回文本段落数组，包含样式、文本内容等
   */
  getTextSegments(node: TextNode): {
    style: string;
    text: string;
    openTypeFeatures: { [key: string]: boolean };
    className?: string;
    componentName?: string;
  }[] {
    // console.log('[文本处理] 开始处理文本段落');
    const segments = (node as any)
      .styledTextSegments as StyledTextSegmentSubset[];
    if (!segments) {
      // console.log('[文本处理] 无文本段落数据');
      return [];
    }

    return segments.map((segment) => {
      // console.log(`[文本处理] 处理段落: ${segment.characters.substring(0, 10)}...`);

      // 准备额外的CSS属性
      const additionalStyles: { [key: string]: string } = {};

      // 添加图层模糊效果
      const layerBlurStyle = this.getLayerBlurStyle();
      if (layerBlurStyle) {
        // console.log(`[文本处理] 添加模糊效果: ${layerBlurStyle}`);
        additionalStyles.filter = layerBlurStyle;
      }

      // 添加文本阴影效果
      const textShadowStyle = this.getTextShadowStyle();
      if (textShadowStyle) {
        // console.log(`[文本处理] 添加阴影效果: ${textShadowStyle}`);
        additionalStyles["text-shadow"] = textShadowStyle;
      }

      // 构建样式属性
      const styleAttributes = formatMultipleStyle(
        {
          color: htmlColorFromFills(segment.fills as any),
          "font-size": segment.fontSize,
          "font-family": "-apple-system, BlinkMacSystemFont, sans-serif",
          "font-style": this.getFontStyle(segment.fontName.style),
          "font-weight": `${segment.fontWeight}`,
          "text-decoration": this.textDecoration(segment.textDecoration),
          "text-transform": this.textTransform(segment.textCase),
          "line-height": this.lineHeight(segment.lineHeight, segment.fontSize),
          "letter-spacing": this.letterSpacing(
            segment.letterSpacing,
            segment.fontSize,
          ),
          "word-wrap": "break-word",
          ...additionalStyles,
        });

      // 处理换行符
      const charsWithLineBreak = segment.characters.split("\n").join("<br/>");

      const result: any = {
        style: styleAttributes,
        text: charsWithLineBreak,
        openTypeFeatures: segment.openTypeFeatures,
      };
      // console.log('[文本处理] 段落处理完成', result);
      return result;
    });
  }

  /**
   * 处理文本修剪（leadingTrim）
   */
  textTrim(): this {
    if ("leadingTrim" in this.node && this.node.leadingTrim === "CAP_HEIGHT") {
      // console.log('[文本处理] 应用文本修剪样式');
      this.addStyles(format("text-box-trim", "trim-both"));
      this.addStyles(format("text-box-edge", "cap alphabetic"));
    }
    return this;
  }

  /**
   * 转换文本装饰样式
   */
  textDecoration(textDecoration: TextDecoration): string {
    // console.log(`[文本处理] 转换文本装饰: ${textDecoration}`);
    switch (textDecoration) {
      case "STRIKETHROUGH":
        return "line-through";
      case "UNDERLINE":
        return "underline";
      case "NONE":
        return "";
    }
  }

  /**
   * 转换文本大小写样式
   */
  textTransform(textCase: TextCase): string {
    // console.log(`[文本处理] 转换文本大小写: ${textCase}`);
    switch (textCase) {
      case "UPPER":
        return "uppercase";
      case "LOWER":
        return "lowercase";
      case "TITLE":
        return "capitalize";
      case "ORIGINAL":
      case "SMALL_CAPS":
      case "SMALL_CAPS_FORCED":
      default:
        return "";
    }
  }

  /**
   * 计算字母间距
   */
  letterSpacing(letterSpacing: LetterSpacing, fontSize: number): number | null {
    const letterSpacingProp = commonLetterSpacing(letterSpacing, fontSize);
    if (letterSpacingProp > 0) {
      // console.log(`[文本处理] 字母间距: ${letterSpacingProp}`);
      return letterSpacingProp;
    }
    return null;
  }

  /**
   * 计算行高
   */
  lineHeight(lineHeight: LineHeight, fontSize: number): number | null {
    const lineHeightProp = commonLineHeight(lineHeight, fontSize);
    if (lineHeightProp > 0) {
      // console.log(`[文本处理] 行高: ${lineHeightProp}`);
      return lineHeightProp;
    }
    return null;
  }

  /**
   * 获取字体样式
   */
  getFontStyle(style: string): string {
    const isItalic = style.toLowerCase().match("italic");
    // console.log(`[文本处理] 字体样式: ${isItalic ? 'italic' : 'normal'}`);
    return isItalic ? "italic" : "";
  }

  /**
   * 设置水平对齐方式
   */
  textAlignHorizontal(): this {
    const node = this.node as TextNode;
    if (node.textAlignHorizontal && node.textAlignHorizontal !== "LEFT") {
      let textAlign = "";
      switch (node.textAlignHorizontal) {
        case "CENTER":
          textAlign = "center";
          break;
        case "RIGHT":
          textAlign = "right";
          break;
        case "JUSTIFIED":
          textAlign = "justify";
          break;
      }
      // console.log(`[文本处理] 水平对齐: ${textAlign}`);
      this.addStyles(format("text-align", textAlign));
    }
    return this;
  }

  /**
   * 设置垂直对齐方式
   */
  textAlignVertical(): this {
    const node = this.node as TextNode;
    if (node.textAlignVertical && node.textAlignVertical !== "TOP") {
      let alignItems = "";
      switch (node.textAlignVertical) {
        case "CENTER":
          alignItems = "center";
          break;
        case "BOTTOM":
          alignItems = "flex-end";
          break;
      }
      if (alignItems) {
        // console.log(`[文本处理] 垂直对齐: ${alignItems}`);
        this.addStyles(format("justify-content", alignItems));
        this.addStyles(format("display", "flex"));
        this.addStyles(format("flex-direction", "column"));
      }
    }
    return this;
  }

  /**
   * 获取图层模糊样式
   */
  private getLayerBlurStyle(): string {
    if (this.node && (this.node as TextNode).effects) {
      const effects = (this.node as TextNode).effects;
      const blurEffect = effects.find(
        (effect) =>
          effect.type === "LAYER_BLUR" && effect.visible &&
          effect.radius > 0,
      );
      // @ts-ignore
      if (blurEffect && blurEffect.radius) {
        // @ts-ignore
        const radius = blurEffect.radius;
        return `blur(${radius}px)`;
      }
    }
    return "";
  }

  /**
   * 获取文本阴影样式
   */
  private getTextShadowStyle(): string {
    if (this.node && (this.node as TextNode).effects) {
      const effects = (this.node as TextNode).effects;
      const dropShadow = effects.find(
        (effect) => effect.type === "DROP_SHADOW" && effect.visible,
      );
      if (dropShadow) {
        const ds = dropShadow as DropShadowEffect;
        const offsetX = Math.round(ds.offset.x);
        const offsetY = Math.round(ds.offset.y);
        const blurRadius = Math.round(ds.radius);
        const r = Math.round(ds.color.r * 255);
        const g = Math.round(ds.color.g * 255);
        const b = Math.round(ds.color.b * 255);
        const a = ds.color.a.toFixed(2);
        const shadow = `${offsetX}px ${offsetY}px ${blurRadius}px rgba(${r}, ${g}, ${b}, ${a})`;
        // console.log(`[文本处理] 文本阴影: ${shadow}`);
        return shadow;
      }
    }
    return "";
  }
}
