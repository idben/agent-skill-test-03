# Dialog Replace - Bootstrap 版本使用指南

本文件說明如何使用 Bootstrap 樣式搭配 Dialog Replace API，包含三種不同的 JavaScript 使用模式。

## 檔案總覽

| 檔案 | JavaScript 模式 | 適用情境 |
|------|----------------|---------|
| `demo.html` | CommonJS / Global | 傳統網頁、不支援 ES Module 的環境 |
| `demo-esm.html` | ES Module | 現代瀏覽器、支援 `type="module"` |
| `demo-vue.html` | Vue 3 Composition API | Vue 3 專案 |

## 共同依賴

```html
<!-- Bootstrap 5.3 CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<!-- Animate.css -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" rel="stylesheet">
```

## Dialog HTML 結構

以下為必要的 Dialog HTML 元素，放置於 `<body>` 結束標籤前：

```html
<!-- Alert Dialog -->
<dialog id="alertDialog">
  <div class="dialog-header">
    <span class="dialog-icon"></span>
    <h6 class="dialog-title">提示</h6>
  </div>
  <div class="dialog-body">
    <p class="message mb-0"></p>
  </div>
  <div class="dialog-footer">
    <button type="button" class="btn btn-primary" autofocus>確定</button>
  </div>
</dialog>

<!-- Confirm Dialog -->
<dialog id="confirmDialog">
  <div class="dialog-header">
    <span class="dialog-icon"></span>
    <h6 class="dialog-title">確認</h6>
  </div>
  <div class="dialog-body">
    <p class="message mb-0"></p>
  </div>
  <div class="dialog-footer">
    <button type="button" class="btn btn-secondary btn-cancel">取消</button>
    <button type="button" class="btn btn-primary btn-confirm" autofocus>確定</button>
  </div>
</dialog>

<!-- Prompt Dialog -->
<dialog id="promptDialog">
  <form method="dialog">
    <div class="dialog-header">
      <span class="dialog-icon"></span>
      <h6 class="dialog-title">輸入</h6>
    </div>
    <div class="dialog-body">
      <label class="form-label message"></label>
      <input type="text" class="form-control" name="input" autofocus>
      <div class="error-message"></div>
    </div>
    <div class="dialog-footer">
      <button type="button" class="btn btn-secondary btn-cancel">取消</button>
      <button type="submit" class="btn btn-primary btn-confirm">確定</button>
    </div>
  </form>
</dialog>

<!-- Custom Dialog -->
<dialog id="customDialog">
  <div class="dialog-header">
    <span class="dialog-icon"></span>
    <h6 class="dialog-title"></h6>
  </div>
  <div class="dialog-body">
    <div class="dialog-content"></div>
  </div>
  <div class="dialog-footer"></div>
</dialog>
```

---

## 模式一：CommonJS / Global（demo.html）

適用於傳統網頁開發，不需要打包工具。

### 引入方式

```html
<link href="demo.css" rel="stylesheet">
<script src="dialog-api-global.js"></script>
```

### Bootstrap 適配器

```javascript
var bootstrapAdapter = {
  createButton: function(text, style) {
    style = style || 'secondary';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = text;
    btn.className = 'btn btn-' + style;
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
  focusInput: function(input) {
    input.focus();
    if (input.select) input.select();
  }
};
```

### 初始化

```javascript
DialogAPI.init({
  dialogs: {
    alert: document.querySelector('#alertDialog'),
    confirm: document.querySelector('#confirmDialog'),
    prompt: document.querySelector('#promptDialog'),
    custom: document.querySelector('#customDialog')
  },
  adapter: bootstrapAdapter
});

// 取得 API 函數
var showAlert = DialogAPI.showAlert;
var showConfirm = DialogAPI.showConfirm;
var showPrompt = DialogAPI.showPrompt;
var showDialog = DialogAPI.showDialog;
```

### 使用範例

```javascript
// Alert
document.querySelector('#btn').addEventListener('click', function() {
  showAlert('操作成功！', 'success');
});

// Confirm（使用 .then()）
document.querySelector('#btnDelete').addEventListener('click', function() {
  showConfirm('確定要刪除嗎？', {
    type: 'danger',
    confirmText: '刪除',
    cancelText: '取消'
  }).then(function(result) {
    if (result) {
      showAlert('已刪除', 'success');
    }
  });
});

// Prompt
document.querySelector('#btnInput').addEventListener('click', function() {
  showPrompt('請輸入名稱：', {
    defaultValue: '預設值',
    validate: function(value) {
      if (!value) return '請輸入內容';
      return null;
    }
  }).then(function(value) {
    if (value) {
      showAlert('輸入：' + value, 'success');
    }
  });
});
```

---

## 模式二：ES Module（demo-esm.html）

適用於現代瀏覽器，使用 `import` / `export` 語法。

### 引入方式

CSS 內嵌於 HTML 或使用外部檔案，JavaScript 使用 ES Module：

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

### Bootstrap 適配器

```javascript
const bootstrapAdapter = {
  createButton: (text, style = 'secondary') => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = text;
    btn.className = `btn btn-${style}`;
    return btn;
  },
  setButtonStyle: (btn, style) => {
    btn.className = btn.className.replace(/btn-\w+/g, '').trim();
    btn.classList.add('btn', `btn-${style}`);
  },
  getInputValue: (input) => input.value,
  setInputValue: (input, value) => { input.value = value; },
  setInputPlaceholder: (input, placeholder) => { input.placeholder = placeholder; },
  setInputLabel: (label, text) => { label.textContent = text; },
  focusInput: (input) => {
    input.focus();
    if (input.select) input.select();
  }
};
```

