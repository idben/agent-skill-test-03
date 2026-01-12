/**
 * Vue 3 Dialog Container Component
 * 使用 render function 建立 Dialog UI
 */

import { h, Teleport, Transition, ref, watch, nextTick } from 'vue';
import { DialogType, alertConfig } from './useDialog.js';

/**
 * Dialog Container 元件
 */
export const DialogContainer = {
  name: 'DialogContainer',

  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    dialogType: {
      type: String,
      default: DialogType.ALERT
    },
    config: {
      type: Object,
      default: () => ({})
    },
    animationClass: {
      type: String,
      default: ''
    },
    isClosing: {
      type: Boolean,
      default: false
    }
  },

  emits: [
    'alert-ok',
    'confirm-cancel',
    'confirm-ok',
    'prompt-cancel',
    'prompt-ok',
    'input-change',
    'button-click',
    'list-item-click',
    'custom-cancel'
  ],

  setup(props, { emit }) {
    const dialogRef = ref(null);
    const inputRef = ref(null);

    // 監聽開啟狀態
    watch(() => props.isOpen, async (newVal) => {
      await nextTick();
      if (newVal && dialogRef.value) {
        dialogRef.value.showModal();
        // Focus 輸入框
        if (props.dialogType === DialogType.PROMPT && inputRef.value) {
          setTimeout(() => {
            inputRef.value?.focus();
            inputRef.value?.select();
          }, 100);
        }
      } else if (!newVal && dialogRef.value) {
        dialogRef.value.close();
      }
    });

    // 阻止 ESC 關閉
    const handleCancel = (e) => {
      e.preventDefault();
    };

    // 處理表單提交
    const handleSubmit = (e) => {
      e.preventDefault();
      emit('prompt-ok');
    };

    return {
      dialogRef,
      inputRef,
      handleCancel,
      handleSubmit
    };
  },

  render() {
    const {
      isOpen,
      dialogType,
      config,
      animationClass,
      isClosing
    } = this.$props;

    if (!isOpen) return null;

    // Alert 類型樣式
    const alertTypeClass = config.alertType ? `alert-${config.alertType}` : '';

    // 根據類型渲染不同內容
    let dialogContent;

    switch (dialogType) {
      case DialogType.ALERT:
        dialogContent = this.renderAlert();
        break;
      case DialogType.CONFIRM:
        dialogContent = this.renderConfirm();
        break;
      case DialogType.PROMPT:
        dialogContent = this.renderPrompt();
        break;
      case DialogType.CUSTOM:
        dialogContent = this.renderCustom();
        break;
      default:
        dialogContent = null;
    }

    return h(Teleport, { to: 'body' }, [
      h('dialog', {
        ref: 'dialogRef',
        class: [
          'dialog-container',
          alertTypeClass,
          animationClass,
          { 'dialog-closing': isClosing }
        ],
        onCancel: this.handleCancel
      }, dialogContent)
    ]);
  },

  methods: {
    /**
     * 渲染 Alert Dialog
     */
    renderAlert() {
      const { config } = this.$props;

      return [
        // Header
        h('div', { class: 'dialog-header' }, [
          h('span', { class: 'dialog-icon' }, config.icon),
          h('h6', { class: 'dialog-title' }, config.title)
        ]),
        // Body
        h('div', { class: 'dialog-body' }, [
          h('p', { class: 'message' }, config.message)
        ]),
        // Footer
        h('div', { class: 'dialog-footer' }, [
          h('button', {
            type: 'button',
            class: 'btn btn-primary',
            onClick: () => this.$emit('alert-ok')
          }, '確定')
        ])
      ];
    },

    /**
     * 渲染 Confirm Dialog
     */
    renderConfirm() {
      const { config } = this.$props;

      return [
        // Header
        h('div', { class: 'dialog-header' }, [
          h('span', { class: 'dialog-icon' }, config.icon),
          h('h6', { class: 'dialog-title' }, config.title)
        ]),
        // Body
        h('div', { class: 'dialog-body' }, [
          h('p', { class: 'message' }, config.message)
        ]),
        // Footer
        h('div', { class: 'dialog-footer' }, [
          h('button', {
            type: 'button',
            class: 'btn btn-secondary',
            onClick: () => this.$emit('confirm-cancel')
          }, config.cancelText),
          h('button', {
            type: 'button',
            class: ['btn', config.isDanger ? 'btn-danger' : 'btn-primary'],
            onClick: () => this.$emit('confirm-ok')
          }, config.confirmText)
        ])
      ];
    },

    /**
     * 渲染 Prompt Dialog
     */
    renderPrompt() {
      const { config } = this.$props;

      return [
        h('form', { onSubmit: this.handleSubmit }, [
          // Header
          h('div', { class: 'dialog-header' }, [
            h('span', { class: 'dialog-icon' }, config.icon),
            h('h6', { class: 'dialog-title' }, config.title)
          ]),
          // Body
          h('div', { class: 'dialog-body' }, [
            h('label', { class: 'form-label message' }, config.message),
            h('input', {
              ref: 'inputRef',
              type: 'text',
              class: 'form-control',
              value: config.inputValue,
              placeholder: config.placeholder,
              onInput: (e) => this.$emit('input-change', e.target.value)
            }),
            config.errorMessage
              ? h('div', { class: 'error-message show' }, config.errorMessage)
              : null
          ]),
          // Footer
          h('div', { class: 'dialog-footer' }, [
            h('button', {
              type: 'button',
              class: 'btn btn-secondary',
              onClick: () => this.$emit('prompt-cancel')
            }, config.cancelText),
            h('button', {
              type: 'submit',
              class: 'btn btn-primary'
            }, config.confirmText)
          ])
        ])
      ];
    },

    /**
     * 渲染 Custom Dialog
     */
    renderCustom() {
      const { config } = this.$props;

      // 清單模式
      if (config.isListMode) {
        return [
          // Header
          h('div', { class: 'dialog-header' }, [
            h('span', { class: 'dialog-icon' }, config.icon),
            h('h6', { class: 'dialog-title' }, config.title)
          ]),
          // Body
          h('div', { class: 'dialog-body' }, [
            config.message
              ? h('p', { class: 'mb-3' }, config.message)
              : null,
            h('div', { class: 'list-group' },
              config.listOptions.map(opt =>
                h('button', {
                  type: 'button',
                  class: 'list-group-item list-group-item-action',
                  onClick: () => this.$emit('list-item-click', opt.value)
                }, [
                  opt.icon
                    ? h('span', { class: 'list-icon' }, opt.icon)
                    : null,
                  h('span', null, opt.text)
                ])
              )
            )
          ]),
          // Footer
          h('div', { class: 'dialog-footer' }, [
            h('button', {
              type: 'button',
              class: 'btn btn-secondary',
              onClick: () => this.$emit('custom-cancel')
            }, '取消')
          ])
        ];
      }

      // 一般模式
      return [
        // Header
        h('div', { class: 'dialog-header' }, [
          h('span', { class: 'dialog-icon' }, config.icon),
          h('h6', { class: 'dialog-title' }, config.title)
        ]),
        // Body
        h('div', { class: 'dialog-body' }, [
          config.html
            ? h('div', {
                class: 'dialog-content',
                innerHTML: config.html
              })
            : h('p', { class: 'message' }, config.message)
        ]),
        // Footer
        h('div', { class: 'dialog-footer' },
          config.buttons.length > 0
            ? config.buttons.map(btn =>
                h('button', {
                  type: 'button',
                  class: ['btn', `btn-${btn.style || 'secondary'}`],
                  onClick: () => this.$emit('button-click', btn.value)
                }, btn.text)
              )
            : [
                h('button', {
                  type: 'button',
                  class: 'btn btn-primary',
                  onClick: () => this.$emit('button-click', 'ok')
                }, '確定')
              ]
        )
      ];
    }
  }
};

export default DialogContainer;
