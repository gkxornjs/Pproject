// src/components/ui/slider.tsx
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ViewProps,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';

interface SliderProps extends ViewProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onValueChange?: (value: number) => void;
  showValue?: boolean; // 지금은 안 쓰지만 API만 유지
}

/**
 * 아주 간단한 커스텀 슬라이더
 * - 외부 라이브러리 없이 View + PanResponder만 사용
 * - min/max/step, value/defaultValue, onValueChange 지원
 */
export function Slider({
  value,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  onValueChange,
  style,
  ...rest
}: SliderProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [trackWidth, setTrackWidth] = useState(0);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? (value as number) : internalValue;

  const panX = useRef(0).current;

  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  const quantize = (v: number) => {
    const s = step <= 0 ? 1 : step;
    const q = Math.round((v - min) / s) * s + min;
    return clamp(q);
  };

  const updateFromGesture = useCallback(
    (gestureX: number) => {
      if (trackWidth <= 0) return;
      const ratio = gestureX / trackWidth;
      const raw = min + (max - min) * ratio;
      const next = quantize(raw);

      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [trackWidth, min, max, quantize, isControlled, onValueChange],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: (evt, _gestureState) => {
        if (disabled) return;
        const x = evt.nativeEvent.locationX;
        updateFromGesture(x);
      },
      onPanResponderMove: (evt, _gestureState) => {
        if (disabled) return;
        const x = evt.nativeEvent.locationX;
        updateFromGesture(x);
      },
      onPanResponderRelease: () => {},
      onPanResponderTerminationRequest: () => true,
    }),
  ).current;

  const handleLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const ratio =
    max === min ? 0 : (currentValue - min) / (max - min);
  const filledWidth = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
  const clampedRatio = Math.max(0, Math.min(1, ratio));
  const filledPixelWidth = trackWidth * clampedRatio;
  const thumbLeft = trackWidth * clampedRatio;
  return (
    <View style={[styles.container, style]} {...rest}>
      <View
        style={styles.track}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        <View style={[styles.filled, { width: filledPixelWidth }]} />
  <View
    style={[
      styles.thumb,
      { left: thumbLeft },
    ]}
  />
      </View>
    </View>
  );
}

const THUMB_SIZE = 18;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    width: '100%',
    height: 32,
    justifyContent: 'center',
  },
  filled: {
    position: 'absolute',
    left: 0,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#10B981', // emerald-500
  },
  thumb: {
    position: 'absolute',
    marginLeft: -THUMB_SIZE / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
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