### 初始化

```javascript
init({
  dialogs: {
    alert: document.querySelector('#alertDialog'),
    confirm: document.querySelector('#confirmDialog'),
    prompt: document.querySelector('#promptDialog'),
    custom: document.querySelector('#customDialog')
  },
  adapter: bootstrapAdapter
});
```

### 使用範例

```javascript
// Alert
document.querySelector('#btn').addEventListener('click', async () => {
  await showAlert('操作成功！', 'success');
});

// Confirm（使用 async/await）
document.querySelector('#btnDelete').addEventListener('click', async () => {
  const result = await showConfirm('確定要刪除嗎？', {
    type: 'danger',
    confirmText: '刪除',
    cancelText: '取消'
  });

  if (result) {
    await showAlert('已刪除', 'success');
  }
});

// Prompt
document.querySelector('#btnInput').addEventListener('click', async () => {
  const value = await showPrompt('請輸入名稱：', {
    defaultValue: '預設值',
    validate: (value) => {
      if (!value) return '請輸入內容';
      return null;
    }
  });

  if (value) {
    await showAlert(`輸入：${value}`, 'success');
  }
});
```

---

## 模式三：Vue 3 Composition API（demo-vue.html）

適用於 Vue 3 專案，使用 Composable 模式。

### 依賴引入

```html
<!-- Vue 3 CDN -->
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
```

### useDialog Composable

```javascript
const { ref, reactive, readonly, watch, nextTick, h, Teleport } = Vue;

function useDialog() {
  // ... 完整實作請參考 demo-vue.html

  return {
    isOpen: readonly(isOpen),
    dialogType: readonly(dialogType),
    config: readonly(config),
    animationClass: readonly(animationClass),
    isClosing: readonly(isClosing),
    showAlert,
    showConfirm,
    showPrompt,
    showDialog,
    // Event handlers...
  };
}
```

### DialogContainer 元件

Vue 元件負責渲染 Dialog UI，透過 props 和 events 與 useDialog 溝通。

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

    return {
      dialog,
      handleDelete
    };
  }
});
```

### 模板綁定

```html
<button @click="handleDelete">刪除</button>

<dialog-container
  :is-open="dialog.isOpen.value"
  :dialog-type="dialog.dialogType.value"
  :config="dialog.config"
  :animation-class="dialog.animationClass.value"
  :is-closing="dialog.isClosing.value"
  @alert-ok="dialog.handleAlertOk"
  @confirm-cancel="dialog.handleConfirmCancel"
  @confirm-ok="dialog.handleConfirmOk"
  @prompt-cancel="dialog.handlePromptCancel"
  @prompt-ok="dialog.handlePromptOk"
  @input-change="dialog.handleInputChange"
  @button-click="dialog.handleButtonClick"
  @list-item-click="dialog.handleListItemClick"
  @custom-cancel="dialog.handleCustomCancel"
></dialog-container>
```

---

## API 參考

### showAlert(message, type)

顯示訊息提示對話框。

| 參數 | 類型 | 說明 |
|-----|------|------|
| message | string | 訊息內容 |
| type | string | 類型：`'success'`、`'error'`、`'info'` |

**回傳值**：`Promise<void>`

### showConfirm(message, options)

顯示確認對話框。

| 參數 | 類型 | 說明 |
|-----|------|------|
| message | string | 訊息內容 |
| options.type | string | `'default'` 或 `'danger'` |
| options.confirmText | string | 確認按鈕文字（預設：確定） |
| options.cancelText | string | 取消按鈕文字（預設：取消） |

**回傳值**：`Promise<boolean>` - 確認返回 `true`，取消返回 `false`

### showPrompt(message, options)

顯示輸入對話框。

| 參數 | 類型 | 說明 |
|-----|------|------|
| message | string | 提示訊息 |
| options.defaultValue | string | 預設值 |
| options.placeholder | string | 輸入框提示文字 |
| options.validate | function | 驗證函數，回傳錯誤訊息或 `null` |

**回傳值**：`Promise<string|null>` - 輸入值或 `null`（取消）

### showDialog(messageOrConfig, options)

顯示自定義對話框。

| 參數 | 類型 | 說明 |
|-----|------|------|
| title | string | 對話框標題 |
| icon | string | 標題圖示 |
| message | string | 訊息內容 |
| html | string | HTML 內容（與 message 二擇一） |
| buttons | array | 按鈕陣列 `[{ text, value, style }]` |
| type | string | `'default'` 或 `'list'` |
| options | array | 清單選項 `[{ text, value, icon }]` |

**回傳值**：`Promise<string|null>` - 按鈕 value 或 `null`

---

## CSS 樣式

Bootstrap 版本的 Dialog 基礎樣式定義於 `demo.css` 或內嵌於 HTML：

```css
dialog {
  border: none;
  border-radius: 0.5rem;
  padding: 0;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  --animate-duration: 0.3s;
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

/* Alert 類型樣式 */
dialog.alert-success .dialog-header { color: #198754; }
dialog.alert-error .dialog-header { color: #dc3545; }
dialog.alert-info .dialog-header { color: #0d6efd; }
```

完整樣式請參考 `demo.css` 或 `demo-esm.html` 內嵌樣式。
