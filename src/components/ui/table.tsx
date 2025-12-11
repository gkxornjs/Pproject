// src/components/ui/table.tsx
import React, { PropsWithChildren } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ViewProps,
  TextProps,
} from 'react-native';

/* ------------------------------------------------------------------ */
/* Table                                                               */
/* ------------------------------------------------------------------ */

interface TableProps extends ViewProps {}

export function Table({ children, style, ...rest }: PropsWithChildren<TableProps>) {
  return (
    <ScrollView
      horizontal
      style={styles.tableContainer}
      contentContainerStyle={{ flexGrow: 1 }}
      showsHorizontalScrollIndicator={false}
    >
      <View style={[styles.table, style]} {...rest}>
        {children}
      </View>
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/* Header / Body / Footer                                              */
/* ------------------------------------------------------------------ */

interface TableSectionProps extends ViewProps {}

export function TableHeader({
  children,
  style,
  ...rest
}: PropsWithChildren<TableSectionProps>) {
  return (
    <View style={[styles.header, style]} {...rest}>
      {children}
    </View>
  );
}

export function TableBody({
  children,
  style,
  ...rest
}: PropsWithChildren<TableSectionProps>) {
  return (
    <View style={[style]} {...rest}>
      {children}
    </View>
  );
}

export function TableFooter({
  children,
  style,
  ...rest
}: PropsWithChildren<TableSectionProps>) {
  return (
    <View style={[styles.footer, style]} {...rest}>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Row / HeadCell / Cell                                               */
/* ------------------------------------------------------------------ */

interface TableRowProps extends ViewProps {}

export function TableRow({
  children,
  style,
  ...rest
}: PropsWithChildren<TableRowProps>) {
  return (
    <View style={[styles.row, style]} {...rest}>
      {children}
    </View>
  );
}

interface TableHeadProps extends TextProps {}

export function TableHead({
  children,
  style,
  ...rest
}: PropsWithChildren<TableHeadProps>) {
  return (
    <Text style={[styles.headCell, style]} {...rest}>
      {children}
    </Text>
  );
}

interface TableCellProps extends TextProps {}

export function TableCell({
  children,
  style,
  ...rest
}: PropsWithChildren<TableCellProps>) {
  return (
    <Text style={[styles.cell, style]} {...rest}>
      {children}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/* Caption                                                             */
/* ------------------------------------------------------------------ */

interface TableCaptionProps extends TextProps {}

export function TableCaption({
  children,
  style,
  ...rest
}: PropsWithChildren<TableCaptionProps>) {
  return (
    <Text style={[styles.caption, style]} {...rest}>
      {children}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  tableContainer: {
    width: '100%',
  },
  table: {
    width: '100%',
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'rgba(249,250,251,0.5)', // gray-50-ish
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  headCell: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  cell: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    color: '#111827',
  },
  caption: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },
});
