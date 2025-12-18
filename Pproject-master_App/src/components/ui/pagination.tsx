// src/components/ui/pagination.tsx
import React, { PropsWithChildren } from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { Button } from './button';

type ButtonProps = React.ComponentProps<typeof Button>;

/* ------------------------------------------------------------------ */
/* Pagination Root                                                     */
/* ------------------------------------------------------------------ */

interface PaginationProps extends ViewProps {}

export function Pagination({
  children,
  style,
  ...rest
}: PropsWithChildren<PaginationProps>) {
  return (
    <View
      style={[styles.pagination, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* PaginationContent                                                   */
/* ------------------------------------------------------------------ */

interface PaginationContentProps extends ViewProps {}

export function PaginationContent({
  children,
  style,
  ...rest
}: PropsWithChildren<PaginationContentProps>) {
  return (
    <View style={[styles.content, style]} {...rest}>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* PaginationItem                                                      */
/* ------------------------------------------------------------------ */

interface PaginationItemProps extends ViewProps {}

export function PaginationItem({
  children,
  style,
  ...rest
}: PropsWithChildren<PaginationItemProps>) {
  return (
    <View style={style} {...rest}>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* PaginationLink                                                      */
/* ------------------------------------------------------------------ */

interface PaginationLinkProps extends Omit<ButtonProps, 'variant'> {
  isActive?: boolean;
}

export function PaginationLink({
  isActive,
  size = 'icon',
  children,
  ...rest
}: PropsWithChildren<PaginationLinkProps>) {
  return (
    <Button
      variant={isActive ? 'outline' : 'ghost'}
      size={size}
      {...rest}
    >
      {children}
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* PaginationPrevious                                                  */
/* ------------------------------------------------------------------ */

export function PaginationPrevious({
  children,
  ...rest
}: PaginationLinkProps) {
  return (
    <PaginationLink
      size="default"
      {...rest}
    >
      <Text style={styles.arrowText}>{'‹'}</Text>
      {children ? (
        <Text style={styles.prevNextText}>{children}</Text>
      ) : (
        <Text style={styles.prevNextText}>Previous</Text>
      )}
    </PaginationLink>
  );
}

/* ------------------------------------------------------------------ */
/* PaginationNext                                                      */
/* ------------------------------------------------------------------ */

export function PaginationNext({
  children,
  ...rest
}: PaginationLinkProps) {
  return (
    <PaginationLink
      size="default"
      {...rest}
    >
      {children ? (
        <Text style={styles.prevNextText}>{children}</Text>
      ) : (
        <Text style={styles.prevNextText}>Next</Text>
      )}
      <Text style={styles.arrowText}>{'›'}</Text>
    </PaginationLink>
  );
}

/* ------------------------------------------------------------------ */
/* PaginationEllipsis                                                  */
/* ------------------------------------------------------------------ */

interface PaginationEllipsisProps extends ViewProps {}

export function PaginationEllipsis({
  style,
  ...rest
}: PaginationEllipsisProps) {
  return (
    <View style={[styles.ellipsis, style]} {...rest}>
      <Text style={styles.ellipsisText}>…</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginHorizontal: 'auto' as any,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  } as any,
  arrowText: {
    fontSize: 14,
    color: '#111827',
    marginRight: 2,
  },
  prevNextText: {
    fontSize: 13,
    color: '#111827',
  },
  ellipsis: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ellipsisText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
