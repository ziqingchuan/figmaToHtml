import { HtmlNode } from "../../node_types";

const COZE_API_WORKFLOW = 'https://api.coze.cn/v1/workflow/run'
const COZE_AUTH_TOKEN = 'pat_RTkeZFeltmUFokxt1VnncXKPbLpNbg5JcsmDj3guJYFAJJVDgl1FIyN9erb9INba'
const COZE_WORKFLOW_ID = '7542204795991654415' // 工作流ID，可在Coze控制台查看

/**
 * 调用Coze工作流（仅传入file_id参数）
 * @returns Promise<any> 工作流返回结果
 * @param html
 */
export const cozeGenSingle = async (html: any): Promise<string> => {
  try {
    console.log("调用Coze工作流, 参数：", html);
    const body = JSON.stringify({
      workflow_id: COZE_WORKFLOW_ID,
      parameters: {
        input: html,
      },
    });
    console.log("调用Coze工作流, 参数：", body);
    const response = await fetch(COZE_API_WORKFLOW, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COZE_AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: body,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `工作流调用失败: ${errorData.message || `HTTP ${response.status}`}`,
      );
    }

    const result = await response.json();
    console.log("Coze工作流调用成功，结果：", result);
    let parsedData;
    if (typeof result.data === "string") {
      try {
        parsedData = JSON.parse(result.data); // 将字符串解析为对象
        console.log("data 字段是字符串，尝试解析", parsedData);
      } catch (parseError: any) {
        throw new Error(`data 解析失败: ${parseError.message}`);
      }
    } else {
      // 如果 data 不是字符串，直接使用（兼容可能的格式变化）
      parsedData = result.data;
      console.log("data 字段不是字符串，直接使用", parsedData);
    }
    if (parsedData.output) {
      return parsedData.output;
    } else {
      throw new Error("解析后的数据中未找到 output 字段");
    }
  } catch (error) {
    console.error("Coze工作流调用失败:", error);
    throw error;
  }
};
