import { test } from '@playwright/test';
import { auto } from '../src/auto';

test('登入奇美醫院系統', async ({ page }) => {
    await page.goto('http://localhost:4200/login');
    
    await auto(
      "在 Username 欄位輸入 B30430，然後點擊登入按鈕", 
      { page },
      {
        provider: 'deepseek',
        model: 'deepseek-chat',
      }
    );
  });