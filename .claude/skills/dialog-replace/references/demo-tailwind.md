# Dialog Replace - Tailwind CSS 版本使用指南

本文件說明如何使用 Tailwind CSS 樣式搭配 Dialog Replace API，包含三種不同的 JavaScript 使用模式。

## 檔案總覽

| 檔案 | JavaScript 模式 | 適用情境 |
|------|----------------|---------|
| `demo2.html` | CommonJS / Global | 傳統網頁、不支援 ES Module 的環境 |
| `demo2-esm.html` | ES Module | 現代瀏覽器、支援 `type="module"` |
| `demo-vue2.html` | Vue 3 Composition API | Vue 3 專案 |

## 共同依賴

```html
<!-- Tailwind CSS CDN -->
<script src="https://cdn.tailwindcss.com"></script>
<!-- Animate.css -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" rel="stylesheet">
```

## Dialog HTML 結構

以下為必要的 Dialog HTML 元素，使用 Tailwind utility classes：

```html
<!-- Alert Dialog -->
<dialog id="alertDialog" class="rounded-lg">
  <div class="dialog-header flex items-center gap-3 px-4 pt-4 pb-2">
    <span class="dialog-icon text-2xl"></span>
    <h6 class="dialog-title text-lg font-semibold">提示</h6>
  </div>
  <div class="dialog-body px-4 pb-4">
    <p class="message text-gray-700"></p>
  </div>
  <div class="dialog-footer flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t border-gray-200">
    <button type="button" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors" autofocus>確定</button>
  </div>
</dialog>

<!-- Confirm Dialog -->
<dialog id="confirmDialog" class="rounded-lg">
  <div class="dialog-header flex items-center gap-3 px-4 pt-4 pb-2">
    <span class="dialog-icon text-2xl"></span>
    <h6 class="dialog-title text-lg font-semibold text-gray-800">確認</h6>
  </div>
  <div class="dialog-body px-4 pb-4">
    <p class="message text-gray-700"></p>
  </div>
  <div class="dialog-footer flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t border-gray-200">
    <button type="button" class="btn-cancel px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors">取消</button>
    <button type="button" class="btn-confirm px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors" autofocus>確定</button>
  </div>
</dialog>

<!-- Prompt Dialog -->
<dialog id="promptDialog" class="rounded-lg">
  <form method="dialog">
    <div class="dialog-header flex items-center gap-3 px-4 pt-4 pb-2">
      <span class="dialog-icon text-2xl"></span>
      <h6 class="dialog-title text-lg font-semibold text-gray-800">輸入</h6>
    </div>
    <div class="dialog-body px-4 pb-4">
      <label class="message block text-gray-700 mb-2"></label>
      <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" name="input" autofocus>
      <div class="error-message text-red-500 text-sm mt-1"></div>
    </div>
    <div class="dialog-footer flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t border-gray-200">
      <button type="button" class="btn-cancel px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors">取消</button>
      <button type="submit" class="btn-confirm px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors">確定</button>
    </div>
  </form>
</dialog>

<!-- Custom Dialog -->
<dialog id="customDialog" class="rounded-lg">
  <div class="dialog-header flex items-center gap-3 px-4 pt-4 pb-2">
    <span class="dialog-icon text-2xl"></span>
    <h6 class="dialog-title text-lg font-semibold text-gray-800"></h6>
  </div>
  <div class="dialog-body px-4 pb-4">
    <div class="dialog-content"></div>
  </div>
  <div class="dialog-footer flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t border-gray-200"></div>
</dialog>
```

---

## 按鈕樣式對照表

Tailwind CSS 按鈕樣式透過 `btnStyles` 物件管理：

```javascript
var btnStyles = {
  primary: 'px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors',
  secondary: 'px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors',
  danger: 'px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors',
  success: 'px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors',
  warning: 'px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors',
  light: 'px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors'
};
```

### Outline 按鈕（可選）

```javascript
var btnOutlineStyles = {
  primary: 'px-4 py-2 border border-blue-500 text-blue-500 hover:bg-blue-50 rounded-md transition-colors',
  danger: 'px-4 py-2 border border-red-500 text-red-500 hover:bg-red-50 rounded-md transition-colors',
  warning: 'px-4 py-2 border border-yellow-500 text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors',
  neutral: 'px-4 py-2 border border-gray-400 text-gray-600 hover:bg-gray-50 rounded-md transition-colors'
};
```

---

## 模式一：CommonJS / Global（demo2.html）

### 引入方式

```html
<link href="demo2.css" rel="stylesheet">
<script src="dialog-api-global.js"></script>
```

### Tailwind 適配器

