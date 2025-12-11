// src/components/ui/scroll-area.tsx
import React, { PropsWithChildren } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewProps,
  ScrollViewProps,
} from 'react-native';

/* ------------------------------------------------------------------ */
/* ScrollArea                                                          */
/* ------------------------------------------------------------------ */

interface ScrollAreaProps extends ViewProps {
  scrollProps?: ScrollViewProps;
}

/**
 * React Native용 ScrollArea
 * - Radix ScrollArea 대체
 * - 내부에 ScrollView를 두고, children을 그대로 감싸는 구조
 */
export function ScrollArea({
  children,
  style,
  scrollProps,
  ...rest
}: PropsWithChildren<ScrollAreaProps>) {
  return (
    <View style={[styles.container, style]} {...rest}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator
        showsHorizontalScrollIndicator={false}
        {...scrollProps}
      >
        {children}
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* ScrollBar                                                           */
/* ------------------------------------------------------------------ */

type Orientation = 'vertical' | 'horizontal';

interface ScrollBarProps extends ViewProps {
  orientation?: Orientation;
}

/**
 * ScrollBar
 * - RN에서는 기본 스크롤바가 있어서 필수는 아님
 * - 이름 호환용으로 간단한 데코 박스로만 남겨둠 (안 써도 됨)
 */
export function ScrollBar({
  orientation = 'vertical',
  style,
  ...rest
}: ScrollBarProps) {
  const isVertical = orientation === 'vertical';

  return (
    <View
      style={[
        styles.scrollbarTrack,
        isVertical ? styles.scrollbarVertical : styles.scrollbarHorizontal,
        style,
      ]}
      {...rest}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  scroll: {
    flex: 1,
  },
  content: {
    // 필요시 padding 조절
  },
  scrollbarTrack: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  scrollbarVertical: {
    top: 0,
    bottom: 0,
    right: 0,
    width: 4,
  },
  scrollbarHorizontal: {
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
  },
});
