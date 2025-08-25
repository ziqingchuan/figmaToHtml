import { HtmlNode } from "../../node_types";
export const DSTotal = async (nodes: HtmlNode[]): Promise<any> => {
  try {
    console.log("DeepSeekGen");
    // 1. 将body对象转换为JSON字符串
    const requestBody = JSON.stringify({
      model: "deepseek-chat",
      messages: [{
        role: "system",
        content: "你是一个专业的CSS类名生成专家。请为HTML元素生成语义化、有意义的类名，只返回JSON格式的结果，不要添加任何解释性文字。"
      }, {
        role: "user",
        content: `请为以下JSON结构中的HTML元素生成有意义的类名，补全className字段, 不要修改任何其他字段。请确保返回的是完整的、有效的JSON数组，不要去掉任何字段，不要包含任何其他无关的内容：\n\n${JSON.stringify(nodes, null, 2)}`
      }],
      stream: false,
      temperature: 0.1, // 降低随机性，确保输出稳定
      // max_tokens: 4000  // 根据内容长度调整
    });

    console.log("发送请求到DeepSeek API...: ",  requestBody);
  //
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-46c6a183026741e0800814b267f0490a`
      },
      body: requestBody // 这里必须是字符串
    });
    console.log('API响应:', response);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log("API响应:", data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("API返回格式不正确");
    }

    const result = data.choices[0].message.content;
    console.log("原始响应内容:", result);

    // 处理返回的JSON字符串 - 可能包含代码块标记
    try {
      // 尝试提取JSON代码块中的内容
      const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : result.trim();

      const parsedResult = JSON.parse(jsonString);

      // 验证返回的是有效的HtmlNode数组
      if (Array.isArray(parsedResult) && parsedResult.every(item => item && typeof item === 'object')) {
        return parsedResult;
      } else {
        throw new Error("返回的数据不是有效的节点数组");
      }
    } catch (parseError) {
      console.error('JSON解析错误:', parseError);
      console.error('原始响应内容:', result);
      return nodes; // 解析失败时返回原始节点
    }
  } catch (error) {
    console.error('API调用失败:', error);
    return nodes; // 失败时返回原始节点
  }
}
