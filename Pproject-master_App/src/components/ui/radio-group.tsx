// src/components/ui/radio-group.tsx
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  PropsWithChildren,
} from 'react';
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  ViewProps,
  PressableProps,
} from 'react-native';

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface RadioGroupState {
  value?: string;
  setValue: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupState | null>(null);

function useRadioGroup() {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) {
    throw new Error('RadioGroupItem must be used inside <RadioGroup>');
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/* RadioGroup                                                          */
/* ------------------------------------------------------------------ */

interface RadioGroupProps extends ViewProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function RadioGroup({
  value,
  defaultValue,
  onValueChange,
  children,
  style,
  ...rest
}: PropsWithChildren<RadioGroupProps>) {
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
    <RadioGroupContext.Provider value={ctxValue}>
      <View style={[styles.group, style]} {...rest}>
        {children}
      </View>
    </RadioGroupContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* RadioGroupItem                                                      */
/* ------------------------------------------------------------------ */

interface RadioGroupItemProps extends PressableProps {
  value: string;
  label?: string;
}

export function RadioGroupItem({
  value,
  label,
  style,
  disabled,
  ...rest
}: RadioGroupItemProps) {
  const group = useRadioGroup();
  const selected = group.value === value;

  const handlePress = () => {
    if (disabled) return;
    group.setValue(value);
    rest.onPress?.(undefined as any);
  };

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.item,
        pressed && !disabled && styles.itemPressed,
        style,
      ]}
      onPress={handlePress}
      {...rest}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      {label ? (
        <Text style={styles.labelText}>{label}</Text>
      ) : null}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  group: {
    flexDirection: 'column',
    gap: 8,
  } as any,
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  } as any,
  itemPressed: {
    opacity: 0.8,
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  radioOuterSelected: {
    borderColor: '#3B82F6', // blue-500
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  labelText: {
    fontSize: 14,
    color: '#111827',
  },
});
