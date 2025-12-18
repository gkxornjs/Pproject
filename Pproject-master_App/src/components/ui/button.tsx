import React, { PropsWithChildren } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  PressableProps,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link';

export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = 'default',
  size = 'default',
  children,
  style,
  ...rest
}: PropsWithChildren<ButtonProps>) {
  const { container, text } = getButtonStyles(variant, size);

  const content =
    typeof children === 'string' ? (
      <Text style={[styles.textBase, text]}>{children}</Text>
    ) : (
      children
    );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        container,
        sizeStyles[size],
        pressed && styles.pressed,
        style as ViewStyle,
      ]}
      {...rest}
    >
      {content}
    </Pressable>
  );
}

function getButtonStyles(
  variant: ButtonVariant,
  size: ButtonSize,
): { container: ViewStyle; text: TextStyle } {
  switch (variant) {
    case 'destructive':
      return {
        container: {
          backgroundColor: '#EF4444', // red-500
          borderColor: 'transparent',
        },
        text: { color: '#FFFFFF' },
      };
    case 'outline':
      return {
        container: {
          backgroundColor: 'transparent',
          borderColor: '#D1D5DB', // gray-300
        },
        text: { color: '#111827' }, // gray-900
      };
    case 'secondary':
      return {
        container: {
          backgroundColor: '#E5E7EB', // gray-200
          borderColor: 'transparent',
        },
        text: { color: '#111827' },
      };
    case 'ghost':
      return {
        container: {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
        text: { color: '#111827' },
      };
    case 'link':
      return {
        container: {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
        text: {
          color: '#2563EB', // blue-600
          textDecorationLine: 'underline',
        },
      };
    case 'default':
    default:
      return {
        container: {
          backgroundColor: '#3B82F6', // blue-500
          borderColor: 'transparent',
        },
        text: { color: '#FFFFFF' },
      };
  }
}

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  default: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sm: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  lg: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 0,
  },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  textBase: {
    fontSize: 14,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.8,
  },
});
