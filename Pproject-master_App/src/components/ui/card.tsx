import React, { PropsWithChildren } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewProps,
  TextProps,
} from 'react-native';

interface CardProps extends ViewProps {}

export function Card({
  style,
  children,
  ...rest
}: PropsWithChildren<CardProps>) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

interface CardHeaderProps extends ViewProps {}

export function CardHeader({
  style,
  children,
  ...rest
}: PropsWithChildren<CardHeaderProps>) {
  return (
    <View style={[styles.header, style]} {...rest}>
      {children}
    </View>
  );
}

interface CardTitleProps extends TextProps {}

export function CardTitle({
  style,
  children,
  ...rest
}: PropsWithChildren<CardTitleProps>) {
  return (
    <Text style={[styles.title, style]} {...rest}>
      {children}
    </Text>
  );
}

interface CardDescriptionProps extends TextProps {}

export function CardDescription({
  style,
  children,
  ...rest
}: PropsWithChildren<CardDescriptionProps>) {
  return (
    <Text style={[styles.description, style]} {...rest}>
      {children}
    </Text>
  );
}

interface CardActionProps extends ViewProps {}

export function CardAction({
  style,
  children,
  ...rest
}: PropsWithChildren<CardActionProps>) {
  return (
    <View style={[styles.action, style]} {...rest}>
      {children}
    </View>
  );
}

interface CardContentProps extends ViewProps {}

export function CardContent({
  style,
  children,
  ...rest
}: PropsWithChildren<CardContentProps>) {
  return (
    <View style={[styles.content, style]} {...rest}>
      {children}
    </View>
  );
}

interface CardFooterProps extends ViewProps {}

export function CardFooter({
  style,
  children,
  ...rest
}: PropsWithChildren<CardFooterProps>) {
  return (
    <View style={[styles.footer, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    marginVertical: 8,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: '#6B7280', // gray-500
    marginTop: 2,
  },
  action: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
