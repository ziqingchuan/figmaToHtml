import { HtmlNode } from "../../node_types";

export const parseNodesToHTML = (nodes: HtmlNode[], svgContentMap: any, styleContentMap: any, classNameMap: any): string => {

  // console.log("parseNodesToHTML接受到的数据：",nodes, svgContentMap, styleContentMap, classNameMap);
  // 收集所有样式用于生成style标签，使用className作为键
  const styleMap = new Map<string, string>();
  // console.log("parseNodesToHTML接受到的数据：",nodes, svgContentMap);
  // 递归生成HTML字符串，带缩进
  const generateHTML = (node: HtmlNode, depth: number = 0): string => {
    const { tag, content, styleID, isSVG, svgID, children, classID, src } = node;
    const indent = '  '.repeat(depth);

    // 将样式添加到映射表，使用className作为键
    if (styleID && classID) {
      styleMap.set(classNameMap[classID], styleContentMap[styleID]);
    }

    let html = `${indent}<${tag}`;

    // 添加class属性
    if (classID) {
      html += ` class="${classNameMap[classID]}"`;
    }

    if(src) {
      html += ` src="${src}"`;
    }

    // 添加data属性用于标识SVG包装器
    if (isSVG) {
      html += ' data-svg-wrapper="true"';
    }

    html += '>\n';

    // 添加SVG内容或普通内容
    if (isSVG && svgID) {
      // 对SVG内容进行缩进处理
      const content: string = svgContentMap[svgID];
      const svgLines = content.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (svgLines.length > 0) {
        const svgIndent = '  '.repeat(depth + 1);
        html += svgLines.map(line => `${svgIndent}${line}`).join('\n') + '\n';
      }
    } else if (content) {
      html += `${'  '.repeat(depth + 1)}${content}\n`;
      depth--; // 减少缩进
    }

    // 递归处理子节点
    if (children && children.length > 0) {
      html += children.map(child => generateHTML(child, depth + 1)).join('');
    }

    html += `${indent}</${tag}>\n`;

    return html;
  };

  // 生成所有节点的HTML
  const bodyHTML = nodes.map(node => generateHTML(node, 2)).join('');

  // 生成样式标签
  let styleHTML = '';
  if (styleMap.size > 0) {
    const styleRules = Array.from(styleMap.entries()).map(([className, style]) => {
      // 按分号分割样式属性，过滤空值，并确保以分号结尾
      const properties = style.split(';')
        .map(prop => prop.trim())
        .filter(prop => prop.length > 0)
        .map(prop => prop.endsWith(';') ? prop : prop + ';');

      // 每个属性单独一行
      const formattedProperties = properties.map(prop => `      ${prop}`).join('\n');

      return `    .${className} {\n${formattedProperties}\n    }`;
    }).join('\n\n');

    styleHTML = `  <style>\n    [data-svg-wrapper] svg {\n      vertical-align: top;\n    }\n${styleRules}\n  </style>\n`;
  }
  // 组合成完整HTML文档
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
${styleHTML}</head>
<body>
${bodyHTML}</body>
</html>`;
};
