# Dialog Replace - Shoelace 版本使用指南

本文件說明如何使用 Shoelace Web Components 搭配 Dialog Replace API，包含三種不同的 JavaScript 使用模式。

## 檔案總覽

| 檔案 | JavaScript 模式 | 適用情境 |
|------|----------------|---------|
| `demo3.html` | CommonJS / Global | 傳統網頁（Shoelace 仍需 module） |
| `demo3-esm.html` | ES Module | 現代瀏覽器、支援 `type="module"` |
| `demo-vue3.html` | Vue 3 Composition API | Vue 3 專案 |

## 共同依賴

```html
<!-- Shoelace CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/themes/light.css">
<!-- Shoelace Autoloader（需要 type="module"） -->
<script type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/shoelace-autoloader.js"></script>
<!-- Animate.css -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" rel="stylesheet">
```

> 注意：Shoelace 是 Web Components 框架，即使在 CommonJS 模式下，Shoelace autoloader 仍需使用 `type="module"` 引入。

## Dialog HTML 結構

使用 Shoelace 元件（`<sl-button>`、`<sl-input>`）：

```html
<!-- Alert Dialog -->
<dialog id="alertDialog">
  <div class="dialog-header">
    <span class="dialog-icon"></span>
    <h6 class="dialog-title">提示</h6>
  </div>
  <div class="dialog-body">
    <p class="message"></p>
  </div>
  <div class="dialog-footer">
    <sl-button variant="primary" class="btn-ok">確定</sl-button>
  </div>
</dialog>

<!-- Confirm Dialog -->
<dialog id="confirmDialog">
  <div class="dialog-header">
    <span class="dialog-icon"></span>
    <h6 class="dialog-title">確認</h6>
  </div>
  <div class="dialog-body">
    <p class="message"></p>
  </div>
  <div class="dialog-footer">
    <sl-button variant="neutral" class="btn-cancel">取消</sl-button>
    <sl-button variant="primary" class="btn-confirm">確定</sl-button>
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
      <sl-input class="prompt-input" label="" help-text=""></sl-input>
      <div class="error-message"></div>
    </div>
    <div class="dialog-footer">
      <sl-button variant="neutral" class="btn-cancel" type="button">取消</sl-button>
      <sl-button variant="primary" class="btn-confirm" type="submit">確定</sl-button>
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

## 按鈕 Variant 對照表

Shoelace 按鈕使用 `variant` 屬性：

```javascript
var btnVariants = {
  primary: 'primary',
  secondary: 'neutral',
  danger: 'danger',
  success: 'success',
  warning: 'warning',
  light: 'neutral'  // 搭配 outline 使用
};
```

### Shoelace 按鈕範例

```html
<!-- 實心按鈕 -->
<sl-button variant="primary">主要按鈕</sl-button>
<sl-button variant="danger">危險按鈕</sl-button>
<sl-button variant="success">成功按鈕</sl-button>
<sl-button variant="neutral">次要按鈕</sl-button>

