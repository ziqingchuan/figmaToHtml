import { generateSemanticClassName } from "./classNameGenerate";

interface Node {
  tag: 'div' | 'span' | 'img';
  content?: string;
  style: string;
  isSVG: boolean;
  SVGContent?: string;
  children: Node[];
  className: string;
  src?: string;
}

export const parseHTMLToNodes = (htmlString: string): Node[] => {
  let index = 0;
  const nodes: Node[] = [];

  // 用于跟踪父元素信息
  const parentStack: { tag: string; className: string }[] = [];

  function parse(): Node[] {
    const result: Node[] = [];
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

  function parseElement(): Node | null {
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
    const children: Node[] = [];

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

    // 生成语义化类名
    const className = generateSemanticClassName(tagName, style, content, parentInfo);

    return {
      tag: tagName as 'div' | 'span' | 'img',
      content: content || undefined,
      style,
      isSVG,
      SVGContent: SVGContent || undefined,
      children,
      className,
      src: src || undefined
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

