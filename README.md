# Dialog Replace - Claude Code Skill

使用原生 HTML `<dialog>` 元素取代傳統 JavaScript 對話框的 Claude Code Skill 資源庫。

## 專案說明

本專案提供 Claude Code Skill 的 assets（資源檔案）與 references（參考文件），用於建構現代化網頁對話框介面。完全取代傳統的 `window.alert()`、`window.confirm()`、`window.prompt()` 及第三方 modal 套件。

## 目錄結構

```
.claude/skills/dialog-replace/
├── SKILL.md                    # Skill 主文件
├── assets/                     # 資源檔案
│   ├── dialog-api.js           # ES Module API
│   ├── dialog-api-global.js    # Global API（IIFE 版本）
│   ├── demo.html               # Bootstrap (CommonJS)
│   ├── demo-esm.html           # Bootstrap (ES Module)
│   ├── demo-vue.html           # Bootstrap (Vue 3)
│   ├── demo2.html              # Tailwind CSS (CommonJS)
│   ├── demo2-esm.html          # Tailwind CSS (ES Module)
│   ├── demo-vue2.html          # Tailwind CSS (Vue 3)
│   ├── demo3.html              # Shoelace (CommonJS)
│   ├── demo3-esm.html          # Shoelace (ES Module)
│   ├── demo-vue3.html          # Shoelace (Vue 3)
│   ├── demo.css                # Bootstrap 樣式
│   ├── demo2.css               # Tailwind CSS 樣式
│   ├── demo3.css               # Shoelace 樣式
│   └── vue/                    # Vue 元件
│       ├── useDialog.js        # Composable hook
│       └── DialogContainer.js  # Dialog 容器元件
└── references/                 # 參考文件
    ├── demo-bootstrap.md       # Bootstrap 使用指南
    ├── demo-tailwind.md        # Tailwind CSS 使用指南
    └── demo-shoelace.md        # Shoelace 使用指南
```

## 支援的 CSS 框架

| 框架 | 說明 | 使用指南 |
|------|------|----------|
| Bootstrap 5 | 適合已使用 Bootstrap 的專案 | `demo-bootstrap.md` |
| Tailwind CSS | 適合使用 Tailwind 的專案 | `demo-tailwind.md` |
| Shoelace | 適合使用 Web Components 的專案 | `demo-shoelace.md` |

## 支援的 JavaScript 模式

| 模式 | 說明 | 適用情境 |
|------|------|----------|
| CommonJS / Global | 傳統 `<script>` 引入，使用 `var` 和 `.then()` | 不支援 ES Module 的環境 |
| ES Module | 使用 `import`/`export`，支援 `async`/`await` | 現代瀏覽器 |
| Vue 3 Composition API | 使用 Composable 模式 | Vue 3 專案 |

## Demo 檔案對照表

| CSS 框架 | CommonJS / Global | ES Module | Vue 3 |
|----------|-------------------|-----------|-------|
| Bootstrap | `demo.html` | `demo-esm.html` | `demo-vue.html` |
| Tailwind CSS | `demo2.html` | `demo2-esm.html` | `demo-vue2.html` |
| Shoelace | `demo3.html` | `demo3-esm.html` | `demo-vue3.html` |

## 核心功能

- 使用 HTML5 原生 `<dialog>` 元素
- Promise-based 非阻塞式 API
- 支援 Animate.css 動畫效果
- 符合 ARIA 無障礙規範
- 支援鍵盤導航

## API 總覽

### showAlert(message, type)

顯示訊息提示對話框。

```javascript
showAlert('操作成功', 'success');
showAlert('發生錯誤', 'error');
showAlert('系統通知', 'info');
```

### showConfirm(message, options)

顯示確認對話框，回傳 `Promise<boolean>`。

```javascript
const result = await showConfirm('確定要刪除嗎？', {
  type: 'danger',
  confirmText: '刪除',
  cancelText: '取消'
});
```

### showPrompt(message, options)

顯示輸入對話框，回傳 `Promise<string|null>`。

```javascript
const value = await showPrompt('請輸入名稱：', {
  defaultValue: '',
  placeholder: '輸入內容',
  validate: (v) => v ? null : '請輸入內容'
});
```

### showDialog(messageOrConfig, options)

顯示自定義對話框，支援多按鈕和清單選項。

```javascript
// 多按鈕選擇
const action = await showDialog('請選擇操作：', {
  title: '檔案操作',
  buttons: [
    { text: '下載', value: 'download', style: 'primary' },
    { text: '取消', value: 'cancel', style: 'secondary' }
  ]
});

// 清單選項
const lang = await showDialog('請選擇語言：', {
  type: 'list',
  options: [
    { text: '繁體中文', value: 'zh-TW' },
    { text: 'English', value: 'en' }
  ]
});
```

## 在 Claude Code 中使用

1. 將 `.claude/skills/dialog-replace/` 目錄複製到專案中
2. 當對話中提及 alert、confirm、prompt、modal、popup、對話框等關鍵詞時，skill 會自動啟用
3. Claude Code 會詢問 CSS 框架偏好及 JavaScript 模式
4. 根據選擇提供對應的程式碼和使用指南

## 技術規格

- HTML5 `<dialog>` 元素
- Animate.css 4.1.1 動畫
- 支援 Bootstrap 5.3、Tailwind CSS 3.x、Shoelace 2.20
- 支援 Vue 3 Composition API
- 無需 jQuery 或其他依賴

## 授權

MIT License
