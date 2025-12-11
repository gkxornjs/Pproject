// src/components/ui/label.tsx
import React, { PropsWithChildren } from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';

export interface LabelProps extends TextProps {}

/**
 * React Native용 Label 컴포넌트
 * - 웹의 <label> 대체
 * - font / spacing 정도만 기본 스타일 지정
 */
export function Label({
  children,
  style,
  ...rest
}: PropsWithChildren<LabelProps>) {
  return (
    <Text style={[styles.label, style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827', // gray-900
  },
});
