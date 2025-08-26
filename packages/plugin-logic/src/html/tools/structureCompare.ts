// import { HtmlNode } from "../../node_types";
//
// /**
//  * 检测两个节点数组结构是否一致（支持children可选）
//  * @param originalNodes 原始节点数组（HtmlNode[]）
//  * @param processedNodes 处理后的节点数组（可能不完整）
//  * @returns 如果结构一致返回true，否则false
//  */
// export const isStructureIdentical = (
//   originalNodes: HtmlNode[],
//   processedNodes: any[]
// ): boolean => {
//   // 基础类型检查
//   if (!Array.isArray(processedNodes)) {
//     console.warn("[结构比对] processedNodes不是数组");
//     return false;
//   }
//
//   if (originalNodes.length !== processedNodes.length) {
//     console.warn(`[结构比对] 节点数组长度不一致 (原始:${originalNodes.length} vs 处理:${processedNodes.length})`);
//     return false;
//   }
//
//   // 逐个节点比对
//   for (let i = 0; i < originalNodes.length; i++) {
//     const original = originalNodes[i];
//     const processed = processedNodes[i];
//
//     // 节点基础类型检查
//     if (typeof processed !== "object" || processed === null) {
//       console.warn(`[节点${i}] 不是有效对象`);
//       return false;
//     }
//
//     /* ----- 必须属性检查 ----- */
//     const requiredKeys: Array<keyof HtmlNode> = [
//       "tag",
//       "styleID",
//       "isSVG",
//       "classID"
//     ];
//
//     for (const key of requiredKeys) {
//       // 检查属性是否存在
//       if (!(key in processed)) {
//         console.warn(`[节点${i}] 缺少必须属性: ${key}`);
//         return false;
//       }
//
//       // 特殊检查tag枚举值
//       if (key === "tag" && !["div", "span", "img"].includes(processed[key])) {
//         console.warn(`[节点${i}] 非法tag值: ${processed[key]}`);
//         return false;
//       }
//
//       // 检查基础类型是否一致
//       if (typeof original[key] !== typeof processed[key]) {
//         console.warn(`[节点${i}] 属性${key}类型不匹配 (原始:${typeof original[key]} vs 处理:${typeof processed[key]})`);
//         return false;
//       }
//     }
//
//     /* ----- 可选属性检查 ----- */
//     const optionalKeys: Array<keyof HtmlNode> = [
//       "content",
//       "svgID",
//       "src",
//       "children"
//     ];
//
//     for (const key of optionalKeys) {
//       // 只有当原始节点存在该属性时才检查
//       if (key in original) {
//         // 处理后的节点必须包含该属性
//         if (!(key in processed)) {
//           console.warn(`[节点${i}] 缺少可选属性: ${key}`);
//           return false;
//         }
//
//         // children特殊处理
//         if (key === "children") {
//           // 检查是否是数组
//           if (!Array.isArray(processed.children)) {
//             console.warn(`[节点${i}] children不是数组`);
//             return false;
//           }
//
//           // 递归检查子节点结构
//           if (!isStructureIdentical(original.children || [], processed.children)) {
//             console.warn(`[节点${i}] 子节点结构不一致`);
//             return false;
//           }
//         }
//         // 其他可选属性类型检查
//         else if (typeof original[key] !== typeof processed[key]) {
//           console.warn(`[节点${i}] 属性${key}类型不匹配 (原始:${typeof original[key]} vs 处理:${typeof processed[key]})`);
//           return false;
//         }
//       }
//     }
//
//     /* ----- 反向检查 ----- */
//     // 确保processedNodes没有多余属性
//     const processedKeys = Object.keys(processed);
//     const validKeys = [...requiredKeys, ...optionalKeys];
//     for (const key of processedKeys) {
//       if (!validKeys.includes(key as keyof HtmlNode)) {
//         console.warn(`[节点${i}] 存在非法属性: ${key}`);
//         return false;
//       }
//     }
//   }
//
//   return true;
// };
