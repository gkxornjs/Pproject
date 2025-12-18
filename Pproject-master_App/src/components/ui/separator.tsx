// src/components/ui/separator.tsx
import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';

interface SeparatorProps extends ViewProps {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean; // 웹과 API 맞추기용, RN에서는 크게 의미 없음
}

export function Separator({
  orientation = 'horizontal',
  style,
  ...rest
}: SeparatorProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <View
      style={[
        styles.base,
        isHorizontal ? styles.horizontal : styles.vertical,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#E5E7EB', // gray-200 (border 느낌)
    flexShrink: 0,
  },
  horizontal: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  vertical: {
    width: StyleSheet.hairlineWidth,
    height: '100%',
  },
});
