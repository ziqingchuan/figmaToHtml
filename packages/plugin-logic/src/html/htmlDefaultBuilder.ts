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

export class HtmlDefaultBuilder {
  styles: Array<string>;
  data: Array<string>;
  node: SceneNode;
  settings: HTMLSettings;

  get name() {
    return this.settings.showLayerNames ? this.node.name : "";
  }

  get visible() {
    return this.node.visible;
  }

  constructor(node: SceneNode, settings: HTMLSettings) {
    this.node = node;
    this.settings = settings;
    this.styles = [];
    this.data = [];
  }

  commonPositionStyles(): this {
    this.size();
    this.autoLayoutPadding();
    this.position();
    this.blend();
    return this;
  }

  commonShapeStyles(): this {
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

  addStyles = (...newStyles: string[]) => {
    this.styles.push(...newStyles.filter((style) => style));
  };

  blend(): this {
    const { node } = this;
    this.addStyles(
      htmlVisibility(node),
      // @ts-ignore
      ...htmlRotation(node as LayoutMixin),
      htmlOpacity(node as MinimalBlendMixin),
      htmlBlendMode(node as MinimalBlendMixin),
    );
    return this;
  }

  border(): this {
    const { node } = this;
    this.addStyles(...htmlBorderRadius(node));

    const commonBorder = commonStroke(node);
    if (!commonBorder) {
      return this;
    }

    const strokes = ("strokes" in node && node.strokes) || undefined;
    const color = htmlColorFromFills(strokes as any);
    if (!color) {
      return this;
    }
    const borderStyle =
      "dashPattern" in node && node.dashPattern.length > 0 ? "dotted" : "solid";

    const strokeAlign = "strokeAlign" in node ? node.strokeAlign : "INSIDE";

    // Function to create border value string
    const consolidateBorders = (border: number): string =>
      [`${numberToFixedString(border)}px`, color, borderStyle]
        .filter((d) => d)
        .join(" ");

    if ("all" in commonBorder) {
      if (commonBorder.all === 0) {
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
        this.addStyles(
          format("outline", consolidateBorders(weight)),
        );
        if (strokeAlign === "CENTER") {
          this.addStyles(
            format(
              "outline-offset",
              `${numberToFixedString(-weight / 2)}px`,
            ),
          );
        } else if (strokeAlign === "INSIDE") {
          this.addStyles(
            format(
              "outline-offset",
              `${numberToFixedString(-weight)}px`,
            ),
          );
        }
      } else {
        // Default: use regular border on autolayout + strokeAlign: inside
        this.addStyles(
          format("border", consolidateBorders(weight)),
        );
      }
    } else {
      // For non-uniform borders, always use individual border properties
      if (commonBorder.left !== 0) {
        this.addStyles(
          format(
            "border-left",
            consolidateBorders(commonBorder.left),
          ),
        );
      }
      if (commonBorder.top !== 0) {
        this.addStyles(
          format(
            "border-top",
            consolidateBorders(commonBorder.top),
          ),
        );
      }
      if (commonBorder.right !== 0) {
        this.addStyles(
          format(
            "border-right",
            consolidateBorders(commonBorder.right),
          ),
        );
      }
      if (commonBorder.bottom !== 0) {
        this.addStyles(
          format(
            "border-bottom",
            consolidateBorders(commonBorder.bottom),
          ),
        );
      }
    }
    return this;
  }

  position(): this {
    const { node } = this;
    const isAbsolutePosition = commonIsAbsolutePosition(node);
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

  applyFillsToStyle(
    paintArray: ReadonlyArray<Paint> | PluginAPI["mixed"],
    property: "text" | "background",
  ): this {
    if (property === "text") {
      this.addStyles(
        format(
          "text",
          htmlColorFromFills(paintArray as any),
        ),
      );
      return this;
    }

    const backgroundValues = buildBackgroundValues(paintArray as any);
    if (backgroundValues) {
      this.addStyles(format("background", backgroundValues));

      // Add blend mode property if multiple fills exist with different blend modes
      if (paintArray !== figma.mixed) {
        const blendModes = this.buildBackgroundBlendModes(paintArray);
        if (blendModes) {
          this.addStyles(
            format("background-blend-mode", blendModes),
          );
        }
      }
    }

    return this;
  }

  buildBackgroundBlendModes(paintArray: ReadonlyArray<Paint>): string {
    if (
      paintArray.length === 0 ||
      paintArray.every(
        (d) => d.blendMode === "NORMAL" || d.blendMode === "PASS_THROUGH",
      )
    ) {
      return "";
    }

    // Reverse the array to match the background order
    const blendModes = [...paintArray].reverse().map((paint) => {
      if (paint.blendMode === "PASS_THROUGH") {
        return "normal";
      }

      return paint.blendMode?.toLowerCase();
    });

    return blendModes.join(", ");
  }

  shadow(): this {
    const { node } = this;
    if ("effects" in node) {
      const shadow = htmlShadow(node);
      if (shadow) {
        this.addStyles(format("box-shadow", htmlShadow(node)));
      }
    }
    return this;
  }

  size(): this {
    const { node } = this;
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

    // Add constraints as separate styles
    if (constraints.length > 0) {
      this.addStyles(...constraints);
    }

    return this;
  }

  autoLayoutPadding(): this {
    const { node } = this;
    if ("paddingLeft" in node) {
      this.addStyles(...htmlPadding(node));
    }
    return this;
  }

  blur() {
    const { node } = this;
    if ("effects" in node && node.effects.length > 0) {
      const blur = node.effects.find(
        (e) => e.type === "LAYER_BLUR" && e.visible,
      );
      if (blur) {
        this.addStyles(
          format(
            "filter",
            // @ts-ignore
            `blur(${numberToFixedString(blur.radius / 2)}px)`,
          ),
        );
      }

      const backgroundBlur = node.effects.find(
        (e) => e.type === "BACKGROUND_BLUR" && e.visible,
      );
      if (backgroundBlur) {
        this.addStyles(
          format(
            "backdrop-filter",
            // @ts-ignore
            `blur(${numberToFixedString(backgroundBlur.radius / 2)}px)`,
          ),
        );
      }
    }
  }

  addData(label: string, value?: string): this {
    const attribute = formatDataAttribute(label, value);
    this.data.push(attribute);
    return this;
  }

  build(additionalStyle: Array<string> = []): string {
    this.addStyles(...additionalStyle);


    let classNames: string[] = [];
    if (this.name) {
      this.addData("layer", this.name.trim());

    }

    if ("componentProperties" in this.node && this.node.componentProperties) {
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

    // Class attributes
    const classAttribute = formatClassAttribute(classNames);

    // Style attribute
    const styleAttribute = formatStyleAttribute(this.styles);

    return `${dataAttributes}${classAttribute}${styleAttribute}`;
  }
}
