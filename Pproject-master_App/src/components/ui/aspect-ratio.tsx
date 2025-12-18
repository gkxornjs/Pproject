import React, { PropsWithChildren } from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';

interface AspectRatioProps extends ViewProps {
  /** 가로:세로 비율 (예: 16/9, 1, 4/3 등) */
  ratio?: number;
}

export function AspectRatio({
  ratio = 16 / 9,
  style,
  children,
  ...rest
}: PropsWithChildren<AspectRatioProps>) {
  return (
    <View
      style={[styles.container, { aspectRatio: ratio }, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
});
