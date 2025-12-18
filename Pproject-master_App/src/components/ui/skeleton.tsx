// src/components/ui/skeleton.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewProps } from 'react-native';

interface SkeletonProps extends ViewProps {}

/**
 * React Native용 Skeleton 컴포넌트
 * - 기본적으로 옅은 회색 배경 + 페이드 인/아웃 애니메이션
 */
export function Skeleton({ style, ...rest }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();

    return () => {
      loop.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.skeleton, { opacity }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB', // gray-200 느낌
    borderRadius: 8,
  },
});
