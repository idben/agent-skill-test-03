---
name: dialog-replace
description: 使用 HTML `<dialog>` 元素建構現代化網頁互動介面。當使用者提及 alert、confirm、prompt、modal、popup、對話框、彈出視窗、訊息框、確認框、輸入框時自動使用。完全取代傳統的 window.alert()、window.confirm()、window.prompt() 及第三方 modal 套件。提供一致性、無障礙性的 UI 解決方案。
---

# Dialog Replace

使用原生 HTML `<dialog>` 元素取代傳統 JavaScript 對話框函數。

## When to use this skill

當使用者在 web 類 UI 或專案中提及以下關鍵詞時自動啟用：
- `alert`、`confirm`、`prompt`
- `dialog`、`modal`、`popup`
- 對話框、彈出視窗、訊息框、確認框、輸入框

## 使用前必須詢問

**重要**：在開始實作前，必須先詢問使用者以下兩個問題：

### 問題 1：CSS 框架風格

```
請問您想使用哪種 CSS 框架風格？
1. Bootstrap - 適合已使用 Bootstrap 的專案
2. Tailwind CSS - 適合使用 Tailwind 的專案
3. Shoelace - 適合使用 Web Components 的專案
```

### 問題 2：JavaScript 模式

```
請問您想使用哪種 JavaScript 模式？
1. CommonJS / Global - 傳統 <script> 引入，使用 var 和 .then()
2. ES Module - 使用 import/export，支援 async/await
3. Vue 3 Composition API - 適合 Vue 3 專案，使用 Composable
```

### 對應檔案

根據使用者選擇的組合，參考對應的使用指南和 demo 檔案：

| CSS 框架 | 使用指南 |
|----------|----------|
| Bootstrap | [[demo-bootstrap.md]] |
| Tailwind CSS | [[demo-tailwind.md]] |
| Shoelace | [[demo-shoelace.md]] |

| CSS 框架 | CommonJS / Global | ES Module | Vue 3 |
|----------|-------------------|-----------|-------|
| Bootstrap | `demo.html` | `demo-esm.html` | `demo-vue.html` |
| Tailwind CSS | `demo2.html` | `demo2-esm.html` | `demo-vue2.html` |
| Shoelace | `demo3.html` | `demo3-esm.html` | `demo-vue3.html` |

## 核心原則

1. **完全取代傳統方法**：不使用 `window.alert()`、`window.confirm()`、`window.prompt()`
2. **不依賴第三方套件**：不使用 Bootstrap Modal、SweetAlert 等 modal 套件
3. **原生 `<dialog>` 優先**：使用 HTML5 原生 `<dialog>` 元素
4. **非阻塞式設計**：使用 Promise-based API，不阻塞主線程
5. **無障礙性**：符合 ARIA 規範，支援鍵盤導航

## 資源檔案

### 依 CSS 框架選擇

| CSS 框架 | 使用指南 | 適用情境 |
|----------|----------|----------|
| Bootstrap | [[demo-bootstrap.md]] | 使用 Bootstrap 5.x 的專案 |
| Tailwind CSS | [[demo-tailwind.md]] | 使用 Tailwind CSS 的專案 |
| Shoelace | [[demo-shoelace.md]] | 使用 Shoelace Web Components 的專案 |

### 核心 API 檔案

| 檔案 | 說明 | 使用方式 |
|------|------|----------|
| `dialog-api.js` | ES Module 版本 | `import { showAlert } from './dialog-api.js'` |
| `dialog-api-global.js` | 全域物件版本 | `<script src="dialog-api-global.js">` 後使用 `DialogAPI` |

### Demo 檔案總覽

#### Bootstrap 樣式
| 檔案 | JavaScript 模式 |
|------|----------------|
| `demo.html` | CommonJS / Global |
| `demo-esm.html` | ES Module |
| `demo-vue.html` | Vue 3 Composition API |

#### Tailwind CSS 樣式
| 檔案 | JavaScript 模式 |
|------|----------------|
| `demo2.html` | CommonJS / Global |
| `demo2-esm.html` | ES Module |
| `demo-vue2.html` | Vue 3 Composition API |

#### Shoelace 樣式
| 檔案 | JavaScript 模式 |
|------|----------------|
| `demo3.html` | CommonJS / Global |
| `demo3-esm.html` | ES Module |
| `demo-vue3.html` | Vue 3 Composition API |

## 快速開始

### 步驟 1：選擇 CSS 框架

