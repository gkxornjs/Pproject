// src/components/ui/checkbox.tsx
import React, { useState, useEffect } from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

export interface CheckboxProps
  extends Omit<PressableProps, 'onPress' | 'style'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  style?: StyleProp<ViewStyle>; // ✅ 함수 스타일은 허용 안 함
}

export function Checkbox({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  style,
  ...rest
}: CheckboxProps) {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] =
    useState<boolean>(defaultChecked);

  const currentChecked = isControlled ? !!checked : internalChecked;

  useEffect(() => {
    if (isControlled && typeof checked === 'boolean') {
      setInternalChecked(checked);
    }
  }, [checked, isControlled]);

  const toggle = () => {
    const next = !currentChecked;
    if (!isControlled) {
      setInternalChecked(next);
    }
    onCheckedChange?.(next);
  };

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{
        checked: currentChecked,
        disabled: !!disabled, // ✅ null 방지
      }}
      style={({ pressed }) => {
        const base: StyleProp<ViewStyle> = [
          styles.box,
          currentChecked && styles.boxChecked,
          disabled && styles.boxDisabled,
          pressed && !disabled && styles.boxPressed,
        ];
        // 바깥에서 넘긴 style과 병합
        if (!style) return base;
        return [base, style] as StyleProp<ViewStyle>;
      }}
      onPress={disabled ? undefined : toggle}
      {...rest}
    >
      {currentChecked && <View style={styles.check} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    backgroundColor: '#F9FAFB', // gray-50
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxChecked: {
    backgroundColor: '#3B82F6', // blue-500
    borderColor: '#3B82F6',
  },
  boxDisabled: {
    opacity: 0.5,
  },
  boxPressed: {
    opacity: 0.8,
  },
  check: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
});
