import React from 'react';
import { TextInput, View, Text, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  const hasError = Boolean(error);

  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-medium text-slate-700 mb-1.5">{label}</Text>
      )}
      <TextInput
        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 text-base ${
          hasError ? 'border-red-400' : 'border-slate-200'
        } ${className}`}
        placeholderTextColor="#94a3b8"
        {...props}
      />
      {(error || helperText) && (
        <Text
          className={`text-xs mt-1.5 ${
            hasError ? 'text-red-500' : 'text-slate-500'
          }`}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
}
