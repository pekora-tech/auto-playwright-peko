import { type TestType } from "@playwright/test";

export { type Page } from "@playwright/test";

export type Test = TestType<any, any>;

export type StepOptions = {
  debug?: boolean;
  model?: string;
  provider?: 'openai' | 'deepseek' | 'claude' | 'ollama';
  aiApiKey?: string;
  aiBaseUrl?: string;
  aiDefaultQuery?: Record<string, any>;    
  aiDefaultHeaders?: Record<string, string>; 
};

export type TaskMessage = {
  task: string;
  snapshot: {
    dom: string;
  };
  options?: StepOptions;
};

export type TaskResult = {
  assertion?: boolean;
  query?: string;
  errorMessage?: string;
};
