import { defineConfig } from "@playwright/test";
import dotenv from 'dotenv';
dotenv.config();

// 測試用 - 確認環境變數有載入
// console.log('DEEPSEEK_API_KEY 是否存在:', !!process.env.DEEPSEEK_API_KEY);

export default defineConfig({
  timeout: 90000,
  webServer: {
    command: "npm run start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
  },
  use: {
    headless: true,
    baseURL: "http://127.0.0.1:3000",
    ignoreHTTPSErrors: true,
  },
});
