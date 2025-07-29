<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

export type ButtonType = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  name: 'LButton'
})
export default class Button extends Vue {
  @Prop({ type: String, default: 'primary' })
  type!: ButtonType;

  @Prop({ type: String, default: 'medium' })
  size!: ButtonSize;

  @Prop({ type: Boolean, default: false })
  disabled!: boolean;

  @Prop({ type: Boolean, default: false })
  loading!: boolean;

  get buttonClasses() {
    return [
      'l-button',
      `l-button--${this.type}`,
      `l-button--${this.size}`,
      {
        'l-button--disabled': this.disabled,
        'l-button--loading': this.loading
      }
    ];
  }

  handleClick(event: MouseEvent) {
    if (this.disabled || this.loading) {
      return;
    }
    this.$emit('click', event);
  }
}
</script>

<style lang="less" scoped>
.l-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s ease;
  user-select: none;
  white-space: nowrap;

  &:focus {
    outline: none;
  }

  // 尺寸
  &--small {
    padding: 4px 12px;
    font-size: 12px;
    line-height: 20px;
  }

  &--medium {
    padding: 8px 16px;
    font-size: 14px;
    line-height: 22px;
  }

  &--large {
    padding: 12px 20px;
    font-size: 16px;
    line-height: 24px;
  }

  // 类型
  &--primary {
    background-color: #1890ff;
    border-color: #1890ff;
    color: #fff;

    &:hover:not(.l-button--disabled) {
      background-color: #40a9ff;
      border-color: #40a9ff;
    }

    &:active:not(.l-button--disabled) {
      background-color: #096dd9;
      border-color: #096dd9;
    }
  }

  &--secondary {
    background-color: #fff;
    border-color: #d9d9d9;
    color: #000;

    &:hover:not(.l-button--disabled) {
      border-color: #40a9ff;
      color: #40a9ff;
    }

    &:active:not(.l-button--disabled) {
      border-color: #096dd9;
      color: #096dd9;
    }
  }

  // 状态
  &--disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &--loading {
    cursor: default;
  }
}
</style>
