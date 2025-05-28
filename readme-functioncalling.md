Function calling要從這個 `createActions.ts` 看，這是個**極度務實**的設計。讓我用表格拆解核心機制：

## 核心工作原理

| 組件                        | 作用                                     | 關鍵設計                                                       |
| --------------------------- | ---------------------------------------- | -------------------------------------------------------------- |
| **Function Registry** | 將瀏覽器操作包裝成 AI 可調用的函數       | 每個函數都有標準的 `function`、`parse`、`parameters`結構 |
| **Element ID System** | 用 UUID 標記頁面元素，避免 selector 失效 | `data-element-id`屬性 +`getLocator()`輔助函數              |
| **Zod Validation**    | 確保 AI 傳入的參數格式正確               | 每個函數都有對應的 schema 驗證                                 |

## 函數分類（按使用頻率排序）

| 類別              | 函數                               | 用途                             | 是否必需    |
| ----------------- | ---------------------------------- | -------------------------------- | ----------- |
| **🔍 定位** | `locateElement`                  | CSS 選擇器找元素，返回 elementId | ✅ 核心     |
|                   | `locateElementsByRole`           | 按 ARIA role 批量找元素          | ⚡ 常用     |
|                   | `locateElementsWithText`         | 按文字內容找元素                 | ⚡ 常用     |
| **🎯 互動** | `locator_click`                  | 點擊元素                         | ✅ 核心     |
|                   | `locator_fill`                   | 填入文字                         | ✅ 核心     |
|                   | `locator_selectOption`           | 選擇下拉選項                     | ⚡ 常用     |
| **📖 讀取** | `locator_innerText`              | 取得文字內容                     | ✅ 核心     |
|                   | `locator_inputValue`             | 取得輸入值                       | ⚡ 常用     |
|                   | `extractVisibleText`             | 只取可見文字（排除隱藏）         | 🛠️ 進階   |
| **🧭 導航** | `page_goto`                      | 跳轉網頁                         | ✅ 核心     |
|                   | `waitForContentToLoad`           | 等待動態內容載入                 | 🛠️ 進階   |
|                   | `waitForNetworkIdle`             | 等待網路請求完成                 | 🛠️ 進階   |
| **✅ 驗證** | `expect_toBe`/`expect_notToBe` | 斷言測試                         | 🔧 特定需求 |
|                   | `resultQuery`/`resultAction`   | 回傳最終結果                     | 🔧 特定需求 |

## 關鍵設計模式

```typescript
// 1. 統一的函數結構
{
  function: async (args) => { /* 實際操作 */ },
  name: "函數名稱",
  description: "AI 理解用的描述", 
  parse: (args) => { /* Zod 驗證 */ },
  parameters: { /* OpenAI function calling 格式 */ }
}

// 2. Element ID 追蹤系統
const elementId = randomUUID();
await locator.evaluate(
  (node, id) => node.setAttribute("data-element-id", id), 
  elementId
);
```

## 針對一個例子需求（例如醫院廁所問題）的最小實作

你只需要這  **8 個核心函數** ：

| 必需函數                   | 理由                                         |
| -------------------------- | -------------------------------------------- |
| `page_goto`              | 導航到目標網站                               |
| `locateElement`          | 定位頁面元素                                 |
| `locateElementsWithText` | 找包含特定文字的元素（如「廁所」「洗手間」） |
| `locator_click`          | 點擊連結或按鈕                               |
| `locator_innerText`      | 讀取文字內容                                 |
| `extractVisibleText`     | 擷取整頁可見文字                             |
| `waitForContentToLoad`   | 處理動態載入                                 |
| `resultQuery`            | 回傳找到的答案                               |

## 實際工作流程

```
用戶問題：「台大醫院廁所在哪？」
↓
1. page_goto('https://www.ntuh.gov.tw')
2. locateElementsWithText('廁所') 或 locateElementsWithText('洗手間')
3. 如果找不到 → locateElement('搜尋框') → locator_fill('廁所位置')
4. locator_click('搜尋按鈕')
5. waitForContentToLoad('搜尋結果')
6. extractVisibleText('搜尋結果區域')
7. resultQuery('一樓大廳左側有公共廁所...')
```

 **核心思維** ：別想太複雜，就是**找→點→讀→回答**四步驟。這個設計最大的優點是**漸進式**的 - 你可以先實作 5 個基本函數，能用了再慢慢加其他功能。
