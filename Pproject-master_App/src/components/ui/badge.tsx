import React, { PropsWithChildren } from 'react';
import { View, Text, StyleSheet, ViewProps, TextStyle, ViewStyle } from 'react-native';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface BadgeProps extends ViewProps {
  variant?: BadgeVariant;
  textStyle?: TextStyle;
}

export function Badge({
  variant = 'default',
  style,
  textStyle,
  children,
  ...rest
}: PropsWithChildren<BadgeProps>) {
  const variantStyle = getVariantStyle(variant);

  return (
    <View style={[styles.base, variantStyle.container, style]} {...rest}>
      <Text style={[styles.text, variantStyle.text, textStyle]}>
        {children}
      </Text>
    </View>
  );
}

function getVariantStyle(
  variant: BadgeVariant,
): { container: ViewStyle; text: TextStyle } {
  switch (variant) {
    case 'secondary':
      return {
        container: {
          backgroundColor: '#E5E7EB', // gray-200
          borderColor: 'transparent',
        },
        text: { color: '#111827' }, // gray-900
      };
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
          borderColor: '#9CA3AF', // gray-400
        },
        text: { color: '#111827' },
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

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
  },
});
