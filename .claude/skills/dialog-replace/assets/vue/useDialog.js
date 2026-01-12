/**
 * Vue 3 Dialog Composable
 * 使用原生 HTML <dialog> 元素取代傳統 JavaScript 對話框
 */

import { ref, reactive, readonly } from 'vue';

/**
 * Alert 類型配置
 */
export const alertConfig = {
  success: { icon: '', title: '成功', class: 'alert-success' },
  error: { icon: '', title: '錯誤', class: 'alert-error' },
  info: { icon: '', title: '通知', class: 'alert-info' }
};

/**
 * Dialog 類型枚舉
 */
export const DialogType = {
  ALERT: 'alert',
  CONFIRM: 'confirm',
  PROMPT: 'prompt',
  CUSTOM: 'custom'
};

/**
 * 建立 Dialog Composable
 * @returns {object} Dialog API
 */
export function useDialog() {
  // 狀態
  const isOpen = ref(false);
  const dialogType = ref(DialogType.ALERT);
  const animationClass = ref('');
  const isClosing = ref(false);

  // Dialog 配置
  const config = reactive({
    // 通用
    title: '',
    icon: '',
    message: '',
    alertType: 'info',

    // Confirm
    confirmText: '確定',
    cancelText: '取消',
    isDanger: false,

    // Prompt
    inputValue: '',
    placeholder: '',
    defaultValue: '',
    validate: null,
    errorMessage: '',

    // Custom Dialog
    html: '',
    buttons: [],
    listOptions: [],
    isListMode: false
  });

  // Promise resolver
  let resolvePromise = null;

  /**
   * 重置配置
   */
  const resetConfig = () => {
    config.title = '';
    config.icon = '';
    config.message = '';
    config.alertType = 'info';
    config.confirmText = '確定';
    config.cancelText = '取消';
    config.isDanger = false;
    config.inputValue = '';
    config.placeholder = '';
    config.defaultValue = '';
    config.validate = null;
    config.errorMessage = '';
    config.html = '';
    config.buttons = [];
    config.listOptions = [];
    config.isListMode = false;
  };

  /**
   * 開啟 Dialog
   * @param {string} type - Dialog 類型
   * @param {string} animation - 進入動畫
   */
  const openDialog = (type, animation = 'zoomIn') => {
    dialogType.value = type;
    animationClass.value = `animate__animated animate__${animation}`;
    isClosing.value = false;
    isOpen.value = true;
  };

  /**
   * 關閉 Dialog
   * @param {*} result - 回傳結果
   * @param {string} animation - 退出動畫
   */
  const closeDialog = (result, animation = 'zoomOut') => {
    isClosing.value = true;
    animationClass.value = `animate__animated animate__${animation}`;

    // 等待動畫完成
    setTimeout(() => {
      isOpen.value = false;
      isClosing.value = false;
      animationClass.value = '';
      resolvePromise?.(result);
      resolvePromise = null;
    }, 300);
  };

  /**
   * 顯示 Alert 訊息
   * @param {string} message - 訊息內容
   * @param {string} type - 類型：success | error | info
   * @returns {Promise<void>}
   */
  const showAlert = (message, type = 'info') => {
    resetConfig();

    const alertCfg = alertConfig[type] || alertConfig.info;
    config.title = alertCfg.title;
    config.icon = alertCfg.icon;
    config.message = message;
    config.alertType = type;

    openDialog(DialogType.ALERT, 'fadeInDown');

    return new Promise(resolve => {
      resolvePromise = resolve;
    });
  };

  /**
   * 顯示 Confirm 確認對話框
   * @param {string} message - 訊息內容
   * @param {object} options - 選項配置
   * @returns {Promise<boolean>}
   */
  const showConfirm = (message, options = {}) => {
    resetConfig();

    const {
      type = 'default',
      confirmText = '確定',
      cancelText = '取消'
    } = options;

    config.title = '確認';
    config.icon = '';
    config.message = message;
    config.confirmText = confirmText;
    config.cancelText = cancelText;
    config.isDanger = type === 'danger';

    openDialog(DialogType.CONFIRM, 'zoomIn');

    return new Promise(resolve => {
      resolvePromise = resolve;
    });
  };

  /**
   * 顯示 Prompt 輸入對話框
   * @param {string} message - 提示訊息
   * @param {object} options - 選項配置
   * @returns {Promise<string|null>}
   */
  const showPrompt = (message, options = {}) => {
    resetConfig();

    const {
      defaultValue = '',
      placeholder = '',
      validate = null
    } = options;

    config.title = '輸入';
    config.icon = '';
    config.message = message;
    config.inputValue = defaultValue;
    config.defaultValue = defaultValue;
    config.placeholder = placeholder;
    config.validate = validate;
    config.errorMessage = '';

    openDialog(DialogType.PROMPT, 'fadeInDown');

    return new Promise(resolve => {
      resolvePromise = resolve;
    });
  };

  /**
   * 顯示自定義 Dialog
   * @param {string|object} messageOrConfig - 訊息或配置物件
   * @param {object} options - 選項配置
   * @returns {Promise<string|null>}
   */
  const showDialog = (messageOrConfig, options = {}) => {
    resetConfig();

    let dialogConfig = {};

    if (typeof messageOrConfig === 'string') {
      dialogConfig = { message: messageOrConfig, ...options };
    } else {
      dialogConfig = messageOrConfig;
    }

    const {
      title = '對話框',
      icon = '',
      message = '',
      html = '',
      buttons = [],
      type = 'default',
      options: listOptions = []
    } = dialogConfig;

    config.title = title;
    config.icon = icon;
    config.message = message;
    config.html = html;
    config.buttons = buttons;
    config.listOptions = listOptions;
    config.isListMode = type === 'list' && listOptions.length > 0;

    openDialog(DialogType.CUSTOM, 'fadeIn');

    return new Promise(resolve => {
      resolvePromise = resolve;
    });
  };

  // ============================================
  // 事件處理器
  // ============================================

  /**
   * Alert 確定按鈕
   */
  const handleAlertOk = () => {
    closeDialog(undefined, 'fadeOutUp');
  };

  /**
   * Confirm 取消按鈕
   */
  const handleConfirmCancel = () => {
    closeDialog(false, 'zoomOut');
  };

  /**
   * Confirm 確定按鈕
   */
  const handleConfirmOk = () => {
    closeDialog(true, 'zoomOut');
  };

  /**
   * Prompt 取消按鈕
   */
  const handlePromptCancel = () => {
    closeDialog(null, 'fadeOutUp');
  };

  /**
   * Prompt 確定按鈕
   */
  const handlePromptOk = () => {
    // 執行驗證
    if (config.validate) {
      const error = config.validate(config.inputValue);
      if (error) {
        config.errorMessage = error;
        return;
      }
    }
    closeDialog(config.inputValue, 'fadeOutUp');
  };

  /**
   * Prompt 輸入變更
   * @param {string} value - 輸入值
   */
  const handleInputChange = (value) => {
    config.inputValue = value;
    config.errorMessage = '';
  };

  /**
   * Custom Dialog 按鈕點擊
   * @param {string} value - 按鈕值
   */
  const handleButtonClick = (value) => {
    closeDialog(value, 'fadeOut');
  };

  /**
   * Custom Dialog 清單項目點擊
   * @param {string} value - 項目值
   */
  const handleListItemClick = (value) => {
    closeDialog(value, 'fadeOut');
  };

  /**
   * Custom Dialog 取消按鈕
   */
  const handleCustomCancel = () => {
    closeDialog(null, 'fadeOut');
  };

  return {
    // 狀態（唯讀）
    isOpen: readonly(isOpen),
    dialogType: readonly(dialogType),
    config: readonly(config),
    animationClass: readonly(animationClass),
    isClosing: readonly(isClosing),

    // API 方法
    showAlert,
    showConfirm,
    showPrompt,
    showDialog,

    // 事件處理器
    handleAlertOk,
    handleConfirmCancel,
    handleConfirmOk,
    handlePromptCancel,
    handlePromptOk,
    handleInputChange,
    handleButtonClick,
    handleListItemClick,
    handleCustomCancel
  };
}

/**
 * 建立全域 Dialog 實例（單例模式）
 */
let globalDialogInstance = null;

export function useGlobalDialog() {
  if (!globalDialogInstance) {
    globalDialogInstance = useDialog();
  }
  return globalDialogInstance;
}

export default useDialog;
