// src/components/ui/select.tsx
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
  ViewStyle,
  StyleProp
} from 'react-native';

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface SelectContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  value?: string;
  setValue: (value: string) => void;
  label?: React.ReactNode;
  setLabel: (label?: React.ReactNode) => void;
}

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error('Select* components must be used inside <Select>');
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Select Root                                                         */
/* ------------------------------------------------------------------ */

interface SelectProps extends ViewProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function Select({
  value,
  defaultValue,
  onValueChange,
  children,
  style,
  ...rest
}: PropsWithChildren<SelectProps>) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue,
  );
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState<React.ReactNode>();

  const currentValue = isControlled ? value : internalValue;

  const handleSetValue = (next: string) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };

  const ctxValue: SelectContextValue = useMemo(
    () => ({
      open,
      setOpen,
      value: currentValue,
      setValue: handleSetValue,
      label,
      setLabel,
    }),
    [open, currentValue, label],
  );

  return (
    <SelectContext.Provider value={ctxValue}>
      <View style={style} {...rest}>
        {children}
      </View>
    </SelectContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* SelectTrigger                                                       */
/* ------------------------------------------------------------------ */

interface SelectTriggerProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  size?: 'sm' | 'default';
}

export function SelectTrigger({
  children,
  size = 'default',
  style,
  ...rest
}: PropsWithChildren<SelectTriggerProps>) {
  const { open, setOpen } = useSelectContext();

  const handlePress = () => {
    setOpen(!open);
    rest.onPress?.(undefined as any);
  };

  return (
    <Pressable
      style={[
        styles.trigger,
        size === 'sm' && styles.triggerSm,
        open && styles.triggerOpen,
        style,
      ]}
      onPress={handlePress}
      {...rest}
    >
      <View style={styles.triggerInner}>
        {typeof children === 'string' ? (
          <Text style={styles.triggerText}>{children}</Text>
        ) : (
          children
        )}
        <Text style={styles.triggerChevron}>⌄</Text>
      </View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* SelectValue                                                         */
/* ------------------------------------------------------------------ */

interface SelectValueProps extends TextProps {
  placeholder?: string;
}

export function SelectValue({
  placeholder = '선택하세요',
  style,
  ...rest
}: SelectValueProps) {
  const { label } = useSelectContext();

  return (
    <Text
      style={[styles.valueText, !label && styles.valuePlaceholder, style]}
      {...rest}
    >
      {label ?? placeholder}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/* SelectContent (Modal)                                               */
/* ------------------------------------------------------------------ */

interface SelectContentProps extends ViewProps {
  position?: 'popper' | 'item-aligned'; // 웹 API 유지용, RN에서는 거의 무시
}

export function SelectContent({
  children,
  style,
  ...rest
}: PropsWithChildren<SelectContentProps>) {
  const { open, setOpen } = useSelectContext();

  if (!open) return null;

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
          style={[styles.content, style]}
          onPress={(e) => e.stopPropagation()}
          {...rest}
        >
          {/* 위/아래 스크롤 버튼 역할은 모바일에서는 거의 필요 없으므로 생략 가능 */}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* SelectGroup / Label / Separator                                    */
/* ------------------------------------------------------------------ */

interface SelectGroupProps extends ViewProps {}

export function SelectGroup({
  children,
  style,
  ...rest
}: PropsWithChildren<SelectGroupProps>) {
  return (
    <View style={style} {...rest}>
      {children}
    </View>
  );
}

interface SelectLabelProps extends TextProps {}

export function SelectLabel({
  children,
  style,
  ...rest
}: PropsWithChildren<SelectLabelProps>) {
  return (
    <Text style={[styles.label, style]} {...rest}>
      {children}
    </Text>
  );
}

interface SelectSeparatorProps extends ViewProps {}

export function SelectSeparator({
  style,
  ...rest
}: SelectSeparatorProps) {
  return <View style={[styles.separator, style]} {...rest} />;
}

/* ------------------------------------------------------------------ */
/* SelectItem (옵션 하나)                                             */
/* ------------------------------------------------------------------ */

interface SelectItemProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  value: string;
}

export function SelectItem({
  value,
  children,
  style,
  disabled,
  ...rest
}: PropsWithChildren<SelectItemProps>) {
  const { value: current, setValue, setOpen, setLabel } = useSelectContext();
  const isSelected = current === value;

  const handlePress = () => {
    if (disabled) return;
    setValue(value);
    setLabel(children);
    setOpen(false);
    rest.onPress?.(undefined as any);
  };

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.item,
        isSelected && styles.itemSelected,
        pressed && !disabled && styles.itemPressed,
        disabled && styles.itemDisabled,
        style,
      ]}
      onPress={handlePress}
      {...rest}
    >
      <Text
        style={[
          styles.itemText,
          isSelected && styles.itemTextSelected,
        ]}
      >
        {children}
      </Text>
      {isSelected && <Text style={styles.itemCheck}>✓</Text>}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* ScrollUp / ScrollDown Buttons (모바일에서는 거의 장식용/no-op)      */
/* ------------------------------------------------------------------ */

interface SelectScrollButtonProps extends ViewProps {}

export function SelectScrollUpButton({
  style,
  ...rest
}: SelectScrollButtonProps) {
  return (
    <View style={[styles.scrollButton, style]} {...rest}>
      <Text style={styles.scrollButtonText}>↑</Text>
    </View>
  );
}

export function SelectScrollDownButton({
  style,
  ...rest
}: SelectScrollButtonProps) {
  return (
    <View style={[styles.scrollButton, style]} {...rest}>
      <Text style={styles.scrollButtonText}>↓</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  trigger: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  triggerSm: {
    paddingVertical: 4,
    height: 32,
  },
  triggerOpen: {
    borderColor: '#3B82F6',
  },
  triggerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: {
    fontSize: 14,
    color: '#111827',
  },
  triggerChevron: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  valueText: {
    fontSize: 14,
    color: '#111827',
  },
  valuePlaceholder: {
    color: '#9CA3AF',
  },
  backdrop: {
    flex: 1,
  },
  content: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    maxHeight: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  item: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemSelected: {
    backgroundColor: '#EEF2FF',
  },
  itemPressed: {
    backgroundColor: '#F3F4F6',
  },
  itemDisabled: {
    opacity: 0.4,
  },
  itemText: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  itemTextSelected: {
    fontWeight: '600',
  },
  itemCheck: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 8,
  },
  scrollButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  scrollButtonText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
