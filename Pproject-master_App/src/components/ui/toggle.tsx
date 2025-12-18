// src/components/ui/toggle.tsx
import React, { PropsWithChildren } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  PressableProps,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type ToggleVariant = 'default' | 'outline';
export type ToggleSize = 'default' | 'sm' | 'lg';

export interface ToggleStyleOptions {
  variant?: ToggleVariant;
  size?: ToggleSize;
  active?: boolean;
}

export function toggleVariants({
  variant = 'default',
  size = 'default',
  active = false,
}: ToggleStyleOptions): { container: ViewStyle; text: TextStyle } {
  const baseContainer: ViewStyle = {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const baseText: TextStyle = {
    fontSize: 14,
    fontWeight: '500',
  };

  let container: ViewStyle = { ...baseContainer };
  let text: TextStyle = { ...baseText };

  // size
  if (size === 'sm') {
    container.height = 32;
    container.paddingHorizontal = 8;
  } else if (size === 'lg') {
    container.height = 40;
    container.paddingHorizontal = 12;
  } else {
    container.height = 36;
    container.paddingHorizontal = 10;
  }

  // variant + active
  if (variant === 'outline') {
    container.borderWidth = 1;
    container.borderColor = active ? '#3B82F6' : '#D1D5DB'; // blue-500 / gray-300
    container.backgroundColor = active ? '#EFF6FF' : 'transparent'; // blue-50
    text.color = active ? '#1F2937' : '#111827'; // gray-800 / gray-900
  } else {
    // default
    container.borderWidth = 0;
    container.backgroundColor = active ? '#3B82F6' : 'transparent';
    text.color = active ? '#FFFFFF' : '#111827';
  }

  return { container, text };
}

interface ToggleProps extends PressableProps {
  variant?: ToggleVariant;
  size?: ToggleSize;
  pressed?: boolean; // controlled on/off 상태로 쓸 경우
}

export function Toggle({
  children,
  variant = 'default',
  size = 'default',
  pressed,
  style,
  ...rest
}: PropsWithChildren<ToggleProps>) {
  const isControlled = pressed !== undefined;

 return (
    <Pressable
      style={({ pressed: isPressed }) => {
        const active = isControlled ? !!pressed : isPressed;
        const { container } = toggleVariants({ variant, size, active });
        return [styles.base, container, style];
      }}
      {...rest}
    >
      {({ pressed: isPressed }) => {
        const active = isControlled ? !!pressed : isPressed;
        const { text } = toggleVariants({ variant, size, active });

        return typeof children === 'string' ? (
          <Text style={[styles.textBase, text]}>{children}</Text>
        ) : (
          children
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    // 공통 hover/disable 로직은 외부에서 props로 처리
  },
  textBase: {
    // 텍스트 기본 값은 toggleVariants 안에서 세팅
  },
});
