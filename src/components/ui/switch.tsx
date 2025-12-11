// src/components/ui/switch.tsx
import React from 'react';
import { Switch as RNSwitch, SwitchProps as RNSwitchProps, View, StyleSheet } from 'react-native';

interface SwitchProps extends RNSwitchProps {
  // Radix Root에서 쓰던 className 등은 제거
}

/**
 * React Native용 Switch
 * - Radix Switch 대체
 * - controlled (value + onValueChange) / uncontrolled (defaultValue) 모두 지원하려면
 *   외부에서 value + onValueChange를 쓰는 패턴을 권장.
 */
export function Switch({ value, onValueChange, disabled, style, ...rest }: SwitchProps) {
  return (
    <View style={style}>
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}   // gray-200 / blue-500
        thumbColor={disabled ? '#9CA3AF' : '#FFFFFF'}        // gray-400 / white
        ios_backgroundColor="#E5E7EB"
        {...rest}
      />
    </View>
  );
}
