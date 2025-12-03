import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  type TouchableOpacityProps,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'flex-row items-center justify-center rounded-xl';

  const variantStyles = {
    primary: 'bg-indigo-600 active:bg-indigo-700',
    secondary: 'bg-slate-100 active:bg-slate-200',
    outline: 'bg-transparent border-2 border-indigo-600 active:bg-indigo-50',
    ghost: 'bg-transparent active:bg-slate-100',
    destructive: 'bg-red-500 active:bg-red-600',
  };

  const textVariantStyles = {
    primary: 'text-white font-semibold',
    secondary: 'text-slate-800 font-semibold',
    outline: 'text-indigo-600 font-semibold',
    ghost: 'text-slate-600 font-medium',
    destructive: 'text-white font-semibold',
  };

  const sizeStyles = {
    sm: 'px-3 py-2',
    md: 'px-5 py-3',
    lg: 'px-6 py-4',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
        isDisabled ? 'opacity-50' : ''
      } ${className}`}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'destructive' ? 'white' : '#4f46e5'}
          size="small"
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {leftIcon}
          <Text className={`${textVariantStyles[variant]} ${textSizeStyles[size]}`}>
            {children}
          </Text>
          {rightIcon}
        </View>
      )}
    </TouchableOpacity>
  );
}
