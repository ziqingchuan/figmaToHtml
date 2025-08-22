import { commonPadding } from "../../common/commonPadding";
import { format } from "../../common/formatTool";

export const htmlPadding = (node: InferredAutoLayoutResult): string[] => {
  const padding = commonPadding(node);
  if (padding === null) {
    return [];
  }

  if ("all" in padding) {
    if (padding.all !== 0) {
      return [format("padding", padding.all)];
    } else {
      return [];
    }
  }

  let comp: string[] = [];

  // horizontal and vertical, as the default AutoLayout
  if ("horizontal" in padding) {
    if (padding.horizontal !== 0) {
      comp.push(format("padding-left", padding.horizontal));
      comp.push(format("padding-right", padding.horizontal));
    }
    if (padding.vertical !== 0) {
      comp.push(format("padding-top", padding.vertical));
      comp.push(format("padding-bottom", padding.vertical));
    }
    return comp;
  }

  if (padding.top !== 0) {
    comp.push(format("padding-top", padding.top));
  }
  if (padding.bottom !== 0) {
    comp.push(format("padding-bottom", padding.bottom));
  }
  if (padding.left !== 0) {
    comp.push(format("padding-left", padding.left));
  }
  if (padding.right !== 0) {
    comp.push(format("padding-right", padding.right));
  }
  // todo use REM

  return comp;
};
