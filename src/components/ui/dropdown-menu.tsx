// src/components/ui/dropdown-menu.tsx
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  PropsWithChildren,
} from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewProps,
  PressableProps,
  TextProps,
  StyleProp,
  ViewStyle 
} from 'react-native';

/* ------------------------------------------------------------------ */
/* Contexts                                                            */
/* ------------------------------------------------------------------ */

interface DropdownMenuState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = createContext<DropdownMenuState | null>(null);

function useDropdownMenu() {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) throw new Error('DropdownMenu components must be used inside <DropdownMenu>');
  return ctx;
}

interface DropdownMenuRadioState {
  value?: string;
  setValue: (value: string) => void;
}

const DropdownMenuRadioContext = createContext<DropdownMenuRadioState | null>(null);

function useDropdownMenuRadio() {
  return useContext(DropdownMenuRadioContext);
}

/* ------------------------------------------------------------------ */
/* Root                                                               */
/* ------------------------------------------------------------------ */

interface DropdownMenuProps extends ViewProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DropdownMenu({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  style,
  ...rest
}: PropsWithChildren<DropdownMenuProps>) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const currentOpen = isControlled ? !!open : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const value = useMemo(
    () => ({ open: currentOpen, setOpen }),
    [currentOpen],
  );

  return (
    <DropdownMenuContext.Provider value={value}>
      <View style={style} {...rest}>
        {children}
      </View>
    </DropdownMenuContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Portal                                                              */
/* ------------------------------------------------------------------ */

interface DropdownMenuPortalProps extends ViewProps {}

export function DropdownMenuPortal({
  children,
}: PropsWithChildren<DropdownMenuPortalProps>) {
  // 웹처럼 Portal이 필요한 건 아니라서 바로 children 반환
  return <>{children}</>;
}

/* ------------------------------------------------------------------ */
/* Trigger                                                             */
/* ------------------------------------------------------------------ */

interface DropdownMenuTriggerProps extends PressableProps {}

export function DropdownMenuTrigger({
  children,
  ...rest
}: PropsWithChildren<DropdownMenuTriggerProps>) {
  const { open, setOpen } = useDropdownMenu();

  const handlePress = () => {
    setOpen(!open);
    rest.onPress?.(undefined as any);
  };

  return (
    <Pressable onPress={handlePress} {...rest}>
      {children}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Content (Modal)                                                     */
/* ------------------------------------------------------------------ */

interface DropdownMenuContentProps extends ViewProps {
  sideOffset?: number; // 웹용과 API 유지용. 실제 위치는 간단화
}

export function DropdownMenuContent({
  children,
  style,
  ...rest
}: PropsWithChildren<DropdownMenuContentProps>) {
  const { open, setOpen } = useDropdownMenu();

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

interface DropdownMenuGroupProps extends ViewProps {}

export function DropdownMenuGroup({
  children,
  style,
  ...rest
}: PropsWithChildren<DropdownMenuGroupProps>) {
  return (
    <View style={style} {...rest}>
      {children}
    </View>
  );
}

interface DropdownMenuLabelProps extends ViewProps {
  inset?: boolean;
}

export function DropdownMenuLabel({
  children,
  inset,
  style,
  ...rest
}: PropsWithChildren<DropdownMenuLabelProps>) {
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

interface DropdownMenuSeparatorProps extends ViewProps {}

export function DropdownMenuSeparator({
  style,
  ...rest
}: DropdownMenuSeparatorProps) {
  return <View style={[styles.separator, style]} {...rest} />;
}

/* ------------------------------------------------------------------ */
/* Item / Checkbox / Radio                                             */
/* ------------------------------------------------------------------ */

interface DropdownMenuItemProps extends PressableProps {
  inset?: boolean;
  variant?: 'default' | 'destructive';
  style?: StyleProp<ViewStyle>;
}

export function DropdownMenuItem({
  children,
  inset,
  variant = 'default',
  style,
  disabled,
  ...rest
}: PropsWithChildren<DropdownMenuItemProps>) {
  const { setOpen } = useDropdownMenu();

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

interface DropdownMenuCheckboxItemProps
  extends Omit<DropdownMenuItemProps, 'onPress'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export function DropdownMenuCheckboxItem({
  children,
  style,
  checked = false,
  onCheckedChange,
  disabled,
  ...rest
}: PropsWithChildren<DropdownMenuCheckboxItemProps>) {
  const { setOpen } = useDropdownMenu();

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

/* ------------------------------------------------------------------ */
/* RadioGroup / RadioItem                                              */
/* ------------------------------------------------------------------ */

interface DropdownMenuRadioGroupProps extends ViewProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function DropdownMenuRadioGroup({
  value,
  defaultValue,
  onValueChange,
  children,
  style,
  ...rest
}: PropsWithChildren<DropdownMenuRadioGroupProps>) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);

  const currentValue = isControlled ? value : internalValue;

  const setValue = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  const ctxValue = useMemo(
    () => ({ value: currentValue, setValue }),
    [currentValue],
  );

  return (
    <DropdownMenuRadioContext.Provider value={ctxValue}>
      <View style={style} {...rest}>
        {children}
      </View>
    </DropdownMenuRadioContext.Provider>
  );
}

interface DropdownMenuRadioItemProps
  extends Omit<DropdownMenuItemProps, 'onPress'> {
  value: string;
  style?: StyleProp<ViewStyle>;
}

export function DropdownMenuRadioItem({
  children,
  value,
  disabled,
  style,
  ...rest
}: PropsWithChildren<DropdownMenuRadioItemProps>) {
  const radio = useDropdownMenuRadio();
  const { setOpen } = useDropdownMenu();

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
/* Sub / SubTrigger / SubContent (단순 버전)                           */
/* ------------------------------------------------------------------ */

interface DropdownMenuSubProps extends ViewProps {}

export function DropdownMenuSub({
  children,
  style,
  ...rest
}: PropsWithChildren<DropdownMenuSubProps>) {
  return (
    <View style={style} {...rest}>
      {children}
    </View>
  );
}

interface DropdownMenuSubTriggerProps extends DropdownMenuItemProps {
  inset?: boolean;
}

export function DropdownMenuSubTrigger({
  children,
  inset,
  style,
  ...rest
}: PropsWithChildren<DropdownMenuSubTriggerProps>) {
  // RN에서는 서브 메뉴를 별도 Modal로 띄우거나,
  // 단순히 클릭시 확장되는 형태로 직접 구현하는 걸 추천.
  // 여기서는 오른쪽에 아이콘만 붙인 아이템 형태로 둔다.
  return (
    <DropdownMenuItem inset={inset} style={style} {...rest}>
      <View style={styles.subTriggerRow}>
        {typeof children === 'string' ? (
          <Text style={styles.itemText}>{children}</Text>
        ) : (
          children
        )}
        <Text style={styles.subTriggerArrow}>{'›'}</Text>
      </View>
    </DropdownMenuItem>
  );
}

interface DropdownMenuSubContentProps extends ViewProps {}

export function DropdownMenuSubContent({
  children,
  style,
  ...rest
}: PropsWithChildren<DropdownMenuSubContentProps>) {
  return (
    <View style={[styles.subContent, style]} {...rest}>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Shortcut                                                            */
/* ------------------------------------------------------------------ */

interface DropdownMenuShortcutProps extends ViewProps {}

export function DropdownMenuShortcut({
  children,
  style,
  ...rest
}: PropsWithChildren<DropdownMenuShortcutProps>) {
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
  },
  menu: {
    position: 'absolute',
    right: 16,
    top: 60,
    minWidth: 160,
    maxWidth: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
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
    backgroundColor: '#F3F4F6',
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
  shortcut: {
    marginLeft: 'auto',
    paddingLeft: 8,
  },
  shortcutText: {
    fontSize: 11,
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  subContent: {
    marginLeft: 12,
    marginTop: 4,
  },
  subTriggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subTriggerArrow: {
    marginLeft: 'auto',
    fontSize: 14,
    color: '#9CA3AF',
  },
});
