import React from 'react';
import { TouchableOpacity, type TouchableOpacityProps } from 'react-native';

interface IconButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function IconButton({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  ...props
}: IconButtonProps) {
  const variantStyles = {
    default: 'bg-slate-100 active:bg-slate-200',
    primary: 'bg-indigo-100 active:bg-indigo-200',
    ghost: 'bg-transparent active:bg-slate-100',
  };

  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <TouchableOpacity
      className={`rounded-full items-center justify-center ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      activeOpacity={0.7}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}
