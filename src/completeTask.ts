import OpenAI from "openai";
import { type Page, TaskMessage, TaskResult } from "./types";
import { prompt, SYSTEM_PROMPT } from "./prompt";
import { createActions } from "./createActions";

const defaultDebug = process.env.AUTO_PLAYWRIGHT_DEBUG === "true";

export const completeTask = async (
  page: Page,
  task: TaskMessage,
): Promise<TaskResult> => {

  // 根據 provider 設定 API 配置
  const provider = task.options?.provider || 'openai';
  let apiConfig: any = {
    apiKey: task.options?.aiApiKey,
    baseURL: task.options?.aiBaseUrl,
    defaultQuery: task.options?.aiDefaultQuery,
    defaultHeaders: task.options?.aiDefaultHeaders,
  };

  // 根據不同 provider 設定預設值
  switch (provider) {
    case 'deepseek':
      apiConfig.baseURL = apiConfig.baseURL || 'https://api.deepseek.com';
      break;
    case 'openai':
      // OpenAI 使用預設值即可
      break;
    // 未來可以加入其他 provider
  }
  

  const openai = new OpenAI(apiConfig);

  let lastFunctionResult: null | { errorMessage: string } | { query: string } =
    null;

  const actions = createActions(page);

  const debug = task.options?.debug ?? defaultDebug;

  const runner = openai.beta.chat.completions
    .runTools({
      model: task.options?.model ?? "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        { role: "user", content: prompt(task) },
      ],
      tools: Object.values(actions).map((action) => ({
        type: "function",
        function: action,
      })),
    })
    .on("message", (message) => {
      if (debug) {
        console.log("> message", message);
      }

      if (
        message.role === "assistant" &&
        message.tool_calls &&
        message.tool_calls.length > 0 &&
        message.tool_calls[0].function.name.startsWith("result")
      ) {
        lastFunctionResult = JSON.parse(
          message.tool_calls[0].function.arguments,
        );
      }
    });

  const finalContent = await runner.finalContent();

  if (debug) {
    console.log("> finalContent", finalContent);
  }

  if (!lastFunctionResult) {
    throw new Error("Expected to have result");
  }

  if (debug) {
    console.log("> lastFunctionResult", lastFunctionResult);
  }

  return lastFunctionResult;
};
