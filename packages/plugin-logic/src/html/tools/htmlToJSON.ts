import { generateSemanticClassName } from "../classNameGenerate";
import { DSSingle } from "./DeepSeekSingle";
import { cozeGenSingle } from "./cozeForSingle";
import { HtmlNode } from "../../node_types";

export const parseHTMLToNodes = (htmlString: string, useAI: boolean): HtmlNode[] => {
  let index = 0;
  const nodes: HtmlNode[] = [];

  // 用于跟踪父元素信息
  const parentStack: { tag: string; className: string }[] = [];

  function parse(): HtmlNode[] {
    const result: HtmlNode[] = [];
    while (index < htmlString.length) {
      if (htmlString[index] === '<') {
        if (htmlString[index + 1] === '/') {
          index = htmlString.indexOf('>', index) + 1;
          parentStack.pop(); // 弹出父元素
          return result;
        } else {
          const node = parseElement();
          if (node) {
            result.push(node);
            // 如果有子元素，推入父元素信息
            if (node.children && node.children.length > 0) {
              parentStack.push({ tag: node.tag, className: node.className });
            }
          }
        }
      } else {
        index++;
      }
    }
    return result;
  }

  function parseElement(): HtmlNode | null {
    index++;

    const tagEnd = htmlString.indexOf(' ', index);
    const tagName = htmlString.slice(index, tagEnd).toLowerCase();
    index = tagEnd + 1;

    if (tagName !== 'div' && tagName !== 'span' && tagName !== 'img') {
      index = htmlString.indexOf('>', index) + 1;
      return null;
    }

    // 解析属性
    let style = '';
    let isSVG = false;
    let src = '';
    while (index < htmlString.length && htmlString[index] !== '>') {
      const attrNameEnd = htmlString.indexOf('=', index);
      if (attrNameEnd === -1) break;

      const attrName = htmlString.slice(index, attrNameEnd).trim();
      index = attrNameEnd + 1;

      const quoteChar = htmlString[index];
      index++;
      const attrValueEnd = htmlString.indexOf(quoteChar, index);
      const attrValue = htmlString.slice(index, attrValueEnd);
      index = attrValueEnd + 1;

      if (attrName.includes('style')) style = attrValue;
      if (attrName.includes('src')) src = attrValue;
      if (attrName.includes('data-svg-wrapper')) isSVG = true;
    }

    index++;

    // 解析内容
    let content = '';
    let SVGContent = '';
    const children: HtmlNode[] = [];

    if (isSVG) {
      const svgStart = htmlString.indexOf('<svg', index);
      if (svgStart !== -1) {
        const svgEnd = htmlString.indexOf('</svg>', svgStart) + 6;
        SVGContent = htmlString.slice(svgStart, svgEnd);
        index = svgEnd;
      }
    }

    while (index < htmlString.length) {
      if (htmlString.startsWith('</', index)) {
        break;
      } else if (htmlString[index] === '<') {
        const childNodes = parse();
        children.push(...childNodes);
      } else {
        const textEnd = htmlString.indexOf('<', index);
        if (textEnd === -1) break;

        const text = htmlString.slice(index, textEnd).trim();
        if (text) {
          content += text + ' ';
          index = textEnd;
        } else {
          index = textEnd;
        }
      }
    }

    content = content.trim();

    // 获取父元素信息用于上下文语义
    const parentInfo = parentStack[parentStack.length - 1];

    // todo: 思考怎么处理

    let className = '';
    if(!useAI){
      /** 人工生成类名 */
      className = generateSemanticClassName(tagName, style, content, parentInfo);
    }
    /** 调用AI生成类名 */
    // const singleNode = {
    //   tag: tagName,
    //   style: style,
    //   content: content,
    //   isSVG: isSVG,
    //   parentInfo: parentInfo,
    //   children: children
    // }
    //
    // console.log("节点信息：", singleNode);
    //
    // // const className = "";
    // let className = "";
    // DSSingle(singleNode).then(res => {
    //   className = res;
    //   console.log("生成的语义化类名：", className);
    // });



    return {
      tag: tagName as 'div' | 'span' | 'img',
      style,
      isSVG,
      className,
      ...(content ? { content } : {}),
      ...(SVGContent ? { SVGContent } : {}),
      ...(src ? { src } : {}),
      ...(children.length > 0 ? { children } : {}) // 只有children非空时才包含
    };
  }

  while (index < htmlString.length) {
    if (htmlString[index] === '<') {
      if (htmlString[index + 1] === '/') {
        index = htmlString.indexOf('>', index) + 1;
      } else {
        const node = parseElement();
        if (node) nodes.push(node);
      }
    } else {
      index++;
    }
  }

  return nodes;
};
/** 异步函数版本 */
// export const parseHTMLToNodes = async (htmlString: string): Promise<HtmlNode[]> => {
//   let index = 0;
//   const nodes: HtmlNode[] = [];
//   const parentStack: { tag: string; className: string }[] = [];
//
//   async function parse(): Promise<HtmlNode[]> {
//     const result: HtmlNode[] = [];
//     while (index < htmlString.length) {
//       if (htmlString[index] === '<') {
//         if (htmlString[index + 1] === '/') {
//           index = htmlString.indexOf('>', index) + 1;
//           parentStack.pop();
//           return result;
//         } else {
//           const node = await parseElement(); // 改为异步
//           if (node) {
//             result.push(node);
//             if (node.children && node.children.length > 0) {
//               parentStack.push({ tag: node.tag, className: node.className });
//             }
//           }
//         }
//       } else {
//         index++;
//       }
//     }
//     return result;
//   }
//
//   async function parseElement(): Promise<HtmlNode | null> {
//     index++;
//     const tagEnd = htmlString.indexOf(' ', index);
//     const tagName = htmlString.slice(index, tagEnd).toLowerCase();
//     index = tagEnd + 1;
//
//     if (tagName !== 'div' && tagName !== 'span' && tagName !== 'img') {
//       index = htmlString.indexOf('>', index) + 1;
//       return null;
//     }
//
//     // 解析属性...
//     let style = '', isSVG = false, src = '';
//     while (index < htmlString.length && htmlString[index] !== '>') {
//       const attrNameEnd = htmlString.indexOf('=', index);
//       if (attrNameEnd === -1) break;
//       const attrName = htmlString.slice(index, attrNameEnd).trim();
//       index = attrNameEnd + 1;
//       const quoteChar = htmlString[index];
//       index++;
//       const attrValueEnd = htmlString.indexOf(quoteChar, index);
//       const attrValue = htmlString.slice(index, attrValueEnd);
//       index = attrValueEnd + 1;
//       if (attrName.includes('style')) style = attrValue;
//       if (attrName.includes('src')) src = attrValue;
//       if (attrName.includes('data-svg-wrapper')) isSVG = true;
//     }
//     index++;
//
//     // 解析内容...
//     let content = '', SVGContent = '';
//     const children: HtmlNode[] = [];
//     if (isSVG) {
//       const svgStart = htmlString.indexOf('<svg', index);
//       if (svgStart !== -1) {
//         const svgEnd = htmlString.indexOf('</svg>', svgStart) + 6;
//         SVGContent = htmlString.slice(svgStart, svgEnd);
//         index = svgEnd;
//       }
//     }
//
//     while (index < htmlString.length) {
//       if (htmlString.startsWith('</', index)) {
//         break;
//       } else if (htmlString[index] === '<') {
//         const childNodes = await parse(); // 改为异步
//         children.push(...childNodes);
//       } else {
//         const textEnd = htmlString.indexOf('<', index);
//         if (textEnd === -1) break;
//         const text = htmlString.slice(index, textEnd).trim();
//         if (text) content += text + ' ';
//         index = textEnd;
//       }
//     }
//     content = content.trim();
//
//     // 生成语义化类名（异步）
//     const singleNode = {
//       tag: tagName,
//       style,
//       content,
//       isSVG,
//       parentInfo: parentStack[parentStack.length - 1],
//       children
//     };
//
//     const className = await LiteGen(singleNode); // 等待异步生成类名
//     console.log("生成的语义化类名：", className);
//
//     return {
//       tag: tagName as 'div' | 'span' | 'img',
//       content: content || undefined,
//       style,
//       isSVG,
//       SVGContent: SVGContent || undefined,
//       children,
//       className,
//       src: src || undefined
//     };
//   }
//
//   while (index < htmlString.length) {
//     if (htmlString[index] === '<') {
//       if (htmlString[index + 1] === '/') {
//         index = htmlString.indexOf('>', index) + 1;
//       } else {
//         const node = await parseElement(); // 改为异步
//         if (node) nodes.push(node);
//       }
//     } else {
//       index++;
//     }
//   }
//
//   return nodes;
// };
