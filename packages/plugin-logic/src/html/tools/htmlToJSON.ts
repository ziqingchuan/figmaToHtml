import { generateSemanticClassName } from "./localGenerate";
import { DSSingle } from "./DeepSeekSingle";
import { cozeGenSingle } from "./cozeForSingle";
import { HtmlNode } from "../../node_types";

export const parseHTMLToNodes = (htmlString: string, useAI: boolean): any => {
  let index = 0;
  const nodes: HtmlNode[] = [];
  let svgContentIndex = 1;
  let styleIndex = 1;
  let classNameIndex = 1;
  let svgContentMap: { [key: string]: string } = {};
  let styleMap: { [key: string]: string } = {};
  let classNameMap: { [key: string]: string } = {};
  // 用于跟踪父元素信息
  const parentStack: { tag: string; classID: string }[] = [];

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
              parentStack.push({ tag: node.tag, classID: node.classID });
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
    let styleID = '';
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

      if (attrName.includes('style')) {
        styleID = styleIndex.toString();
        styleIndex++;
        styleMap[styleID] = attrValue;
      }
      if (attrName.includes('src')) src = attrValue;
      if (attrName.includes('data-svg-wrapper')) isSVG = true;
    }

    index++;

    // 解析内容
    let content = '';
    let svgID = '';
    const children: HtmlNode[] = [];

    if (isSVG) {
      const svgStart = htmlString.indexOf('<svg', index);
      if (svgStart !== -1) {
        const svgEnd = htmlString.indexOf('</svg>', svgStart) + 6;
        svgID = svgContentIndex.toString();
        svgContentIndex++;
        svgContentMap[svgID] = htmlString.slice(svgStart, svgEnd);
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

    let classID: string;
    classID = classNameIndex.toString();
    classNameIndex++;

    // if(!useAI){
    //   /** 人工生成类名 */
    //   className = generateSemanticClassName(tagName, styleID, content, parentInfo, styleMap);
    // }
      /** 调用AI单独为单个元素生成类名 */
      // const singleNode = {
      //   tag: tagName,
      //   style: style,
      //   content: content,
      //   isSVG: isSVG,
      //   parentInfo: parentInfo,
      //   children: children
      // }
      //
      // // console.log("节点信息：", singleNode);
      //
      // // const className = "";
      // let className = "";
      // DSSingle(singleNode).then(res => {
      //   className = res;
      //   // console.log("生成的语义化类名：", className);
      // });


    return {
      tag: tagName as 'div' | 'span' | 'img',
      styleID,
      isSVG,
      classID,
      ...(content ? { content } : {}),
      ...(src ? { src } : {}),
      ...(svgID ? { svgID } : {}),
      ...(children.length > 0 ? { children } : {})
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

  for (let i = 1; i < classNameIndex; i++) {
    classNameMap[i.toString()] = 'class-' + i.toString();
  }

  return {
    nodes,
    svgContentMap,
    styleMap,
    classNameMap
  };
};