```javascript
var tailwindAdapter = {
  createButton: function(text, style) {
    style = style || 'secondary';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = text;
    btn.className = btnStyles[style] || btnStyles.secondary;
    return btn;
  },
  setButtonStyle: function(btn, style) {
    btn.className = 'btn-confirm ' + (btnStyles[style] || btnStyles.primary);
  },
  getInputValue: function(input) { return input.value; },
  setInputValue: function(input, value) { input.value = value; },
  setInputPlaceholder: function(input, placeholder) { input.placeholder = placeholder; },
  setInputLabel: function(label, text) { label.textContent = text; },
  focusInput: function(input) {
    input.focus();
    if (input.select) input.select();
  }
};
```

### 初始化與使用

```javascript
DialogAPI.init({
  dialogs: {
    alert: document.querySelector('#alertDialog'),
    confirm: document.querySelector('#confirmDialog'),
    prompt: document.querySelector('#promptDialog'),
    custom: document.querySelector('#customDialog')
  },
  adapter: tailwindAdapter
});

var showAlert = DialogAPI.showAlert;
var showConfirm = DialogAPI.showConfirm;

// 使用範例
showAlert('操作成功！', 'success');

showConfirm('確定要刪除嗎？', {
  type: 'danger',
  confirmText: '刪除'
}).then(function(result) {
  if (result) {
    showAlert('已刪除', 'success');
  }
});
```

---

## 模式二：ES Module（demo2-esm.html）

### 引入方式

```html
<script type="module">
  import {
    init,
    showAlert,
    showConfirm,
    showPrompt,
    showDialog
  } from './dialog-api.js';
</script>
```

### 使用範例

```javascript
// 使用 async/await
document.querySelector('#btnDelete').addEventListener('click', async () => {
  const result = await showConfirm('確定要刪除嗎？', {
    type: 'danger',
    confirmText: '刪除'
  });

  if (result) {
    await showAlert('已刪除', 'success');
  }
});
```

---

## 模式三：Vue 3 Composition API（demo-vue2.html）

### 依賴

```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
```

### btnStyles 設定

Vue 版本中 `btnStyles` 用於 DialogContainer 元件：

```javascript
const btnStyles = {
  primary: 'px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors',
  secondary: 'px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors',
  danger: 'px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors',
  success: 'px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors',
  warning: 'px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors',
  light: 'px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors',
  'outline-secondary': 'px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors'
};
```

### DialogContainer 元件特點

- 使用 Tailwind utility classes 建構 Dialog UI
- 輸入框樣式：`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`
- 按鈕透過 `btnStyles` 物件動態套用

### 使用範例

```javascript
const app = Vue.createApp({
  components: { DialogContainer },
  setup() {
    const dialog = useDialog();

    const handleDelete = async () => {
      const result = await dialog.showConfirm(
        '確定要刪除嗎？',
        { type: 'danger', confirmText: '刪除' }
      );

      if (result) {
        await dialog.showAlert('已刪除', 'success');
      }
    };

    return { dialog, handleDelete };
  }
});
```

---

## CSS 樣式（demo2.css）

```css
dialog {
  border: none;
  border-radius: 0.5rem;
  padding: 0;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  --animate-duration: 0.3s;
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  animation: backdropFadeIn 0.3s ease;
}

dialog.dialog-closing::backdrop {
  animation: backdropFadeOut 0.3s ease forwards;
}

/* Alert 類型樣式 */
dialog.alert-success .dialog-header { color: #22c55e; }
dialog.alert-error .dialog-header { color: #ef4444; }
dialog.alert-info .dialog-header { color: #3b82f6; }

/* 錯誤訊息 */
.error-message { display: none; }
.error-message.show { display: block; }

/* 清單選項 */
.list-container { border: 1px solid #e5e7eb; border-radius: 0.5rem; overflow: hidden; }
.list-item { width: 100%; padding: 0.75rem 1rem; display: flex; align-items: center; gap: 0.75rem; background: white; border: none; border-bottom: 1px solid #e5e7eb; cursor: pointer; }
.list-item:hover { background: #f9fafb; }
.list-item:last-child { border-bottom: none; }
```

---

## API 參考

API 與 Bootstrap 版本相同，請參考 `demo-bootstrap.md`。

### 按鈕 style 對照

| style 值 | Tailwind 樣式 |
|----------|---------------|
| `primary` | `bg-blue-500 hover:bg-blue-600 text-white` |
| `secondary` | `bg-gray-200 hover:bg-gray-300 text-gray-700` |
| `danger` | `bg-red-500 hover:bg-red-600 text-white` |
| `success` | `bg-green-500 hover:bg-green-600 text-white` |
| `warning` | `bg-yellow-500 hover:bg-yellow-600 text-white` |
| `light` | `bg-gray-100 hover:bg-gray-200 text-gray-700` |
