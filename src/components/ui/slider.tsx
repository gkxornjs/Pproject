// src/components/ui/slider.tsx
import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ViewProps,
  LayoutChangeEvent,
  PanResponder,
  StyleProp,
  ViewStyle,
} from 'react-native';

interface SliderProps extends ViewProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onValueChange?: (value: number) => void;
}

export function Slider({
  value,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  onValueChange,
  style,
  ...rest
}: SliderProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [trackWidth, setTrackWidth] = useState(0);

  const currentValue = isControlled ? (value as number) : internalValue;

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const quantize = (v: number) => {
    const s = step > 0 ? step : 1;
    const q = Math.round((v - min) / s) * s + min;
    return clamp(q);
  };

  const setValue = (next: number) => {
    const v = quantize(next);
    if (!isControlled) setInternalValue(v);
    onValueChange?.(v);
  };

  const valueFromX = (x: number) => {
    if (trackWidth <= 0) return currentValue;
    const ratio = Math.min(1, Math.max(0, x / trackWidth));
    return min + (max - min) * ratio;
  };

  const onLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // ScrollView보다 먼저 터치를 가져오도록 캡처를 true로
        onStartShouldSetPanResponderCapture: () => !disabled,
        onMoveShouldSetPanResponderCapture: () => !disabled,
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,

        onPanResponderGrant: (evt) => {
          if (disabled) return;
          const x = evt.nativeEvent.locationX;
          setValue(valueFromX(x));
        },
        onPanResponderMove: (evt) => {
          if (disabled) return;
          const x = evt.nativeEvent.locationX;
          setValue(valueFromX(x));
        },
      }),
    [disabled, trackWidth, min, max, step, currentValue],
  );

  const ratio =
    max === min ? 0 : (currentValue - min) / (max - min);
  const clampedRatio = Math.max(0, Math.min(1, ratio));

  // 숫자 px로 계산 (string % 때문에 타입 에러/렌더 꼬임 방지)
  const filledWidth = trackWidth * clampedRatio;
  const thumbLeft = trackWidth * clampedRatio;

  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    disabled && styles.containerDisabled,
    style,
  ];

  return (
    <View style={containerStyle} {...rest}>
      <View
        style={styles.trackArea}
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        <View style={styles.trackBg} />
        <View style={[styles.trackFill, { width: filledWidth }]} />
        <View style={[styles.thumb, { left: thumbLeft }]} />
      </View>
    </View>
  );
}

const THUMB = 18;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 6,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  trackArea: {
    height: 34,
    justifyContent: 'center',
  },
  trackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#E5E7EB', // gray-200
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#10B981', // emerald-500
  },
  thumb: {
    position: 'absolute',
    marginLeft: -THUMB / 2,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
