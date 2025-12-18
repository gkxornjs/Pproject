// src/components/ui/command.tsx
import React, { PropsWithChildren } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ViewProps,
  TextInputProps,
  PressableProps,
} from 'react-native';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog'; // RN용으로 따로 만든 dialog.tsx를 사용한다고 가정
import type { StyleProp, ViewStyle } from 'react-native';

/* ------------------------------------------------------------------ */
/* Command Container                                                   */
/* ------------------------------------------------------------------ */

interface CommandProps extends ViewProps {}

export function Command({
  style,
  children,
  ...rest
}: PropsWithChildren<CommandProps>) {
  return (
    <View style={[styles.command, style]} {...rest}>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* CommandDialog                                                       */
/* ------------------------------------------------------------------ */

interface CommandDialogProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  // Dialog에서 필요한 나머지 props들은 any로 넘김 (타입 스트릭트하게 하고 싶으면 dialog.tsx랑 맞춰서 좁혀줘도 됨)
  [key: string]: any;
}

export function CommandDialog({
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
  ...rest
}: CommandDialogProps) {
  return (
    <Dialog {...rest}>
      <DialogHeader style={styles.srOnly}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent style={styles.commandDialogContent}>
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* CommandInput                                                        */
/* ------------------------------------------------------------------ */

interface CommandInputProps extends TextInputProps {}

export function CommandInput({
  style,
  ...rest
}: CommandInputProps) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputIcon}>🔍</Text>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#9CA3AF"
        {...rest}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* CommandList                                                         */
/* ------------------------------------------------------------------ */

interface CommandListProps extends ViewProps {}

export function CommandList({
  style,
  children,
  ...rest
}: PropsWithChildren<CommandListProps>) {
  return (
    <ScrollView
      style={[styles.list, style]}
      contentContainerStyle={styles.listContent}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/* CommandEmpty                                                        */
/* ------------------------------------------------------------------ */

interface CommandEmptyProps extends ViewProps {
  text?: string;
}

export function CommandEmpty({
  text = 'No results found.',
  style,
  ...rest
}: CommandEmptyProps) {
  return (
    <View style={[styles.empty, style]} {...rest}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* CommandGroup                                                        */
/* ------------------------------------------------------------------ */

interface CommandGroupProps extends ViewProps {
  heading?: string;
}

export function CommandGroup({
  heading,
  style,
  children,
  ...rest
}: PropsWithChildren<CommandGroupProps>) {
  return (
    <View style={[styles.group, style]} {...rest}>
      {heading ? <Text style={styles.groupHeading}>{heading}</Text> : null}
      <View>{children}</View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* CommandSeparator                                                    */
/* ------------------------------------------------------------------ */

interface CommandSeparatorProps extends ViewProps {}

export function CommandSeparator({
  style,
  ...rest
}: CommandSeparatorProps) {
  return <View style={[styles.separator, style]} {...rest} />;
}

/* ------------------------------------------------------------------ */
/* CommandItem                                                         */
/* ------------------------------------------------------------------ */

interface CommandItemProps
  extends Omit<PressableProps, 'style' | 'onPress'> {
  style?: StyleProp<ViewStyle>;     // 함수가 아닌 스타일만 허용
  disabled?: boolean;
}

export function CommandItem({
  children,
  style,
  disabled,
  ...rest
}: PropsWithChildren<CommandItemProps>) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.item,
        pressed && !disabled && styles.itemPressed,
        disabled && styles.itemDisabled,
        style,
      ]}
      disabled={disabled}
      {...rest}
    >
      {typeof children === 'string' ? (
        <Text style={styles.itemText}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* CommandShortcut                                                     */
/* ------------------------------------------------------------------ */

interface CommandShortcutProps extends ViewProps {}

export function CommandShortcut({
  children,
  style,
  ...rest
}: PropsWithChildren<CommandShortcutProps>) {
  return (
    <View style={[styles.shortcut, style]} {...rest}>
      <Text style={styles.shortcutText}>{children}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  command: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  commandDialogContent: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 12,
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    borderWidth: 0,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 44,
  },
  inputIcon: {
    fontSize: 14,
    color: '#9CA3AF',
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#111827',
  },
  list: {
    maxHeight: 300,
  },
  listContent: {
    paddingVertical: 4,
  },
  empty: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#6B7280',
  },
  group: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  groupHeading: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  item: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPressed: {
    backgroundColor: '#EEF2FF', // indigo-50 느낌
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemText: {
    fontSize: 14,
    color: '#111827',
  },
  shortcut: {
    marginLeft: 'auto',
  },
  shortcutText: {
    fontSize: 11,
    color: '#9CA3AF',
    letterSpacing: 1,
  },
});
