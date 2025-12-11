// src/components/ui/use-mobile.ts
import * as React from 'react';
import { useWindowDimensions } from 'react-native';

const MOBILE_BREAKPOINT = 768; // px 기준, 대략 태블릿 전까지 모바일로 간주

export function useIsMobile() {
  const { width } = useWindowDimensions();
  // width는 RN에서 항상 값이 있음
  return width < MOBILE_BREAKPOINT;
}
