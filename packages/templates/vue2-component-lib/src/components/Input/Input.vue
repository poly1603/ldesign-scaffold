<template>
  <div :class="inputWrapperClasses">
    <input
      :class="inputClasses"
      :type="type"
      :value="value"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @change="handleChange"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
export type InputSize = 'small' | 'medium' | 'large';

@Component({
  name: 'LInput'
})
export default class Input extends Vue {
  @Prop({ type: String, default: 'text' })
  type!: InputType;

  @Prop({ type: String, default: 'medium' })
  size!: InputSize;

  @Prop({ type: String, default: '' })
  value!: string;

  @Prop({ type: String, default: '' })
  placeholder!: string;

  @Prop({ type: Boolean, default: false })
  disabled!: boolean;

  @Prop({ type: Boolean, default: false })
  readonly!: boolean;

  @Prop({ type: Boolean, default: false })
  error!: boolean;

  private focused = false;

  get inputWrapperClasses() {
    return [
      'l-input-wrapper',
      `l-input-wrapper--${this.size}`,
      {
        'l-input-wrapper--focused': this.focused,
        'l-input-wrapper--disabled': this.disabled,
        'l-input-wrapper--error': this.error
      }
    ];
  }

  get inputClasses() {
    return [
      'l-input',
      `l-input--${this.size}`
    ];
  }

  handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.$emit('input', target.value);
  }

  handleFocus(event: FocusEvent) {
    this.focused = true;
    this.$emit('focus', event);
  }

  handleBlur(event: FocusEvent) {
    this.focused = false;
    this.$emit('blur', event);
  }

  handleChange(event: Event) {
    this.$emit('change', event);
  }
}
</script>

<style lang="less" scoped>
.l-input-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover:not(.l-input-wrapper--disabled) {
    border-color: #40a9ff;
  }

  &--focused {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  &--disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }

  &--error {
    border-color: #ff4d4f;

    &.l-input-wrapper--focused {
      box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
    }
  }

  // 尺寸
  &--small {
    .l-input {
      padding: 4px 8px;
      font-size: 12px;
      line-height: 20px;
    }
  }

  &--medium {
    .l-input {
      padding: 8px 12px;
      font-size: 14px;
      line-height: 22px;
    }
  }

  &--large {
    .l-input {
      padding: 12px 16px;
      font-size: 16px;
      line-height: 24px;
    }
  }
}

.l-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #000;

  &::placeholder {
    color: #bfbfbf;
  }

  &:disabled {
    cursor: not-allowed;
    color: #bfbfbf;
  }
}
</style>
