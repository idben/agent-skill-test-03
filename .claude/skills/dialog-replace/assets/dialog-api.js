/**
 * Dialog Replace API
 * 使用原生 HTML <dialog> 元素取代傳統 JavaScript 對話框
 * 支援 Bootstrap、Tailwind CSS、Shoelace 等樣式框架
 */

// ============================================
// 動畫輔助函數
// ============================================

/**
 * 開啟 Dialog 並播放進入動畫
 * @param {HTMLDialogElement} dialog - Dialog 元素
 * @param {string} animationIn - 進入動畫類別（預設 zoomIn）
 */
export function openDialog(dialog, animationIn = 'zoomIn') {
  dialog.classList.remove('dialog-closing');
  dialog.classList.add('animate__animated', `animate__${animationIn}`);
  dialog.showModal();
}

/**
 * 關閉 Dialog 並播放退出動畫
 * @param {HTMLDialogElement} dialog - Dialog 元素
 * @param {string} animationOut - 退出動畫類別（預設 zoomOut）
 * @returns {Promise} 動畫完成後 resolve
 */
export function closeDialog(dialog, animationOut = 'zoomOut') {
  return new Promise(resolve => {
    dialog.className = dialog.className.replace(/animate__\w+/g, '').trim();
    dialog.classList.add('dialog-closing', 'animate__animated', `animate__${animationOut}`);

    const handleAnimationEnd = () => {
      dialog.removeEventListener('animationend', handleAnimationEnd);
      dialog.classList.remove('dialog-closing', 'animate__animated', `animate__${animationOut}`);
      dialog.close();
      resolve();
    };

    dialog.addEventListener('animationend', handleAnimationEnd);
  });
}

// ============================================
// Alert 類型配置
// ============================================

export const alertConfig = {
  success: { icon: '', title: '成功', class: 'alert-success' },
  error: { icon: '', title: '錯誤', class: 'alert-error' },
  info: { icon: '', title: '通知', class: 'alert-info' }
};

// ============================================
// DialogAPI 類別
// ============================================

class DialogAPI {
  constructor() {
    this.dialogs = {};
    this.adapter = null;
  }

  /**
   * 初始化 DialogAPI
   * @param {object} options - 配置選項
   * @param {object} options.dialogs - Dialog 元素 { alert, confirm, prompt, custom }
   * @param {object} options.adapter - 樣式框架適配器
   */
  init(options = {}) {
    this.dialogs = options.dialogs || {};
    this.adapter = options.adapter || this.getDefaultAdapter();
    this.setupEscHandler();
  }

