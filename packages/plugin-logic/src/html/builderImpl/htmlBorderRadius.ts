import { getCommonRadius } from "../../common/commonRadius";
import { format } from "../../common/utils/formatTool";

/**
 * 生成边框圆角CSS样式
 * @param node 场景节点
 * @returns 返回包含圆角样式的字符串数组
 *
 * 处理逻辑：
 * 1. 对于裁剪内容的容器添加overflow: hidden
 * 2. 椭圆节点使用超大圆角值模拟
 * 3. 普通节点根据圆角设置生成对应样式
 */
export const htmlBorderRadius = (node: SceneNode): string[] => {
  // console.log('[边框圆角] 开始处理节点圆角样式');
  let comp: string[] = [];

  // 处理需要裁剪内容的容器
  if (
    "children" in node &&
    node.children.length > 0 &&
    "clipsContent" in node &&
    node.clipsContent
  ) {
    // console.log('[边框圆角] 添加overflow: hidden（裁剪子内容）');
    comp.push(format("overflow", "hidden"));
  }

  // 处理椭圆节点（使用超大圆角值模拟）
  if (node.type === "ELLIPSE") {
    // console.log('[边框圆角] 椭圆节点，使用超大圆角值');
    comp.push(format("border-radius", 9999));
    return comp;
  }

  // 获取标准化圆角值
  const radius = getCommonRadius(node);
  // console.log('[边框圆角] 获取到的圆角配置:', radius);

  // 处理统一圆角的情况
  if ("all" in radius) {
    if (radius.all === 0) {
      // console.log('[边框圆角] 无圆角设置，跳过生成');
      return comp;
    }
    // console.log(`[边框圆角] 统一圆角: ${radius.all}`);
    comp.push(format("border-radius", radius.all));
  }
  // 处理独立四角圆角的情况
  else {
    const cornerValues = [
      radius.topLeft,
      radius.topRight,
      radius.bottomRight,
      radius.bottomLeft,
    ];
    const cornerProperties = [
      "border-top-left-radius",
      "border-top-right-radius",
      "border-bottom-right-radius",
      "border-bottom-left-radius",
    ];

    // console.log('[边框圆角] 独立四角圆角值:', cornerValues);

    // 为每个非零圆角生成样式
    for (let i = 0; i < 4; i++) {
      if (cornerValues[i] > 0) {
        // console.log(`[边框圆角] 添加 ${cornerProperties[i]}: ${cornerValues[i]}`);
        comp.push(format(cornerProperties[i], cornerValues[i]));
      }
    }
  }

  // console.log('[边框圆角] 最终生成的样式:', comp);
  return comp;
};
