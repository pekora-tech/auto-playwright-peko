import { test } from '@playwright/test';
import { auto } from '../src/auto';

test('登入奇美醫院系統', async ({ page }) => {
    await page.goto('http://localhost:4200/login');
    
    // 使用更簡單的方式來輸入使用者名稱
    await auto(
      "在 Username 欄位輸入 B30430", 
      { page },
      {
        provider: 'openai',
        model: 'gpt-4o',
      }
    );

    // 點擊登入按鈕
    await auto(
      "點擊登入按鈕",
      { page },
      {
        provider: 'openai',
        model: 'gpt-4o',
      }
    );
});