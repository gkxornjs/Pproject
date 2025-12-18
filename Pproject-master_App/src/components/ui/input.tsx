// src/components/ui/input.tsx
import React from 'react';
import {
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';

interface InputProps extends TextInputProps {
  type?: 'text' | 'password' | 'email' | 'number';
}

export function Input({
  type = 'text',
  style,
  secureTextEntry,
  keyboardType,
  ...rest
}: InputProps) {
  // type에 따라 기본 동작 설정
  let resolvedSecure = secureTextEntry;
  let resolvedKeyboardType: TextInputProps['keyboardType'] = keyboardType;

  if (!keyboardType) {
    if (type === 'email') resolvedKeyboardType = 'email-address';
    if (type === 'number') resolvedKeyboardType = 'number-pad';
  }

  if (type === 'password' && secureTextEntry === undefined) {
    resolvedSecure = true;
  }

  return (
    <TextInput
      style={[styles.input, style]}
      secureTextEntry={resolvedSecure}
      keyboardType={resolvedKeyboardType}
      placeholderTextColor="#9CA3AF"
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    minWidth: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB', // gray-50
    fontSize: 14,
    color: '#111827', // gray-900
  },
});
