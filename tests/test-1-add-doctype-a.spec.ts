import { test } from '@playwright/test';
import { auto } from '../src/auto';

test('創稿-測試簽呈創建', async ({ page }) => {
  await page.goto('http://localhost:4200/login');

  await auto(
    "在 Username 欄位輸入 B30430，然後點擊登入按鈕",
    { page },
    {
      provider: 'deepseek',
      model: 'deepseek-chat',
    }
  );

  await auto(
    "進入頁面 http://localhost:4200/home/draft-create",
    { page },
    {
      provider: 'deepseek',
      model: 'deepseek-chat',
    }
  );

  await auto(
    "主旨、說明 與 擬辦 欄位輸入 測試-test-1-add-doctype-a 最後標上今日日期與時間",
    { page },
    {
      provider: 'deepseek',
      model: 'deepseek-chat',
    }
  );

  await auto(
    "點擊 暫存 按鈕",
    { page },
    {
      provider: 'deepseek',
      model: 'deepseek-chat',
    }
  );


});