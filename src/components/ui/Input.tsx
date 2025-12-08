'use client';

import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  id?: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      id,
      type = 'text',
      placeholder,
      value,
      onChange,
      onFocus: onFocusProp,
      onBlur: onBlurProp,
      disabled,
      required,
      autoComplete,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles =
      'block px-4 py-2 text-base bg-white border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-50';

    const stateStyles = error
      ? 'border-error-DEFAULT focus:border-error-DEFAULT focus:ring-error-DEFAULT/20'
      : isFocused
        ? 'border-primary-600 ring-2 ring-primary-500/20'
        : 'border-neutral-300 hover:border-neutral-400';

    const widthStyles = fullWidth ? 'w-full' : '';

    const hasLeftIcon = !!leftIcon;
    const hasRightIcon = !!rightIcon;

    const paddingStyles = clsx({
      'pl-10': hasLeftIcon,
      'pr-10': hasRightIcon,
    });

    return (
      <div className={clsx('flex flex-col gap-1', fullWidth ? 'w-full' : '')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
              {leftIcon}
            </div>
          )}

          <motion.input
            ref={ref}
            id={inputId}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={clsx(
              baseStyles,
              stateStyles,
              widthStyles,
              paddingStyles,
              className
            )}
            onFocus={(e) => {
              setIsFocused(true);
              onFocusProp?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlurProp?.(e);
            }}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            animate={{
              scale: isFocused ? 1.01 : 1,
            }}
            transition={{ duration: 0.2 }}
          />

          {rightIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-error-DEFAULT"
          >
            {error}
          </motion.p>
        )}

        {helperText && !error && (
          <p className="text-sm text-neutral-600">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
