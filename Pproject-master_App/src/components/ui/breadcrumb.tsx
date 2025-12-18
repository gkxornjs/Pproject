import React, { PropsWithChildren } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewProps,
  TextProps,
  GestureResponderEvent,
} from 'react-native';

interface BreadcrumbProps extends ViewProps {}

export function Breadcrumb({
  style,
  children,
  ...rest
}: PropsWithChildren<BreadcrumbProps>) {
  return (
    <View style={style} {...rest}>
      {children}
    </View>
  );
}

interface BreadcrumbListProps extends ViewProps {}

export function BreadcrumbList({
  style,
  children,
  ...rest
}: PropsWithChildren<BreadcrumbListProps>) {
  return (
    <View style={[styles.list, style]} {...rest}>
      {children}
    </View>
  );
}

interface BreadcrumbItemProps extends ViewProps {}

export function BreadcrumbItem({
  style,
  children,
  ...rest
}: PropsWithChildren<BreadcrumbItemProps>) {
  return (
    <View style={[styles.item, style]} {...rest}>
      {children}
    </View>
  );
}

interface BreadcrumbLinkProps extends TextProps {
  onPress?: (event: GestureResponderEvent) => void;
}

export function BreadcrumbLink({
  style,
  children,
  onPress,
  ...rest
}: PropsWithChildren<BreadcrumbLinkProps>) {
  const text = (
    <Text style={[styles.linkText, style]} {...rest}>
      {children}
    </Text>
  );

  if (!onPress) return text;

  return (
    <Pressable onPress={onPress}>
      {text}
    </Pressable>
  );
}

interface BreadcrumbPageProps extends TextProps {}

export function BreadcrumbPage({
  style,
  children,
  ...rest
}: PropsWithChildren<BreadcrumbPageProps>) {
  return (
    <Text
      style={[styles.pageText, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}

interface BreadcrumbSeparatorProps extends TextProps {}

export function BreadcrumbSeparator({
  style,
  children,
  ...rest
}: PropsWithChildren<BreadcrumbSeparatorProps>) {
  return (
    <Text style={[styles.separator, style]} {...rest}>
      {children ?? '›'}
    </Text>
  );
}

interface BreadcrumbEllipsisProps extends TextProps {}

export function BreadcrumbEllipsis({
  style,
  ...rest
}: PropsWithChildren<BreadcrumbEllipsisProps>) {
  return (
    <Text style={[styles.ellipsis, style]} {...rest}>
      …
    </Text>
  );
}

const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 13,
    color: '#4B5563', // gray-600
  },
  pageText: {
    fontSize: 13,
    color: '#111827', // gray-900
    fontWeight: '500',
  },
  separator: {
    marginHorizontal: 4,
    fontSize: 13,
    color: '#9CA3AF', // gray-400
  },
  ellipsis: {
    marginHorizontal: 4,
    fontSize: 14,
    color: '#9CA3AF',
  },
});