根據專案使用的 CSS 框架，參考對應的使用指南：
- Bootstrap → [[demo-bootstrap.md]]
- Tailwind CSS → [[demo-tailwind.md]]
- Shoelace → [[demo-shoelace.md]]

### 步驟 2：複製必要檔案

從 `assets/` 目錄複製：
1. **CSS 檔案**：`demo.css`（Bootstrap）、`demo2.css`（Tailwind）、`demo3.css`（Shoelace）
2. **JS 檔案**：`dialog-api-global.js`（CommonJS）或 `dialog-api.js`（ES Module）
3. **HTML 結構**：從對應的 demo 檔案複製 Dialog HTML 結構

### 步驟 3：初始化 API

```javascript
// CommonJS / Global 版本
DialogAPI.init({
  dialogs: {
    alert: document.querySelector('#alertDialog'),
    confirm: document.querySelector('#confirmDialog'),
    prompt: document.querySelector('#promptDialog'),
    custom: document.querySelector('#customDialog')
  },
  adapter: yourAdapter // 根據 CSS 框架選擇適配器
});

var showAlert = DialogAPI.showAlert;
var showConfirm = DialogAPI.showConfirm;
var showPrompt = DialogAPI.showPrompt;
var showDialog = DialogAPI.showDialog;
```

## API 參考

### showAlert(message, type)

顯示訊息提示對話框。

```javascript
showAlert('操作成功！', 'success');
showAlert('發生錯誤', 'error');
showAlert('系統通知', 'info');
```

| 參數 | 類型 | 說明 |
|-----|------|------|
| message | string | 訊息內容 |
| type | string | `'success'`、`'error'`、`'info'` |

### showConfirm(message, options)

顯示確認對話框，回傳 `Promise<boolean>`。

```javascript
var result = await showConfirm('確定要刪除嗎？', {
  type: 'danger',
  confirmText: '刪除',
  cancelText: '取消'
});

if (result) {
  // 使用者點擊確認
}
```

| 選項 | 類型 | 說明 |
|-----|------|------|
| type | string | `'default'` 或 `'danger'` |
| confirmText | string | 確認按鈕文字 |
| cancelText | string | 取消按鈕文字 |

### showPrompt(message, options)

顯示輸入對話框，回傳 `Promise<string|null>`。

```javascript
var email = await showPrompt('請輸入 Email：', {
  placeholder: 'example@mail.com',
  defaultValue: '',
  validate: function(value) {
    if (!value) return '請輸入內容';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Email 格式不正確';
    }
    return null;
  }
});
```

| 選項 | 類型 | 說明 |
|-----|------|------|
| defaultValue | string | 預設值 |
| placeholder | string | 輸入框提示文字 |
| validate | function | 驗證函數，回傳錯誤訊息或 `null` |

### showDialog(messageOrConfig, options)

顯示自定義對話框，回傳 `Promise<string|null>`。

```javascript
// 多按鈕選擇
var action = await showDialog('請選擇操作：', {
  title: '檔案操作',
  buttons: [
    { text: '下載', value: 'download', style: 'primary' },
    { text: '刪除', value: 'delete', style: 'danger' },
    { text: '取消', value: 'cancel', style: 'light' }
  ]
});

// 清單選項
var lang = await showDialog('請選擇語言：', {
  title: '切換語言',
  type: 'list',
  options: [
    { text: '繁體中文', value: 'zh-TW' },
    { text: 'English', value: 'en' }
  ]
});
```

## 適配器範例

### Bootstrap 適配器

```javascript
var bootstrapAdapter = {
  createButton: function(text, style) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = text;
    btn.className = 'btn btn-' + (style || 'secondary');
    return btn;
  },
  setButtonStyle: function(btn, style) {
    btn.className = btn.className.replace(/btn-\w+/g, '').trim();
    btn.classList.add('btn', 'btn-' + style);
  },
  getInputValue: function(input) { return input.value; },
  setInputValue: function(input, value) { input.value = value; },
  setInputPlaceholder: function(input, placeholder) { input.placeholder = placeholder; },
  setInputLabel: function(label, text) { label.textContent = text; },
  focusInput: function(input) { input.focus(); if (input.select) input.select(); }
};
```

詳細適配器設定請參考各 CSS 框架的使用指南。

## 注意事項

- 使用 `showModal()` 而非 `show()` 以獲得 backdrop 和模態行為
- 按 Escape 鍵預設會關閉 dialog（已在 API 中攔截處理）
- 確保 `autofocus` 屬性設置在適當的元素上
- 所有 API 皆為 Promise-based，可使用 `async/await` 或 `.then()`
