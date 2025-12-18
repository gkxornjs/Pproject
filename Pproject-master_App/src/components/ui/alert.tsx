import React, { PropsWithChildren } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewProps,
  TextProps,
} from 'react-native';

type AlertVariant = 'default' | 'destructive';

interface AlertProps extends ViewProps {
  variant?: AlertVariant;
}

export function Alert({
  variant = 'default',
  style,
  children,
  ...rest
}: PropsWithChildren<AlertProps>) {
  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.base,
        variant === 'destructive' ? styles.destructive : styles.default,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

interface AlertTitleProps extends TextProps {}

export function AlertTitle({
  style,
  children,
  ...rest
}: PropsWithChildren<AlertTitleProps>) {
  return (
    <Text style={[styles.title, style]} {...rest}>
      {children}
    </Text>
  );
}

interface AlertDescriptionProps extends TextProps {}

export function AlertDescription({
  style,
  children,
  ...rest
}: PropsWithChildren<AlertDescriptionProps>) {
  return (
    <Text style={[styles.description, style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  default: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e5e5',
  },
  destructive: {
    backgroundColor: '#fff5f5',
    borderColor: '#ff3b30',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#555',
  },
});
