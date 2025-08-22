import { nodeSize } from "../../common/commonSize";
import { format } from "../../common/utils/formatTool";
import { isPreviewGlobal } from "../htmlMain";

export const htmlSizePartial = (
  node: SceneNode,
): { width: string; height: string; constraints: string[] } => {
  if (isPreviewGlobal && node.parent === undefined) {
    return {
      width: format("width", "100%"),
      height: format("height", "100%"),
      constraints: [],
    };
  }

  const size = nodeSize(node);
  const nodeParent = node.parent;

  let w = "";
  if (typeof size.width === "number") {
    w = format("width", size.width);
  } else if (size.width === "fill") {
    if (
      nodeParent &&
      "layoutMode" in nodeParent &&
      nodeParent.layoutMode === "HORIZONTAL"
    ) {
      w = format("flex", "1 1 0");
    } else {
      if (node.maxWidth) {
        w = format("width", "100%");
      } else {
        w = format("align-self", "stretch");
      }
    }
  }

  let h = "";
  if (typeof size.height === "number") {
    h = format("height", size.height);
  } else if (typeof size.height === "string") {
    if (
      nodeParent &&
      "layoutMode" in nodeParent &&
      nodeParent.layoutMode === "VERTICAL"
    ) {
      h = format("flex", "1 1 0");
    } else {
      if (node.maxHeight) {
        h = format("height", "100%");
      } else {
        h = format("align-self", "stretch");
      }
    }
  }

  // Handle min/max width/height constraints
  const constraints = [];

  if (node.maxWidth !== undefined && node.maxWidth !== null) {
    constraints.push(format("max-width", node.maxWidth));
  }

  if (node.minWidth !== undefined && node.minWidth !== null) {
    constraints.push(format("min-width", node.minWidth));
  }

  if (node.maxHeight !== undefined && node.maxHeight !== null) {
    constraints.push(format("max-height", node.maxHeight));
  }

  if (node.minHeight !== undefined && node.minHeight !== null) {
    constraints.push(format("min-height", node.minHeight));
  }

  // Return constraints separately instead of appending to width/height
  return {
    width: w,
    height: h,
    constraints: constraints,
  };
};
