// src/components/ui/menubar.tsx
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
  Pressable,
  StyleSheet,
  ViewProps,
  PressableProps,
  TextProps,
  ViewStyle,
  StyleProp,
} from 'react-native';

/* ------------------------------------------------------------------ */
/* Root Menubar Context (각 메뉴는 자체 open 상태를 가짐)             */
/* ------------------------------------------------------------------ */

interface MenubarMenuState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const MenubarMenuContext = createContext<MenubarMenuState | null>(null);

function useMenubarMenu() {
  const ctx = useContext(MenubarMenuContext);
  if (!ctx) {
    throw new Error('Menubar* components must be used inside <MenubarMenu>');
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Menubar Root                                                        */
/* ------------------------------------------------------------------ */

interface MenubarProps extends ViewProps {}

export function Menubar({
  children,
  style,
  ...rest
}: PropsWithChildren<MenubarProps>) {
  return (
    <View style={[styles.root, style]} {...rest}>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* MenubarMenu                                                         */
/* ------------------------------------------------------------------ */

interface MenubarMenuProps extends ViewProps {
  defaultOpen?: boolean;
}

export function MenubarMenu({
  children,
  defaultOpen = false,
  style,
  ...rest
}: PropsWithChildren<MenubarMenuProps>) {
  const [open, setOpen] = useState(defaultOpen);

  const value = useMemo(
    () => ({ open, setOpen }),
    [open],
  );

  return (
    <MenubarMenuContext.Provider value={value}>
      <View style={style} {...rest}>
        {children}
      </View>
    </MenubarMenuContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Group / Portal / RadioGroup (단순 래퍼)                             */
/* ------------------------------------------------------------------ */

interface MenubarGroupProps extends ViewProps {}

export function MenubarGroup({
  children,
  style,
  ...rest
}: PropsWithChildren<MenubarGroupProps>) {
  return (
    <View style={style} {...rest}>
      {children}
    </View>
  );
}

interface MenubarPortalProps extends ViewProps {}

export function MenubarPortal({
  children,
}: PropsWithChildren<MenubarPortalProps>) {
  // RN에서는 Portal이 필요 없으므로 바로 children 반환
  return <>{children}</>;
}

interface MenubarRadioGroupState {
  value?: string;
  setValue: (value: string) => void;
}

const MenubarRadioContext = createContext<MenubarRadioGroupState | null>(null);

function useMenubarRadio() {
  return useContext(MenubarRadioContext);
}

interface MenubarRadioGroupProps extends ViewProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function MenubarRadioGroup({
  value,
  defaultValue,
  onValueChange,
  children,
  style,
  ...rest
}: PropsWithChildren<MenubarRadioGroupProps>) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue,
  );

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
    <MenubarRadioContext.Provider value={ctxValue}>
      <View style={style} {...rest}>
        {children}
      </View>
    </MenubarRadioContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Trigger                                                             */
/* ------------------------------------------------------------------ */

interface MenubarTriggerProps
  extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
}
export function MenubarTrigger({
  children,
  style,
  onPress,
  ...rest
}: PropsWithChildren<MenubarTriggerProps>) {
  const { open, setOpen } = useMenubarMenu();

 const handlePress = (e: any) => {
    setOpen(!open);
    onPress?.(e);   
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.trigger,
        open && styles.triggerActive,
        pressed && styles.triggerPressed,
        style,
      ]}
      onPress={handlePress}
      {...rest}
    >
      {typeof children === 'string' ? (
        <Text style={styles.triggerText}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

interface MenubarContentProps extends ViewProps {
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  sideOffset?: number;
}

export function MenubarContent({
  children,
  style,
  ...rest
}: PropsWithChildren<MenubarContentProps>) {
  const { open } = useMenubarMenu();

  if (!open) return null;

  return (
    <View style={[styles.content, style]} {...rest}>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* MenubarItem                                                         */
/* ------------------------------------------------------------------ */

interface MenubarItemProps extends PressableProps {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}

export function MenubarItem({
  children,
  inset,
  variant = 'default',
  disabled,
  style,
  ...rest
}: PropsWithChildren<MenubarItemProps>) {
  const { setOpen } = useMenubarMenu();

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

/* ------------------------------------------------------------------ */
/* Checkbox Item                                                       */
/* ------------------------------------------------------------------ */

interface MenubarCheckboxItemProps
  extends Omit<PressableProps, 'style' | 'onPress'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export function MenubarCheckboxItem({
  children,
  checked = false,
  onCheckedChange,
  disabled,
  style,
  ...rest
}: PropsWithChildren<MenubarCheckboxItemProps>) {
  const handlePress = () => {
    if (disabled) return;
    const next = !checked;
    onCheckedChange?.(next);
  };

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => {
        const base: StyleProp<ViewStyle> = [
          styles.item,
          styles.itemCheckbox,
          pressed && !disabled && styles.itemPressed,
          disabled && styles.itemDisabled,
        ];
        return style ? ([base, style] as StyleProp<ViewStyle>) : base;
      }}
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
/* Radio Item                                                          */
/* ------------------------------------------------------------------ */

interface MenubarRadioItemProps
  extends Omit<MenubarItemProps, 'onPress'> {
  value: string;
  style?: StyleProp<ViewStyle>;
}

export function MenubarRadioItem({
  children,
  value,
  disabled,
  style,
  ...rest
}: PropsWithChildren<MenubarRadioItemProps>) {
  const radio = useMenubarRadio();
  const { setOpen } = useMenubarMenu();

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
/* Label / Separator / Shortcut                                       */
/* ------------------------------------------------------------------ */

interface MenubarLabelProps extends ViewProps {
  inset?: boolean;
}

export function MenubarLabel({
  children,
  inset,
  style,
  ...rest
}: PropsWithChildren<MenubarLabelProps>) {
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

interface MenubarSeparatorProps extends ViewProps {}

export function MenubarSeparator({
  style,
  ...rest
}: MenubarSeparatorProps) {
  return <View style={[styles.separator, style]} {...rest} />;
}

interface MenubarShortcutProps extends ViewProps {}

export function MenubarShortcut({
  children,
  style,
  ...rest
}: PropsWithChildren<MenubarShortcutProps>) {
  return (
    <View style={[styles.shortcut, style]} {...rest}>
      <Text style={styles.shortcutText}>{children}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Sub / SubTrigger / SubContent (단순 아이템 형태)                    */
/* ------------------------------------------------------------------ */

interface MenubarSubProps extends ViewProps {}

export function MenubarSub({
  children,
  style,
  ...rest
}: PropsWithChildren<MenubarSubProps>) {
  return (
    <View style={style} {...rest}>
      {children}
    </View>
  );
}

interface MenubarSubTriggerProps extends MenubarItemProps {
  inset?: boolean;
}

export function MenubarSubTrigger({
  children,
  inset,
  style,
  ...rest
}: PropsWithChildren<MenubarSubTriggerProps>) {
  return (
    <MenubarItem inset={inset} style={style} {...rest}>
      <View style={styles.subTriggerRow}>
        {typeof children === 'string' ? (
          <Text style={styles.itemText}>{children}</Text>
        ) : (
          children
        )}
        <Text style={styles.subTriggerArrow}>{'›'}</Text>
      </View>
    </MenubarItem>
  );
}

interface MenubarSubContentProps extends ViewProps {}

export function MenubarSubContent({
  children,
  style,
  ...rest
}: PropsWithChildren<MenubarSubContentProps>) {
  return (
    <View style={[styles.subContent, style]} {...rest}>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  trigger: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  triggerActive: {
    backgroundColor: '#EEF2FF',
  },
  triggerPressed: {
    backgroundColor: '#E5E7EB',
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
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
    marginLeft: 10,
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
