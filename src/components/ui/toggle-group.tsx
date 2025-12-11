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
  ViewStyle,
  StyleProp,
} from 'react-native';

/* ------------------------------------------------------------------ */
/* 타입 정의 (toggleVariants 대체용)                                   */
/* ------------------------------------------------------------------ */

type ToggleVariant = 'default' | 'outline';
type ToggleSize = 'default' | 'sm' | 'lg';

type ToggleGroupType = 'single' | 'multiple';

interface ToggleGroupContextValue {
  type: ToggleGroupType;
  value: string | string[] | undefined;
  setValue: (val: string) => void;
  variant?: ToggleVariant;
  size?: ToggleSize;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

function useToggleGroup() {
  const ctx = useContext(ToggleGroupContext);
  if (!ctx) {
    throw new Error('ToggleGroupItem must be used inside <ToggleGroup>');
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/* ToggleGroup Root                                                    */
/* ------------------------------------------------------------------ */

interface ToggleGroupProps extends ViewProps {
  type?: ToggleGroupType;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  variant?: ToggleVariant;
  size?: ToggleSize;
}

export function ToggleGroup({
  type = 'single',
  value,
  defaultValue,
  onValueChange,
  variant = 'default',
  size = 'default',
  children,
  style,
  ...rest
}: PropsWithChildren<ToggleGroupProps>) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | string[] | undefined>(
    defaultValue,
  );

  const currentValue = isControlled ? value : internalValue;

  const setValue = (val: string) => {
    if (type === 'single') {
      const next = val;
      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    } else {
      // multiple
      const arr = Array.isArray(currentValue) ? currentValue : [];
      const exists = arr.includes(val);
      const next = exists ? arr.filter((v) => v !== val) : [...arr, val];
      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    }
  };

  const ctxValue: ToggleGroupContextValue = useMemo(
    () => ({
      type,
      value: currentValue,
      setValue,
      variant,
      size,
    }),
    [type, currentValue, variant, size],
  );

  return (
    <ToggleGroupContext.Provider value={ctxValue}>
      <View style={[styles.group, style]} {...rest}>
        {children}
      </View>
    </ToggleGroupContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* ToggleGroupItem                                                     */
/* ------------------------------------------------------------------ */

interface ToggleGroupItemProps extends Omit<PressableProps, 'style'> {
  value: string;
  variant?: ToggleVariant;
  size?: ToggleSize;
  style?: StyleProp<ViewStyle>;
}

export function ToggleGroupItem({
  value,
  children,
  variant: propVariant,
  size: propSize,
  style,
  ...rest
}: PropsWithChildren<ToggleGroupItemProps>) {
  const { value: groupValue, setValue, variant, size } = useToggleGroup();

  const isSelected =
    Array.isArray(groupValue) ? groupValue.includes(value) : groupValue === value;

  const finalVariant = propVariant ?? variant ?? 'default';
  const finalSize = propSize ?? size ?? 'default';

  const handlePress = () => {
    setValue(value);
    rest.onPress?.(undefined as any);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.itemBase,
        getVariantStyle(finalVariant, isSelected),
        getSizeStyle(finalSize),
        pressed && styles.itemPressed,
        style,
      ]}
      onPress={handlePress}
      {...rest}
    >
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.itemText,
            isSelected && styles.itemTextSelected,
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
/* 스타일 헬퍼                                                          */
/* ------------------------------------------------------------------ */

function getVariantStyle(variant: ToggleVariant, active: boolean) {
  switch (variant) {
    case 'outline':
      return {
        borderWidth: 1,
        borderColor: active ? '#3B82F6' : '#D1D5DB', // blue-500 / gray-300
        backgroundColor: active ? '#EFF6FF' : '#FFFFFF', // blue-50 / white
      };
    case 'default':
    default:
      return {
        borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: active ? '#3B82F6' : 'transparent',
      };
  }
}

function getSizeStyle(size: ToggleSize) {
  switch (size) {
    case 'sm':
      return {
        height: 28,
        paddingHorizontal: 8,
        paddingVertical: 4,
      };
    case 'lg':
      return {
        height: 40,
        paddingHorizontal: 12,
        paddingVertical: 8,
      };
    case 'default':
    default:
      return {
        height: 32,
        paddingHorizontal: 10,
        paddingVertical: 6,
      };
  }
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  itemBase: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemPressed: {
    opacity: 0.8,
  },
  itemText: {
    fontSize: 14,
    color: '#374151', // gray-700
  },
  itemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
