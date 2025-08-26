// // @ts-nocheck
// const SEMANTIC_CONFIG = {
//   // 标签映射
//   tags: {
//     'div': ['container', 'wrapper', 'section', 'box', 'panel', 'group', 'block'],
//     'span': ['text', 'label', 'badge', 'inline', 'caption', 'title', 'desc'],
//     'img': ['image', 'icon', 'photo', 'picture', 'illustration', 'graphic']
//   },
//
//   // 样式特征映射
//   styles: {
//     // 布局相关
//     'absolute': ['absolute', 'positioned', 'overlay', 'floating'],
//     'relative': ['relative', 'positioned'],
//     'fixed': ['fixed', 'sticky', 'pinned'],
//     'flex': ['flex', 'flexbox', 'layout'],
//     'grid': ['grid', 'matrix', 'table'],
//     'block': ['block', 'visible'],
//     'hidden': ['hidden', 'invisible', 'collapsed'],
//
//     // 尺寸相关
//     'width': ['wide', 'full', 'narrow'],
//     'height': ['tall', 'short', 'auto'],
//     'auto': ['auto', 'fluid'],
//
//     // 颜色相关
//     'background': ['bg', 'background', 'filled'],
//     'color': ['colored', 'text'],
//     'white': ['light', 'bright'],
//     'black': ['dark', 'darkmode'],
//     '#F6F6F6': ['gray', 'lightgray'],
//     '#FA9E00': ['orange', 'accent', 'primary'],
//     '#FA6000': ['darkorange', 'highlight'],
//     '#1677FF': ['blue', 'primary', 'action'],
//     '#EEEEEE': ['lightgray', 'divider', 'border'],
//
//     // 边框相关
//     'border': ['bordered', 'outline', 'frame'],
//     'radius': ['rounded', 'curved', 'smooth'],
//
//     // 间距相关
//     'margin': ['spacing', 'margin'],
//     'padding': ['padding', 'inner-spacing'],
//
//     // 文字相关
//     'font-size': ['text', 'font'],
//     'font-weight': ['bold', 'light', 'regular'],
//     'text-align': ['center', 'left', 'right', 'justify']
//   },
//
//   // 内容关键词映射
//   contentKeywords: {
//     'button': ['btn', 'button', 'action'],
//     'submit': ['submit', 'confirm'],
//     'cancel': ['cancel', 'close'],
//     'login': ['login', 'signin'],
//     'sign': ['sign', 'register'],
//     'search': ['search', 'find'],
//     'menu': ['menu', 'navigation'],
//     'user': ['user', 'profile'],
//     'title': ['title', 'heading'],
//     'description': ['desc', 'description'],
//     'label': ['label', 'caption'],
//     'order': ['order', 'purchase'],
//     'payment': ['payment', 'checkout'],
//     'card': ['card', 'creditcard'],
//   },
//
//   // 位置映射
//   positions: {
//     'top': ['top', 'header', 'upper'],
//     'bottom': ['bottom', 'footer', 'lower'],
//     'left': ['left', 'sidebar', 'start'],
//     'right': ['right', 'end', 'sidebar'],
//     'center': ['center', 'middle', 'main']
//   }
// };
//
// // 工具函数 - 简易哈希
// function simpleHash(str: string): string {
//   let hash = 0;
//   for (let i = 0; i < str.length; i++) {
//     hash = ((hash << 5) - hash) + str.charCodeAt(i);
//     hash = hash & hash;
//   }
//   return Math.abs(hash).toString(36).slice(0, 4);
// }
//
// // 提取样式特征
// function extractStyleFeatures(style: string): string[] {
//   if (!style) return [];
//
//   const features: string[] = [];
//   const props = style.split(';').filter(Boolean);
//
//   props.forEach(prop => {
//     const [key, value] = prop.split(':').map(s => s.trim());
//     if (!key || !value) return;
//
//     // 处理布局属性
//     if (key === 'position') {
//       features.push(value);
//       if (value === 'absolute' || value === 'fixed') {
//         // 检查是否有位置属性
//         const hasPosition = props.some(p =>
//           p.includes('left:') || p.includes('right:') ||
//           p.includes('top:') || p.includes('bottom:')
//         );
//         if (hasPosition) features.push('positioned');
//       }
//     }
//
//     if (key === 'display') features.push(value);
//
//     // 处理颜色
//     if (key.includes('background') && !key.includes('image')) {
//       if (SEMANTIC_CONFIG.styles[value]) {
//         features.push(SEMANTIC_CONFIG.styles[value][0]);
//       } else if (value !== 'transparent') {
//         features.push('bg-colored');
//       }
//     }
//
//     if (key.includes('color') && !SEMANTIC_CONFIG.styles[value]) {
//       features.push('text-colored');
//     }
//
//     // 处理尺寸
//     if ((key === 'width' || key === 'height') && value !== 'auto') {
//       const numValue = parseInt(value);
//       if (!isNaN(numValue)) {
//         if (numValue > 200) features.push('large');
//         else if (numValue < 50) features.push('small');
//       }
//     }
//
//     // 处理边框
//     if (key.includes('border')) {
//       if (key === 'border-radius') features.push('rounded');
//       else features.push('bordered');
//     }
//
//     // 直接映射已知样式值
//     if (SEMANTIC_CONFIG.styles[value]) {
//       features.push(SEMANTIC_CONFIG.styles[value][0]);
//     }
//   });
//
//   return [...new Set(features)]; // 去重
// }
//
// // 提取内容特征
// function extractContentFeatures(content?: string): string[] {
//   if (!content) return [];
//
//   const features: string[] = [];
//   const contentLower = content.toLowerCase().trim();
//
//   // 检查内容关键词
//   Object.entries(SEMANTIC_CONFIG.contentKeywords).forEach(([keyword, variants]) => {
//     if (contentLower.includes(keyword)) {
//       features.push(variants[0]);
//     }
//   });
//
//   // 根据内容长度添加特征
//   if (contentLower.length < 10) features.push('short');
//   else if (contentLower.length > 50) features.push('long');
//
//   return features;
// }
//
// // 提取位置特征
// function extractPositionFeatures(style: string): string[] {
//   if (!style) return [];
//
//   const features: string[] = [];
//   const props = style.split(';').filter(Boolean);
//
//   props.forEach(prop => {
//     const [key, value] = prop.split(':').map(s => s.trim());
//     if (!key || !value) return;
//
//     if (key === 'left' || key === 'right' || key === 'top' || key === 'bottom') {
//       const position = key.replace(':', '');
//       features.push(position);
//
//       // 检查是否居中
//       if (key === 'left' || key === 'right') {
//         const left = props.find(p => p.includes('left:'))?.split(':')[1]?.trim();
//         const right = props.find(p => p.includes('right:'))?.split(':')[1]?.trim();
//         if (left && right && left === right) features.push('center-x');
//       }
//
//       if (key === 'top' || key === 'bottom') {
//         const top = props.find(p => p.includes('top:'))?.split(':')[1]?.trim();
//         const bottom = props.find(p => p.includes('bottom:'))?.split(':')[1]?.trim();
//         if (top && bottom && top === bottom) features.push('center-y');
//       }
//     }
//   });
//
//   return features;
// }
//
// // 生成语义化类名
// export const generateSemanticClassName = (
//   tagName: string,
//   styleID: string,
//   content?: string,
//   parentInfo?: { tag: string; className: string },
//   styleMap: { [key: string]: any }
// ): string => {
//   const parts: string[] = [];
//
//   // 1. 基于标签的语义
//   // @ts-ignore
//   const tagSemantic = SEMANTIC_CONFIG.tags[tagName]?.[0] || tagName;
//   parts.push(tagSemantic);
//
//   // 2. 基于样式的语义
//   const styleFeatures = extractStyleFeatures(styleMap[styleID]);
//   if (styleFeatures.length > 0) {
//     // 选择最相关的1-2个样式特征
//     const primaryStyle = styleFeatures[0];
//     if (primaryStyle && Math.random() > 0.3) {
//       parts.push(primaryStyle);
//     }
//
//     if (styleFeatures.length > 1 && Math.random() > 0.5) {
//       parts.push(styleFeatures[1]);
//     }
//   }
//
//   // 3. 基于位置的语义
//   const positionFeatures = extractPositionFeatures(styleMap[styleID]);
//   if (positionFeatures.length > 0 && Math.random() > 0.4) {
//     parts.push(positionFeatures[0]);
//   }
//
//   // 4. 基于内容的语义
//   const contentFeatures = extractContentFeatures(content);
//   if (contentFeatures.length > 0) {
//     // 内容特征优先度高，通常都加入
//     contentFeatures.forEach(feature => {
//       if (!parts.includes(feature)) {
//         parts.push(feature);
//       }
//     });
//   }
//
//   // 5. 基于父元素的上下文语义（如果提供）
//   if (parentInfo) {
//     const parentClassParts = parentInfo.className.split('-');
//     if (parentClassParts.length > 1 && Math.random() > 0.6) {
//       parts.push(parentClassParts[0] + '-child');
//     }
//   }
//
//   // 6. 确保唯一性但保持可读性
//   const uniqueSuffix = simpleHash(`${tagName}-${styleMap[styleID]}-${content || ''}`);
//
//   // 构建最终类名
//   let className = parts.join('-');
//
//   // 如果类名太长，进行优化
//   if (className.length > 20) {
//     const importantParts = parts.filter(part =>
//       !['container', 'wrapper', 'box', 'text', 'label'].includes(part)
//     );
//     className = importantParts.length > 0
//       ? importantParts.join('-')
//       : parts.slice(0, 2).join('-');
//   }
//
//   // 添加唯一后缀
//   return `${className}-${uniqueSuffix}`;
// }
