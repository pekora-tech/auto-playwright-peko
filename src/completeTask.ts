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

  // 建立 API 配置
  let apiConfig: any = {};

  // 處理 API Key
  if (task.options?.aiApiKey) {
    apiConfig.apiKey = task.options.aiApiKey;
  } else {
    // 根據 provider 尋找環境變數
    switch (provider) {
      case 'deepseek':
        apiConfig.apiKey = process.env.DEEPSEEK_API_KEY;
        break;
      case 'openai':
        apiConfig.apiKey = process.env.OPENAI_API_KEY;
        break;
      case 'ollama':
        apiConfig.apiKey = 'ollama'; // Ollama 不需要真的 key
        apiConfig.baseURL = task.options?.aiBaseUrl || 'http://localhost:11434/v1';
        break;
      default:
        apiConfig.apiKey = process.env.OPENAI_API_KEY;
    }
  }

  // 設定 base URL
  if (task.options?.aiBaseUrl) {
    apiConfig.baseURL = task.options.aiBaseUrl;
  } else {
    switch (provider) {
      case 'deepseek':
        apiConfig.baseURL = 'https://api.deepseek.com';
        break;
      // OpenAI 使用預設值
    }
  }

  // 其他選項
  if (task.options?.aiDefaultQuery) {
    apiConfig.defaultQuery = task.options.aiDefaultQuery;
  }
  if (task.options?.aiDefaultHeaders) {
    apiConfig.defaultHeaders = task.options.aiDefaultHeaders;
  }

  const openai = new OpenAI(apiConfig);

  let lastFunctionResult: null | { errorMessage: string } | { query: string } =
    null;

  const actions = createActions(page);
  const debug = task.options?.debug ?? defaultDebug;

  // 根據 provider 選擇預設模型
  const defaultModel = provider === 'deepseek' ? 'deepseek-chat' : provider === 'ollama' ? 'llama3:latest' :  'gpt-4o';
  const model = task.options?.model ?? defaultModel;

  const runner = openai.beta.chat.completions
    .runTools({
      model,
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