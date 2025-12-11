// src/components/ui/sonner.tsx
import React from 'react';
import { ViewProps } from 'react-native';

// 느슨한 타입으로 두어서, 기존에 richColors, position 같은 prop을 줘도 에러 안 나게.
export interface ToasterProps extends ViewProps {
  [key: string]: any;
}

/**
 * React Native용 더미 Toaster
 * - 웹에서 sonner를 쓰던 자리를 채우기 위한 placeholder.
 * - 실제 토스트 기능은 없음. 나중에 라이브러리(expo-toast 등) 연결할 때 여기서 구현.
 */
export function Toaster(_props: ToasterProps) {
  return null;
}