  /**
   * 取得預設適配器（純 HTML）
   */
  getDefaultAdapter() {
    return {
      // 建立按鈕
      createButton: (text, style = 'secondary') => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = text;
        btn.className = `btn btn-${style}`;
        return btn;
      },
      // 設定按鈕樣式
      setButtonStyle: (btn, style) => {
        btn.className = `btn btn-${style}`;
      },
      // 取得輸入值
      getInputValue: (input) => input.value,
      // 設定輸入值
      setInputValue: (input, value) => { input.value = value; },
      // 設定輸入 placeholder
      setInputPlaceholder: (input, placeholder) => { input.placeholder = placeholder; },
      // 設定輸入 label
      setInputLabel: (label, text) => { label.textContent = text; },
      // Focus 輸入框
      focusInput: (input) => {
        input.focus();
        if (input.select) input.select();
      }
    };
  }

  /**
   * 設定 ESC 鍵處理
   */
  setupEscHandler() {
    Object.values(this.dialogs).forEach(dialog => {
      if (dialog) {
        dialog.addEventListener('cancel', (e) => {
          e.preventDefault();
        });
      }
    });
  }

  /**
   * 顯示 Alert 訊息
   * @param {string} message - 訊息內容
   * @param {string} type - 類型：success | error | info
   */
  async showAlert(message, type = 'info') {
    const dialog = this.dialogs.alert;
    if (!dialog) throw new Error('Alert dialog not initialized');

    const config = alertConfig[type] || alertConfig.info;

    dialog.classList.remove('alert-success', 'alert-error', 'alert-info');
    dialog.classList.add(config.class);

    dialog.querySelector('.dialog-icon').textContent = config.icon;
    dialog.querySelector('.dialog-title').textContent = config.title;
    dialog.querySelector('.message').textContent = message;

    openDialog(dialog, 'fadeInDown');

    return new Promise(resolve => {
      const btn = dialog.querySelector('.btn-ok, button');
      const handleClick = async () => {
        btn.removeEventListener('click', handleClick);
        await closeDialog(dialog, 'fadeOutUp');
        resolve();
      };
      btn.addEventListener('click', handleClick);
    });
  }

  /**
   * 顯示 Confirm 確認對話框
   * @param {string} message - 訊息內容
   * @param {object} options - 選項配置
   */
  async showConfirm(message, options = {}) {
    const dialog = this.dialogs.confirm;
    if (!dialog) throw new Error('Confirm dialog not initialized');

    const {
      type = 'default',
      confirmText = '確定',
      cancelText = '取消'
    } = options;

    dialog.querySelector('.message').textContent = message;

    const btnCancel = dialog.querySelector('.btn-cancel');
    const btnConfirm = dialog.querySelector('.btn-confirm');

    btnCancel.textContent = cancelText;
    btnConfirm.textContent = confirmText;

    // 根據類型設定按鈕樣式
    const confirmStyle = type === 'danger' ? 'danger' : 'primary';
    this.adapter.setButtonStyle(btnConfirm, confirmStyle);

    openDialog(dialog, 'zoomIn');

    return new Promise(resolve => {
      const handleCancel = async () => {
        cleanup();
        await closeDialog(dialog, 'zoomOut');
        resolve(false);
      };

      const handleConfirm = async () => {
        cleanup();
        await closeDialog(dialog, 'zoomOut');
        resolve(true);
      };

      const cleanup = () => {
        btnCancel.removeEventListener('click', handleCancel);
        btnConfirm.removeEventListener('click', handleConfirm);
      };

      btnCancel.addEventListener('click', handleCancel);
      btnConfirm.addEventListener('click', handleConfirm);
    });
  }

  /**
   * 顯示 Prompt 輸入對話框
   * @param {string} message - 提示訊息
   * @param {object} options - 選項配置
   */
  async showPrompt(message, options = {}) {
    const dialog = this.dialogs.prompt;
    if (!dialog) throw new Error('Prompt dialog not initialized');

    const {
      defaultValue = '',
      placeholder = '',
      validate = null
    } = options;

    const form = dialog.querySelector('form');
    const input = dialog.querySelector('input, sl-input, .prompt-input');
    const errorEl = dialog.querySelector('.error-message');
    const btnCancel = dialog.querySelector('.btn-cancel');
    const labelEl = dialog.querySelector('.message, label');

    // 設定 label
    if (labelEl) {
      this.adapter.setInputLabel(labelEl, message);
    }

    // 設定輸入框
    this.adapter.setInputValue(input, defaultValue);
    this.adapter.setInputPlaceholder(input, placeholder);

    // 清除錯誤
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('show');
    }

    openDialog(dialog, 'fadeInDown');

    // 延遲 focus
    setTimeout(() => {
      this.adapter.focusInput(input);
    }, 100);

    return new Promise(resolve => {
      const handleSubmit = async (e) => {
        e.preventDefault();

        const value = this.adapter.getInputValue(input);

        if (validate) {
          const error = validate(value);
          if (error) {
            if (errorEl) {
              errorEl.textContent = error;
              errorEl.classList.add('show');
            }
            this.adapter.focusInput(input);
            return;
          }
        }

        cleanup();
        await closeDialog(dialog, 'fadeOutUp');
        resolve(value);
      };

      const handleCancel = async () => {
        cleanup();
        await closeDialog(dialog, 'fadeOutUp');
        resolve(null);
      };

      const cleanup = () => {
        form.removeEventListener('submit', handleSubmit);
        btnCancel.removeEventListener('click', handleCancel);
      };

      form.addEventListener('submit', handleSubmit);
      btnCancel.addEventListener('click', handleCancel);
    });
  }

  /**
   * 顯示自定義 Dialog
   * @param {string|object} messageOrConfig - 訊息或配置物件
   * @param {object} options - 選項配置
   */
  async showDialog(messageOrConfig, options = {}) {
    const dialog = this.dialogs.custom;
    if (!dialog) throw new Error('Custom dialog not initialized');

    const dialogIcon = dialog.querySelector('.dialog-icon');
    const dialogTitle = dialog.querySelector('.dialog-title');
    const dialogContent = dialog.querySelector('.dialog-content');
    const dialogFooter = dialog.querySelector('.dialog-footer');

    let config = {};

    if (typeof messageOrConfig === 'string') {
      config = { message: messageOrConfig, ...options };
    } else {
      config = messageOrConfig;
    }

    const {
      title = '對話框',
      icon = '',
      message = '',
      html = '',
      buttons = [],
      type = 'default',
      options: listOptions = []
    } = config;

    dialogIcon.textContent = icon;
    dialogTitle.textContent = title;
    dialogContent.innerHTML = '';
    dialogFooter.innerHTML = '';

    // 清單選項模式
    if (type === 'list' && listOptions.length > 0) {
      if (message) {
        dialogContent.innerHTML = `<p class="mb-3">${message}</p>`;
      }

      const listEl = document.createElement('div');
      listEl.className = 'list-group list-container';

      listOptions.forEach(opt => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'list-group-item list-group-item-action list-item';
        item.dataset.value = opt.value;
        item.innerHTML = `
          ${opt.icon ? `<span class="list-icon">${opt.icon}</span>` : ''}
          <span>${opt.text}</span>
        `;
        listEl.appendChild(item);
      });

      dialogContent.appendChild(listEl);

      // 加入取消按鈕
      const cancelBtn = this.adapter.createButton('取消', 'secondary');
      cancelBtn.classList.add('btn-cancel');
      dialogFooter.appendChild(cancelBtn);

      openDialog(dialog, 'fadeIn');

      return new Promise(resolve => {
        const handleListClick = async (e) => {
          const item = e.target.closest('.list-group-item, .list-item');
          if (item) {
            cleanup();
            await closeDialog(dialog, 'fadeOut');
            resolve(item.dataset.value);
          }
        };

        const handleCancel = async () => {
          cleanup();
          await closeDialog(dialog, 'fadeOut');
          resolve(null);
        };

        const cleanup = () => {
          listEl.removeEventListener('click', handleListClick);
          dialogFooter.querySelector('.btn-cancel')?.removeEventListener('click', handleCancel);
        };

        listEl.addEventListener('click', handleListClick);
        dialogFooter.querySelector('.btn-cancel')?.addEventListener('click', handleCancel);
      });
    }

    // HTML 內容或純文字
    if (html) {
      dialogContent.innerHTML = html;
    } else if (message) {
      dialogContent.innerHTML = `<p class="mb-0">${message}</p>`;
    }

    // 按鈕模式
    if (buttons.length > 0) {
      buttons.forEach(btn => {
        const btnEl = this.adapter.createButton(btn.text, btn.style || 'secondary');
        btnEl.dataset.value = btn.value;
        dialogFooter.appendChild(btnEl);
      });
    } else {
      const okBtn = this.adapter.createButton('確定', 'primary');
      dialogFooter.appendChild(okBtn);
    }

    openDialog(dialog, 'fadeIn');

    return new Promise(resolve => {
      const handleClick = async (e) => {
        const btn = e.target.closest('button, sl-button');
        if (btn) {
          cleanup();
          await closeDialog(dialog, 'fadeOut');
          resolve(btn.dataset.value || 'ok');
        }
      };

      const cleanup = () => {
        dialogFooter.removeEventListener('click', handleClick);
      };

      dialogFooter.addEventListener('click', handleClick);
    });
  }
}

// 建立單例實例
const dialogAPI = new DialogAPI();

// 匯出 API
export const init = (options) => dialogAPI.init(options);
export const showAlert = (message, type) => dialogAPI.showAlert(message, type);
export const showConfirm = (message, options) => dialogAPI.showConfirm(message, options);
export const showPrompt = (message, options) => dialogAPI.showPrompt(message, options);
export const showDialog = (messageOrConfig, options) => dialogAPI.showDialog(messageOrConfig, options);

// 匯出預設物件
export default dialogAPI;
