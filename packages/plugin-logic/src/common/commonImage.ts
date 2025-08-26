import { AltNode, ExportableNode } from "types";
import { btoa } from "js-base64";
import { addWarning } from './commonWarning';
import { exportAsyncProxy } from "./utils/exportAsyncProxy";

// 占位图服务域名
export const PLACEHOLDER_IMAGE_DOMAIN = "https://placehold.co";

/**
 * 获取占位图URL
 * @param w 图片宽度
 * @param h 图片高度（可选，默认为宽度）
 * @returns 返回占位图URL字符串
 */
export const getPlaceholderImage = (w: number, h = -1) => {
  const _w = w.toFixed(0);
  const _h = (h < 0 ? w : h).toFixed(0);

  return `${PLACEHOLDER_IMAGE_DOMAIN}/${_w}x${_h}`;
};

// 判断填充类型是否为图片
const fillIsImage = ({ type }: Paint) => type === "IMAGE";

/**
 * 获取节点的图片填充
 * @param node 具有填充属性的节点
 * @returns 返回图片填充数组
 */
export const getImageFills = (node: MinimalFillsMixin): ImagePaint[] => {
  try {
    return (node.fills as ImagePaint[]).filter(fillIsImage);
  } catch (e) {
    console.error("[图片处理] 获取图片填充失败:", e);
    return [];
  }
};

/**
 * 检查节点是否有图片填充
 * @param node 节点对象
 * @returns 返回布尔值表示是否有图片填充
 */
export const nodeHasImageFill = (node: MinimalFillsMixin): Boolean =>
  getImageFills(node).length > 0;

/**
 * 将图片字节数组转换为Base64字符串
 * @param bytes 图片字节数组
 * @returns 返回Base64格式的图片字符串
 */
const imageBytesToBase64 = (bytes: Uint8Array): string => {
  // 将Uint8Array转换为二进制字符串
  const binaryString = bytes.reduce((data, byte) => {
    return data + String.fromCharCode(byte);
  }, "");

  // 编码为Base64字符串
  const b64 = btoa(binaryString);

  return `data:image/png;base64,${b64}`;
};

/**
 * 将节点导出为Base64格式的PNG图片
 * @param node 可导出的节点
 * @param excludeChildren 是否排除子节点
 * @returns 返回Base64图片字符串的Promise
 */
export const exportNodeAsBase64PNG = async <T extends ExportableNode>(
  node: AltNode<T>,
  excludeChildren: boolean,
) => {
  // 如果已有缓存，直接返回
  if (node.base64 !== undefined && node.base64 !== "") {
    // console.log("[图片导出] 使用缓存的Base64图片");
    return node.base64;
  }

  const n: ExportableNode = node;

  // 处理子节点可见性
  const temporarilyHideChildren =
    excludeChildren && "children" in n && n.children.length > 0;
  const parent = n as ChildrenMixin;
  const originalVisibility = new Map<SceneNode, boolean>();

  if (temporarilyHideChildren) {
    // console.log("[图片导出] 临时隐藏子节点");
    // 保存子节点原始可见状态
    parent.children.map((child: SceneNode) =>
      originalVisibility.set(child, child.visible),
    );
    // 临时隐藏所有子节点
    parent.children.forEach((child) => {
      child.visible = false;
    });
  }

  // 设置导出参数
  const exportSettings: ExportSettingsImage = {
    format: "PNG",
    constraint: { type: "SCALE", value: 1 },
  };

  // console.log("[图片导出] 开始导出PNG图片");
  const bytes = await exportAsyncProxy(n, exportSettings);

  // 恢复子节点可见性
  if (temporarilyHideChildren) {
    // console.log("[图片导出] 恢复子节点可见性");
    parent.children.forEach((child) => {
      child.visible = originalVisibility.get(child) ?? false;
    });
  }

  addWarning("部分图片已导出为Base64 PNG格式");
  // console.log("[图片导出] 图片导出成功，转换为Base64");

  // 转换为Base64并缓存结果
  const base64 = imageBytesToBase64(bytes);
  node.base64 = base64;
  return base64;
};
