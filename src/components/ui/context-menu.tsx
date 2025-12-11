import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  PropsWithChildren,
} from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ViewProps,
} from 'react-native';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';

/* ------------------------------------------------------------------ */
/* Contexts                                                            */
/* ------------------------------------------------------------------ */

interface ContextMenuState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ContextMenuContext = createContext<ContextMenuState | null>(null);

function useContextMenu() {
  const ctx = useContext(ContextMenuContext);
  if (!ctx) {
    throw new Error(
      'ContextMenu components must be used inside <ContextMenu>',
    );
  }
  return ctx;
}

interface RadioGroupState {
  value?: string;
  setValue: (value: string) => void;
}

const ContextMenuRadioContext = createContext<RadioGroupState | null>(null);

function useContextMenuRadio() {
  return useContext(ContextMenuRadioContext);
}

/* ------------------------------------------------------------------ */
/* Root                                                               */
/* ------------------------------------------------------------------ */

interface ContextMenuProps extends ViewProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ContextMenu({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  style,
  ...rest
}: PropsWithChildren<ContextMenuProps>) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const currentOpen = isControlled ? !!open : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const value = useMemo(
    () => ({ open: currentOpen, setOpen }),
    [currentOpen],
  );

  return (
    <ContextMenuContext.Provider value={value}>
      <View style={style} {...rest}>
        {children}
      </View>
    </ContextMenuContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Trigger                                                             */
/* ------------------------------------------------------------------ */

interface ContextMenuTriggerProps extends PressableProps {}

export function ContextMenuTrigger({
  children,
  ...rest
}: PropsWithChildren<ContextMenuTriggerProps>) {
  const { setOpen } = useContextMenu();

  const handleLongPress = () => {
    setOpen(true);
  };

  return (
    <Pressable onLongPress={handleLongPress} {...rest}>
      {children}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Content (Modal로 표시)                                              */
/* ------------------------------------------------------------------ */

interface ContextMenuContentProps extends ViewProps {}

export function ContextMenuContent({
  children,
  style,
  ...rest
}: PropsWithChildren<ContextMenuContentProps>) {
  const { open, setOpen } = useContextMenu();

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <Pressable
        style={styles.backdrop}
        onPress={() => setOpen(false)}
      >
        <Pressable
          style={[styles.menu, style]}
          onPress={(e) => e.stopPropagation()}
          {...rest}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Group / Label / Separator                                          */
/* ------------------------------------------------------------------ */

interface ContextMenuGroupProps extends ViewProps {}

export function ContextMenuGroup({
  children,
  style,
  ...rest
}: PropsWithChildren<ContextMenuGroupProps>) {
  return (
    <View style={[style]} {...rest}>
      {children}
    </View>
  );
}

interface ContextMenuLabelProps extends ViewProps {
  inset?: boolean;
}

export function ContextMenuLabel({
  inset,
  children,
  style,
  ...rest
}: PropsWithChildren<ContextMenuLabelProps>) {
  return (
    <View
      style={[
        styles.labelWrapper,
        inset && styles.labelInset,
        style,
      ]}
      {...rest}
    >
      <Text style={styles.labelText}>{children}</Text>
    </View>
  );
}

interface ContextMenuSeparatorProps extends ViewProps {}

export function ContextMenuSeparator({
  style,
  ...rest
}: ContextMenuSeparatorProps) {
  return <View style={[styles.separator, style]} {...rest} />;
}

/* ------------------------------------------------------------------ */
/* Item / CheckboxItem / RadioItem                                    */
/* ------------------------------------------------------------------ */

interface ContextMenuItemProps extends PressableProps {
  inset?: boolean;
  variant?: 'default' | 'destructive';
  style?: StyleProp<ViewStyle>;
}

export function ContextMenuItem({
  children,
  style,
  inset,
  variant = 'default',
  disabled,
  ...rest
}: PropsWithChildren<ContextMenuItemProps>) {
  const { setOpen } = useContextMenu();

  const handlePress = () => {
    if (disabled) return;
    rest.onPress?.(undefined as any);
    setOpen(false);
  };

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.item,
        inset && styles.itemInset,
        variant === 'destructive' && styles.itemDestructive,
        pressed && !disabled && styles.itemPressed,
        disabled && styles.itemDisabled,
        style,
      ]}
      onPress={handlePress}
      {...rest}
    >
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.itemText,
            variant === 'destructive' && styles.itemTextDestructive,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

interface ContextMenuCheckboxItemProps
  extends Omit<ContextMenuItemProps, 'onPress'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export function ContextMenuCheckboxItem({
  children,
  style,
  checked = false,
  onCheckedChange,
  disabled,
  ...rest
}: PropsWithChildren<ContextMenuCheckboxItemProps>) {
  const { setOpen } = useContextMenu();

  const handlePress = () => {
    if (disabled) return;
    const next = !checked;
    onCheckedChange?.(next);
    setOpen(false);
  };

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.item,
        styles.itemCheckbox,
        pressed && !disabled && styles.itemPressed,
        disabled && styles.itemDisabled,
        style,
      ]}
      onPress={handlePress}
      {...rest}
    >
      <View style={styles.checkboxIcon}>
        {checked && <View style={styles.checkboxDot} />}
      </View>
      <Text style={styles.itemText}>{children}</Text>
    </Pressable>
  );
}