<!-- 外框按鈕 -->
<sl-button variant="primary" outline>主要外框</sl-button>
<sl-button variant="danger" outline>危險外框</sl-button>
```

---

## 模式一：CommonJS / Global（demo3.html）

### 引入方式

```html
<link href="demo3.css" rel="stylesheet">
<script src="dialog-api-global.js"></script>
```

### Shoelace 適配器

```javascript
var shoelaceAdapter = {
  createButton: function(text, style) {
    style = style || 'secondary';
    var btn = document.createElement('sl-button');
    btn.variant = btnVariants[style] || 'neutral';
    if (style === 'light') {
      btn.outline = true;
    }
    btn.textContent = text;
    return btn;
  },
  setButtonStyle: function(btn, style) {
    btn.variant = btnVariants[style] || 'primary';
  },
  getInputValue: function(input) { return input.value; },
  setInputValue: function(input, value) { input.value = value; },
  setInputPlaceholder: function(input, placeholder) { input.placeholder = placeholder; },
  setInputLabel: function(label, text) {
    // Shoelace sl-input 使用 label 屬性
    if (label.tagName === 'SL-INPUT' || label.classList.contains('prompt-input')) {
      label.label = text;
    } else {
      label.textContent = text;
    }
  },
  focusInput: function(input) {
    setTimeout(function() {
      input.focus();
      if (input.select) input.select();
    }, 100);
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
  adapter: shoelaceAdapter
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

## 模式二：ES Module（demo3-esm.html）

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

## 模式三：Vue 3 Composition API（demo-vue3.html）

### 依賴

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/themes/light.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/shoelace-autoloader.js"></script>
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
```

### btnVariants 設定

```javascript
const btnVariants = {
  primary: 'primary',
  secondary: 'neutral',
  danger: 'danger',
  success: 'success',
  warning: 'warning',
  light: 'neutral',
  'outline-secondary': 'neutral'
};
```

### DialogContainer 元件特點

- 使用 `h('sl-button', ...)` 建立 Shoelace 按鈕
- 使用 `h('sl-input', ...)` 建立輸入框
- 監聽 `sl-input` 事件取得輸入值（非標準 `input` 事件）

### sl-input 事件處理

```javascript
// Shoelace sl-input 使用 sl-input 事件
h('sl-input', {
  ref: 'inputRef',
  value: config.inputValue,
  placeholder: config.placeholder,
  label: config.message,
  onSlInput: (e) => this.$emit('input-change', e.target.value)
})
```

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

## CSS 樣式（demo3.css）

```css
/* 使用 Shoelace CSS 變數 */
:root {
  --sl-border-radius-medium: 0.5rem;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2.5rem 1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Dialog 基礎樣式 */
dialog {
  border: none;
  border-radius: var(--sl-border-radius-large, 0.5rem);
  padding: 0;
  max-width: 400px;
  width: 90%;
  box-shadow: var(--sl-shadow-x-large);
  --animate-duration: 0.3s;
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  animation: backdropFadeIn 0.3s ease;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--sl-color-neutral-200);
}

.dialog-body {
  padding: 1.25rem;
}

.dialog-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: 1rem 1.25rem;
  background: var(--sl-color-neutral-50);
  border-top: 1px solid var(--sl-color-neutral-200);
}

/* Alert 類型樣式 */
dialog.alert-success .dialog-header { color: var(--sl-color-success-600); }
dialog.alert-error .dialog-header { color: var(--sl-color-danger-600); }
dialog.alert-info .dialog-header { color: var(--sl-color-primary-600); }

/* 清單選項 */
.list-container {
  border: 1px solid var(--sl-color-neutral-200);
  border-radius: var(--sl-border-radius-medium);
  overflow: hidden;
}

.list-item {
  width: 100%;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  border: none;
  border-bottom: 1px solid var(--sl-color-neutral-200);
  cursor: pointer;
  font-family: var(--sl-font-sans);
  font-size: var(--sl-font-size-medium);
}

.list-item:hover {
  background: var(--sl-color-neutral-50);
}
```

---

## Shoelace 元件參考

### sl-button

```html
<!-- 基本用法 -->
<sl-button>預設按鈕</sl-button>
<sl-button variant="primary">主要按鈕</sl-button>
<sl-button variant="danger">危險按鈕</sl-button>

<!-- 外框樣式 -->
<sl-button variant="primary" outline>外框按鈕</sl-button>

<!-- 尺寸 -->
<sl-button size="small">小按鈕</sl-button>
<sl-button size="medium">中按鈕</sl-button>
<sl-button size="large">大按鈕</sl-button>
```

### sl-input

```html
<!-- 基本用法 -->
<sl-input label="名稱" placeholder="請輸入名稱"></sl-input>

<!-- 帶說明文字 -->
<sl-input label="Email" help-text="請輸入有效的 Email 地址"></sl-input>

<!-- 事件監聽 -->
<sl-input @sl-input="handleInput"></sl-input>
```

### sl-card

```html
<sl-card>
  <div slot="header">
    <strong>標題</strong>
  </div>
  卡片內容
  <div slot="footer">
    <sl-button>動作</sl-button>
  </div>
</sl-card>
```

### sl-badge

```html
<sl-badge variant="success">成功</sl-badge>
<sl-badge variant="warning">警告</sl-badge>
<sl-badge variant="danger">錯誤</sl-badge>
```

---

## API 參考

API 與 Bootstrap 版本相同，請參考 `demo-bootstrap.md`。

### 按鈕 style 對照

| style 值 | Shoelace variant |
|----------|------------------|
| `primary` | `primary` |
| `secondary` | `neutral` |
| `danger` | `danger` |
| `success` | `success` |
| `warning` | `warning` |
| `light` | `neutral` + `outline` |
