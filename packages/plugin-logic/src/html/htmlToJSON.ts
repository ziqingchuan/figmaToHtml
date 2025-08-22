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

  // 主解析函数
  function parse(): Node[] {
    const result: Node[] = [];
    while (index < htmlString.length) {
      if (htmlString[index] === '<') {
        if (htmlString[index + 1] === '/') {
          // 结束标签
          index = htmlString.indexOf('>', index) + 1;
          return result;
        } else {
          // 开始标签
          const node = parseElement();
          if (node) result.push(node);
        }
      } else {
        // 文本内容
        index++;
      }
    }
    return result;
  }

  // 解析单个元素
  function parseElement(): Node | null {

    // 跳过 <
    index++;

    // 获取标签名
    const tagEnd = htmlString.indexOf(' ', index);
    const tagName = htmlString.slice(index, tagEnd).toLowerCase();
    index = tagEnd + 1;

    if (tagName !== 'div' && tagName !== 'span' && tagName !== 'img') {
      // 跳过非目标标签
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

      // 处理属性值
      const quoteChar = htmlString[index];
      index++;
      const attrValueEnd = htmlString.indexOf(quoteChar, index);
      const attrValue = htmlString.slice(index, attrValueEnd);
      index = attrValueEnd + 1;
      // console.log('name:', attrName, 'value:', attrValue)
      if (attrName.includes('style')) {
        style = attrValue;
      }
      if(attrName.includes('src')) {
        src = attrValue;
      }
      if (attrName.includes('data-svg-wrapper')) {
        isSVG = true;
      }
    }

    // 跳过 >
    index++;

    // 解析内容
    let content = '';
    let SVGContent = '';
    const children: Node[] = [];

    if (isSVG) {
      // 查找svg开始标签
      const svgStart = htmlString.indexOf('<svg', index);
      if (svgStart !== -1) {
        // 查找svg结束标签
        const svgEnd = htmlString.indexOf('</svg>', svgStart) + 6;
        SVGContent = htmlString.slice(svgStart, svgEnd);
        index = svgEnd;
      }
    }

    // 解析非SVG内容
    while (index < htmlString.length) {
      if (htmlString.startsWith('</', index)) {
        // 结束标签
        break;
      } else if (htmlString[index] === '<') {
        // 子元素
        const childNodes = parse();
        children.push(...childNodes);
      } else {
        // 文本内容
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

    // 清理内容
    content = content.trim();

    // @ts-ignore
    return {
      tag: tagName as 'div' | 'span',
      content: content || undefined,
      style,
      isSVG,
      SVGContent: SVGContent || undefined,
      children,
      className: `style-${Math.random().toString(36).substr(2, 9)}`,
      src: src || undefined
    };
  }

  // 处理根节点的所有子节点
  while (index < htmlString.length) {
    if (htmlString[index] === '<') {
      if (htmlString[index + 1] === '/') {
        // 跳过结束标签
        index = htmlString.indexOf('>', index) + 1;
      } else {
        // 解析元素
        const node = parseElement();
        if (node) nodes.push(node);
      }
    } else {
      index++;
    }
  }

  return nodes;
}
