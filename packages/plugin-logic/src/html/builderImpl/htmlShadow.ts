import { htmlColor } from "./htmlColor";

/**
 * 生成节点的阴影CSS样式
 * @param node 具有混合效果的节点
 * @returns 返回box-shadow样式字符串（无阴影时返回空字符串）
 *
 * 支持阴影类型：
 * - 投影(DROP_SHADOW)
 * - 内阴影(INNER_SHADOW)
 * - 图层模糊(LAYER_BLUR)
 */
export const htmlShadow = (node: BlendMixin): string => {
  // console.log('[阴影处理] 开始处理节点阴影效果');

  // 测试环境下node.effects可能为undefined
  if (node.effects && node.effects.length > 0) {
    // console.log('[阴影处理] 节点包含效果属性');

    // 过滤出可见的阴影效果
    const shadowEffects = node.effects.filter(
      (d) =>
        (d.type === "DROP_SHADOW" ||
          d.type === "INNER_SHADOW" ||
          d.type === "LAYER_BLUR") &&
        d.visible,
    );

    if (shadowEffects.length > 0) {
      // console.log(`[阴影处理] 找到${shadowEffects.length}个阴影效果，使用第一个`);
      const shadow = shadowEffects[0];

      // 初始化阴影参数
      let x = 0;
      let y = 0;
      let blur = 0;
      let spread = "";
      let inner = "";
      let color = "";

      // 处理投影/内阴影
      if (shadow.type === "DROP_SHADOW" || shadow.type === "INNER_SHADOW") {
        // console.log('[阴影处理] 处理投影/内阴影效果');
        x = shadow.offset.x;
        y = shadow.offset.y;
        blur = shadow.radius;
        spread = shadow.spread ? `${shadow.spread}px ` : "";
        inner = shadow.type === "INNER_SHADOW" ? " inset" : "";
        color = htmlColor(shadow.color, shadow.color.a);

        // console.log(`[阴影处理] 阴影参数: x=${x}px, y=${y}px, blur=${blur}px, spread=${spread}, color=${color}`);
      }
      // 处理图层模糊
      else if (shadow.type === "LAYER_BLUR") {
        // console.log('[阴影处理] 处理图层模糊效果');
        x = shadow.radius;
        y = shadow.radius;
        blur = shadow.radius;
        // console.log(`[阴影处理] 模糊半径: ${blur}px`);
      }

      // 生成box-shadow样式字符串
      const boxShadow = `${x}px ${y}px ${blur}px ${spread}${color}${inner}`;
      // // console.log(`[阴影处理] 生成的box-shadow样式: ${boxShadow}`);
      return boxShadow;
    }
  }

  // console.log('[阴影处理] 节点无有效阴影效果');
  return "";
};
