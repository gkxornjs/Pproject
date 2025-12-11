// src/components/ui/progress.tsx
import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';

interface ProgressProps extends ViewProps {
  /** 0 ~ 100 사이 값 */
  value?: number;
}

export function Progress({ value = 0, style, ...rest }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <View style={[styles.track, style]} {...rest}>
      <View style={[styles.indicator, { width: `${clamped}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(59,130,246,0.2)', // blue-500 / 20%
  },
  indicator: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#3B82F6', // blue-500
  },
});
