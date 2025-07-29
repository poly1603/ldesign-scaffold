import React, { useState } from 'react';
import './Input.less';

export interface InputProps {
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  size?: 'small' | 'medium' | 'large';
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  error?: boolean;
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  size = 'medium',
  value,
  defaultValue,
  placeholder,
  disabled = false,
  readonly = false,
  error = false,
  onChange,
  onFocus,
  onBlur,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || '');

  const isControlled = value !== undefined;
  const inputValue = isControlled ? value : internalValue;

  const inputWrapperClasses = [
    'l-input-wrapper',
    `l-input-wrapper--${size}`,
    focused && 'l-input-wrapper--focused',
    disabled && 'l-input-wrapper--disabled',
    error && 'l-input-wrapper--error'
  ].filter(Boolean).join(' ');

  const inputClasses = [
    'l-input',
    `l-input--${size}`
  ].filter(Boolean).join(' ');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue, event);
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    onBlur?.(event);
  };

  return (
    <div className={inputWrapperClasses}>
      <input
        className={inputClasses}
        type={type}
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readonly}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    </div>
  );
};

export default Input;
