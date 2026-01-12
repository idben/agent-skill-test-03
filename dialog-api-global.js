/**
 * Dialog Replace API (Global 版本)
 * 使用原生 HTML <dialog> 元素取代傳統 JavaScript 對話框
 */

// Alert 類型配置
var alertConfig = {
  success: { icon: '', title: '成功', class: 'alert-success' },
  error: { icon: '', title: '錯誤', class: 'alert-error' },
  info: { icon: '', title: '通知', class: 'alert-info' }
};

/**
 * 開啟 Dialog 並播放進入動畫
 */
function openDialog(dialog, animationIn) {
  animationIn = animationIn || 'zoomIn';
  dialog.classList.remove('dialog-closing');
  dialog.classList.add('animate__animated', 'animate__' + animationIn);
  dialog.showModal();
}

/**
 * 關閉 Dialog 並播放退出動畫
 */
function closeDialog(dialog, animationOut) {
  animationOut = animationOut || 'zoomOut';
  return new Promise(function(resolve) {
    dialog.className = dialog.className.replace(/animate__\w+/g, '').trim();
    dialog.classList.add('dialog-closing', 'animate__animated', 'animate__' + animationOut);

    var handleAnimationEnd = function() {
      dialog.removeEventListener('animationend', handleAnimationEnd);
      dialog.classList.remove('dialog-closing', 'animate__animated', 'animate__' + animationOut);
      dialog.close();
      resolve();
    };

    dialog.addEventListener('animationend', handleAnimationEnd);
  });
}

/**
 * DialogAPI 全域物件
 */