interface ContextMenuRadioItemProps
  extends Omit<ContextMenuItemProps, 'onPress'> {
  value: string;
  style?: StyleProp<ViewStyle>;
}

export function ContextMenuRadioItem({
  children,
  value,
  disabled,
  style,
  ...rest
}: PropsWithChildren<ContextMenuRadioItemProps>) {
  const radio = useContextMenuRadio();
  const { setOpen } = useContextMenu();

  const selected = radio?.value === value;

  const handlePress = () => {
    if (disabled) return;
    radio?.setValue(value);
    setOpen(false);
  };

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.item,
        styles.itemCheckbox,
        pressed && !disabled && styles.itemPressed,
        disabled && styles.itemDisabled,
        style,
      ]}
      onPress={handlePress}
      {...rest}
    >
      <View style={styles.radioIcon}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <Text style={styles.itemText}>{children}</Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* RadioGroup                                                          */
/* ------------------------------------------------------------------ */

interface ContextMenuRadioGroupProps extends ViewProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function ContextMenuRadioGroup({
  value,
  defaultValue,
  onValueChange,
  children,
  style,
  ...rest
}: PropsWithChildren<ContextMenuRadioGroupProps>) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue,
  );

  const currentValue = isControlled ? value : internalValue;

  const setValue = (next: string) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };

  const ctxValue = useMemo(
    () => ({ value: currentValue, setValue }),
    [currentValue],
  );

  return (
    <ContextMenuRadioContext.Provider value={ctxValue}>
      <View style={style} {...rest}>
        {children}
      </View>
    </ContextMenuRadioContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Sub / SubTrigger / SubContent / Portal                             */
/* (RN에서는 위치 계산 없이 단순 item처럼 동작)                       */
/* ------------------------------------------------------------------ */

interface ContextMenuSubProps extends ViewProps {}

export function ContextMenuSub({
  children,
  style,
  ...rest
}: PropsWithChildren<ContextMenuSubProps>) {
  return (
    <View style={style} {...rest}>
      {children}
    </View>
  );
}

interface ContextMenuSubTriggerProps extends ContextMenuItemProps {
  inset?: boolean;
}

export function ContextMenuSubTrigger({
  children,
  inset,
  ...rest
}: PropsWithChildren<ContextMenuSubTriggerProps>) {
  // 실제 서브 메뉴 토글 로직은 화면에서 따로 구성 가능 (여기서는 단순 아이템)
  return (
    <ContextMenuItem inset={inset} {...rest}>
      {children}
      <Text style={{ marginLeft: 'auto' }}>{'›'}</Text>
    </ContextMenuItem>
  );
}

interface ContextMenuSubContentProps extends ViewProps {}

export function ContextMenuSubContent({
  children,
  style,
  ...rest
}: PropsWithChildren<ContextMenuSubContentProps>) {
  // RN에서는 별도 위치 계산 안 하고 그냥 일반 뷰로 사용
  return (
    <View style={[styles.subContent, style]} {...rest}>
      {children}
    </View>
  );
}

interface ContextMenuPortalProps extends ViewProps {}

export function ContextMenuPortal({
  children,
}: PropsWithChildren<ContextMenuPortalProps>) {
  // 웹에서는 Portal로 body에 그리지만, RN에서는 일반 children 반환
  return <>{children}</>;
}

/* ------------------------------------------------------------------ */
/* Shortcut                                                            */
/* ------------------------------------------------------------------ */

interface ContextMenuShortcutProps extends ViewProps {}

export function ContextMenuShortcut({
  children,
  style,
  ...rest
}: PropsWithChildren<ContextMenuShortcutProps>) {
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    minWidth: 180,
    maxWidth: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  labelWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  labelInset: {
    paddingLeft: 24,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
    marginHorizontal: 4,
  },
  item: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
  },
  itemInset: {
    paddingLeft: 24,
  },
  itemPressed: {
    backgroundColor: '#F3F4F6', // gray-100
  },
  itemDisabled: {
    opacity: 0.4,
  },
  itemDestructive: {},
  itemText: {
    fontSize: 14,
    color: '#111827',
  },
  itemTextDestructive: {
    color: '#EF4444',
  },
  itemCheckbox: {
    paddingLeft: 12,
  },
  checkboxIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#3B82F6',
  },
  radioIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  subContent: {
    marginLeft: 16,
    marginTop: 4,
  },
  shortcut: {
    marginLeft: 'auto',
    paddingLeft: 8,
  },
  shortcutText: {
    fontSize: 11,
    color: '#9CA3AF',
    letterSpacing: 1,
  },
});
