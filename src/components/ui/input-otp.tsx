// src/components/ui/input-otp.tsx
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
  TextInput,
  Pressable,
  StyleSheet,
  ViewProps,
  TextInputProps,
} from 'react-native';

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface OTPContextValue {
  value: string;
  length: number;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

const OTPInputContext = createContext<OTPContextValue | null>(null);

function useOTPContext() {
  const ctx = useContext(OTPInputContext);
  if (!ctx) {
    throw new Error('InputOTPSlot must be used inside <InputOTP>.');
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/* InputOTP                                                            */
/* ------------------------------------------------------------------ */

interface InputOTPProps extends ViewProps {
  length: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function InputOTP({
  length,
  value,
  defaultValue = '',
  onChange,
  disabled,
  style,
  children,
  ...rest
}: PropsWithChildren<InputOTPProps>) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [activeIndex, setActiveIndex] = useState(0);

  const currentValue = (isControlled ? value : internalValue) ?? '';

  const handleChange = (next: string) => {
    const normalized = next.replace(/\D/g, '').slice(0, length);
    if (!isControlled) {
      setInternalValue(normalized);
    }
    onChange?.(normalized);
    setActiveIndex(Math.min(normalized.length, length - 1));
  };

  const ctxValue: OTPContextValue = useMemo(
    () => ({
      value: currentValue,
      length,
      activeIndex,
      setActiveIndex,
    }),
    [currentValue, length, activeIndex],
  );

  return (
    <OTPInputContext.Provider value={ctxValue}>
      <View
        style={[styles.container, disabled && styles.containerDisabled, style]}
        {...rest}
      >
        {/* 숨겨진 TextInput: 실제 입력은 여기서 받고, 슬롯은 보여주기 전용 */}
        <TextInput
          style={styles.hiddenInput}
          value={currentValue}
          onChangeText={handleChange}
          editable={!disabled}
          keyboardType="number-pad"
          maxLength={length}
        />
        {children}
      </View>
    </OTPInputContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* InputOTPGroup                                                       */
/* ------------------------------------------------------------------ */

interface InputOTPGroupProps extends ViewProps {}

export function InputOTPGroup({
  children,
  style,
  ...rest
}: PropsWithChildren<InputOTPGroupProps>) {
  return (
    <View style={[styles.group, style]} {...rest}>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* InputOTPSlot                                                        */
/* ------------------------------------------------------------------ */

interface InputOTPSlotProps extends ViewProps {
  index: number;
}

export function InputOTPSlot({
  index,
  style,
  ...rest
}: PropsWithChildren<InputOTPSlotProps>) {
  const { value, activeIndex, setActiveIndex } = useOTPContext();
  const char = value[index] ?? '';
  const isActive = activeIndex === index;
  const hasFakeCaret = isActive && !char;

  return (
    <Pressable
      onPress={() => setActiveIndex(index)}
      style={[
        styles.slot,
        isActive && styles.slotActive,
        style,
      ]}
      {...rest}
    >
      <Text style={styles.slotText}>{char}</Text>
      {hasFakeCaret && <View style={styles.caret} />}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* InputOTPSeparator                                                   */
/* ------------------------------------------------------------------ */

interface InputOTPSeparatorProps extends ViewProps {}

export function InputOTPSeparator({
  style,
  ...rest
}: PropsWithChildren<InputOTPSeparatorProps>) {
  return (
    <View style={[styles.separator, style]} {...rest}>
      <Text style={styles.separatorText}>-</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    // TextInput가 포커스를 받도록 width/height는 0이 아니어도 되지만
    // 화면에 안 보이게 하기 위해 이렇게.
    width: 0,
    height: 0,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slot: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    backgroundColor: '#F9FAFB', // gray-50
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotActive: {
    borderColor: '#3B82F6', // blue-500
  },
  slotText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  caret: {
    position: 'absolute',
    width: 2,
    height: 18,
    backgroundColor: '#111827',
  },
  separator: {
    marginHorizontal: 4,
  },
  separatorText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});