var DialogAPI = {
  dialogs: {},
  adapter: null,

  /**
   * 預設適配器
   */
  getDefaultAdapter: function() {
    return {
      createButton: function(text, style) {
        style = style || 'secondary';
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = text;
        btn.className = 'btn btn-' + style;
        return btn;
      },
      setButtonStyle: function(btn, style) {
        btn.className = 'btn btn-' + style;
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
  },

  /**
   * 初始化
   */
  init: function(options) {
    options = options || {};
    this.dialogs = options.dialogs || {};
    this.adapter = options.adapter || this.getDefaultAdapter();

    // 設定 ESC 鍵處理
    var dialogs = this.dialogs;
    Object.keys(dialogs).forEach(function(key) {
      var dialog = dialogs[key];
      if (dialog) {
        dialog.addEventListener('cancel', function(e) {
          e.preventDefault();
        });
      }
    });
  },

  /**
   * 顯示 Alert 訊息
   */
  showAlert: function(message, type) {
    var self = this;
    type = type || 'info';
    var dialog = this.dialogs.alert;
    if (!dialog) throw new Error('Alert dialog not initialized');

    var config = alertConfig[type] || alertConfig.info;

    dialog.classList.remove('alert-success', 'alert-error', 'alert-info');
    dialog.classList.add(config.class);

    dialog.querySelector('.dialog-icon').textContent = config.icon;
    dialog.querySelector('.dialog-title').textContent = config.title;
    dialog.querySelector('.message').textContent = message;

    openDialog(dialog, 'fadeInDown');

    return new Promise(function(resolve) {
      var btn = dialog.querySelector('.btn-ok, button');
      var handleClick = function() {
        btn.removeEventListener('click', handleClick);
        closeDialog(dialog, 'fadeOutUp').then(resolve);
      };
      btn.addEventListener('click', handleClick);
    });
  },

  /**
   * 顯示 Confirm 確認對話框
   */
  showConfirm: function(message, options) {
    var self = this;
    options = options || {};
    var dialog = this.dialogs.confirm;
    if (!dialog) throw new Error('Confirm dialog not initialized');

    var type = options.type || 'default';
    var confirmText = options.confirmText || '確定';
    var cancelText = options.cancelText || '取消';

    dialog.querySelector('.message').textContent = message;

    var btnCancel = dialog.querySelector('.btn-cancel');
    var btnConfirm = dialog.querySelector('.btn-confirm');

    btnCancel.textContent = cancelText;
    btnConfirm.textContent = confirmText;

    var confirmStyle = type === 'danger' ? 'danger' : 'primary';
    this.adapter.setButtonStyle(btnConfirm, confirmStyle);

    openDialog(dialog, 'zoomIn');

    return new Promise(function(resolve) {
      var cleanup = function() {
        btnCancel.removeEventListener('click', handleCancel);
        btnConfirm.removeEventListener('click', handleConfirm);
      };

      var handleCancel = function() {
        cleanup();
        closeDialog(dialog, 'zoomOut').then(function() { resolve(false); });
      };

      var handleConfirm = function() {
        cleanup();
        closeDialog(dialog, 'zoomOut').then(function() { resolve(true); });
      };

      btnCancel.addEventListener('click', handleCancel);
      btnConfirm.addEventListener('click', handleConfirm);
    });
  },

  /**
   * 顯示 Prompt 輸入對話框
   */
  showPrompt: function(message, options) {
    var self = this;
    options = options || {};
    var dialog = this.dialogs.prompt;
    if (!dialog) throw new Error('Prompt dialog not initialized');

    var defaultValue = options.defaultValue || '';
    var placeholder = options.placeholder || '';
    var validate = options.validate || null;

    var form = dialog.querySelector('form');
    var input = dialog.querySelector('input, sl-input, .prompt-input');
    var errorEl = dialog.querySelector('.error-message');
    var btnCancel = dialog.querySelector('.btn-cancel');
    var labelEl = dialog.querySelector('.message, label');

    if (labelEl) {
      this.adapter.setInputLabel(labelEl, message);
    }

    this.adapter.setInputValue(input, defaultValue);
    this.adapter.setInputPlaceholder(input, placeholder);

    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('show');
    }

    openDialog(dialog, 'fadeInDown');

    var adapter = this.adapter;
    setTimeout(function() {
      adapter.focusInput(input);
    }, 100);

    return new Promise(function(resolve) {
      var cleanup = function() {
        form.removeEventListener('submit', handleSubmit);
        btnCancel.removeEventListener('click', handleCancel);
      };

      var handleSubmit = function(e) {
        e.preventDefault();

        var value = adapter.getInputValue(input);

        if (validate) {
          var error = validate(value);
          if (error) {
            if (errorEl) {
              errorEl.textContent = error;
              errorEl.classList.add('show');
            }
            adapter.focusInput(input);
            return;
          }
        }

        cleanup();
        closeDialog(dialog, 'fadeOutUp').then(function() { resolve(value); });
      };

      var handleCancel = function() {
        cleanup();
        closeDialog(dialog, 'fadeOutUp').then(function() { resolve(null); });
      };

      form.addEventListener('submit', handleSubmit);
      btnCancel.addEventListener('click', handleCancel);
    });
  },

  /**
   * 顯示自定義 Dialog
   */
  showDialog: function(messageOrConfig, options) {
    var self = this;
    options = options || {};
    var dialog = this.dialogs.custom;
    if (!dialog) throw new Error('Custom dialog not initialized');

    var dialogIcon = dialog.querySelector('.dialog-icon');
    var dialogTitle = dialog.querySelector('.dialog-title');
    var dialogContent = dialog.querySelector('.dialog-content');
    var dialogFooter = dialog.querySelector('.dialog-footer');

    var config = {};

    if (typeof messageOrConfig === 'string') {
      config = Object.assign({ message: messageOrConfig }, options);
    } else {
      config = messageOrConfig;
    }

    var title = config.title || '對話框';
    var icon = config.icon || '';
    var message = config.message || '';
    var html = config.html || '';
    var buttons = config.buttons || [];
    var type = config.type || 'default';
    var listOptions = config.options || [];

    dialogIcon.textContent = icon;
    dialogTitle.textContent = title;
    dialogContent.innerHTML = '';
    dialogFooter.innerHTML = '';

    var adapter = this.adapter;

    // 清單選項模式
    if (type === 'list' && listOptions.length > 0) {
      if (message) {
        dialogContent.innerHTML = '<p class="mb-3">' + message + '</p>';
      }

      var listEl = document.createElement('div');
      listEl.className = 'list-group list-container';

      listOptions.forEach(function(opt) {
        var item = document.createElement('button');
        item.type = 'button';
        item.className = 'list-group-item list-group-item-action list-item';
        item.dataset.value = opt.value;
        item.innerHTML = (opt.icon ? '<span class="list-icon">' + opt.icon + '</span>' : '') +
          '<span>' + opt.text + '</span>';
        listEl.appendChild(item);
      });

      dialogContent.appendChild(listEl);

      var cancelBtn = adapter.createButton('取消', 'secondary');
      cancelBtn.classList.add('btn-cancel');
      dialogFooter.appendChild(cancelBtn);

      openDialog(dialog, 'fadeIn');

      return new Promise(function(resolve) {
        var cleanup = function() {
          listEl.removeEventListener('click', handleListClick);
          var cancelBtnEl = dialogFooter.querySelector('.btn-cancel');
          if (cancelBtnEl) cancelBtnEl.removeEventListener('click', handleCancel);
        };

        var handleListClick = function(e) {
          var item = e.target.closest('.list-group-item, .list-item');
          if (item) {
            cleanup();
            closeDialog(dialog, 'fadeOut').then(function() { resolve(item.dataset.value); });
          }
        };

        var handleCancel = function() {
          cleanup();
          closeDialog(dialog, 'fadeOut').then(function() { resolve(null); });
        };

        listEl.addEventListener('click', handleListClick);
        var cancelBtnEl = dialogFooter.querySelector('.btn-cancel');
        if (cancelBtnEl) cancelBtnEl.addEventListener('click', handleCancel);
      });
    }

    // HTML 內容或純文字
    if (html) {
      dialogContent.innerHTML = html;
    } else if (message) {
      dialogContent.innerHTML = '<p class="mb-0">' + message + '</p>';
    }

    // 按鈕模式
    if (buttons.length > 0) {
      buttons.forEach(function(btn) {
        var btnEl = adapter.createButton(btn.text, btn.style || 'secondary');
        btnEl.dataset.value = btn.value;
        dialogFooter.appendChild(btnEl);
      });
    } else {
      var okBtn = adapter.createButton('確定', 'primary');
      dialogFooter.appendChild(okBtn);
    }

    openDialog(dialog, 'fadeIn');

    return new Promise(function(resolve) {
      var cleanup = function() {
        dialogFooter.removeEventListener('click', handleClick);
      };

      var handleClick = function(e) {
        var btn = e.target.closest('button, sl-button');
        if (btn) {
          cleanup();
          closeDialog(dialog, 'fadeOut').then(function() { resolve(btn.dataset.value || 'ok'); });
        }
      };

      dialogFooter.addEventListener('click', handleClick);
    });
  }
};
