import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

interface TextareaProps extends TextInputProps {}

export function Textarea({
  style,
  multiline = true,
  numberOfLines = 4,
  ...rest
}: TextareaProps) {
  return (
    <TextInput
      multiline={multiline}
      numberOfLines={numberOfLines}
      style={[styles.textarea, style]}
      placeholderTextColor="#9CA3AF"
      textAlignVertical="top"
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  textarea: {
    minHeight: 64,
    width: '100%',
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
