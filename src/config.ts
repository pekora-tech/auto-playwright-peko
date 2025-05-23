export const MAX_TASK_CHARS = 3000;


export const AI_PROVIDERS = {
    openai: {
      baseUrl: undefined, // 使用 SDK 預設值
      defaultModel: 'gpt-4o'
    },
    deepseek: {
      baseUrl: 'https://api.deepseek.com',
      defaultModel: 'deepseek-chat'
    },
    // 未來可以擴充
  } as const;