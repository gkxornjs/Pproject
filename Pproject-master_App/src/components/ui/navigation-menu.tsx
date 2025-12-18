// src/components/ui/navigation.tsx
import React, { PropsWithChildren } from 'react';
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
/* Root                                                                */
/* ------------------------------------------------------------------ */

interface NavigationMenuProps extends ViewProps {
  viewport?: boolean; // 웹 API 유지용, RN에서는 의미만 남김
}

export function NavigationMenu({
  children,
  style,
  viewport = true,
  ...rest
}: PropsWithChildren<NavigationMenuProps>) {
  return (
    <View
      // data-viewport 같은 건 RN에서는 안 쓰지만 구조만 유지
      style={[styles.root, style]}
      {...rest}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* List / Item                                                         */
/* ------------------------------------------------------------------ */

interface NavigationMenuListProps extends ViewProps {}

export function NavigationMenuList({
  children,
  style,
  ...rest
}: PropsWithChildren<NavigationMenuListProps>) {
  return (
    <View style={[styles.list, style]} {...rest}>
      {children}
    </View>
  );
}

interface NavigationMenuItemProps extends ViewProps {}

export function NavigationMenuItem({
  children,
  style,
  ...rest
}: PropsWithChildren<NavigationMenuItemProps>) {
  return (
    <View style={[styles.item, style]} {...rest}>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Trigger                                                             */
/* ------------------------------------------------------------------ */

interface NavigationMenuTriggerProps
  extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
}
export function NavigationMenuTrigger({
  children,
  style,
  ...rest
}: PropsWithChildren<NavigationMenuTriggerProps>) {
  return (
    <Pressable
      style={({ pressed }) => [
        navigationMenuTriggerStyle(),
        pressed && styles.triggerPressed,
        style,
      ]}
      {...rest}
    >
      <View style={styles.triggerContent}>
        {typeof children === 'string' ? (
          <Text style={styles.triggerText}>{children}</Text>
        ) : (
          children
        )}
        {/* 간단한 아래 화살표 표시 */}
        <Text style={styles.triggerChevron}>⌄</Text>
      </View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

interface NavigationMenuContentProps extends ViewProps {}

export function NavigationMenuContent({
  children,
  style,
  ...rest
}: PropsWithChildren<NavigationMenuContentProps>) {
  // 웹처럼 애니메이션/위치 계산까지는 하지 않고
  // 단순히 아래쪽에 표시되는 패널로 사용
  return (
    <View style={[styles.content, style]} {...rest}>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Viewport                                                            */
/* ------------------------------------------------------------------ */

interface NavigationMenuViewportProps extends ViewProps {}

export function NavigationMenuViewport({
  style,
  ...rest
}: PropsWithChildren<NavigationMenuViewportProps>) {
  // 웹의 "mega menu 영역" 개념이었는데,
  // RN에서는 단순한 컨테이너로만 둠 (실제로 안 써도 됨)
  return <View style={[styles.viewport, style]} {...rest} />;
}

/* ------------------------------------------------------------------ */
/* Link                                                                */
/* ------------------------------------------------------------------ */

interface NavigationMenuLinkProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
}

export function NavigationMenuLink({
  children,
  style,
  ...rest
}: PropsWithChildren<NavigationMenuLinkProps>) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.link,
        pressed && styles.linkPressed,
        style,
      ]}
      {...rest}
    >
      {typeof children === 'string' ? (
        <Text style={styles.linkText}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Indicator                                                           */
/* ------------------------------------------------------------------ */

interface NavigationMenuIndicatorProps extends ViewProps {}

export function NavigationMenuIndicator({
  style,
  ...rest
}: PropsWithChildren<NavigationMenuIndicatorProps>) {
  // 웹에서는 활성 메뉴 아래 작은 다이아몬드 표시
  // RN에서는 그냥 아래쪽 삼각형 느낌의 박스로 표현
  return (
    <View style={[styles.indicatorWrapper, style]} {...rest}>
      <View style={styles.indicator} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Trigger style helper (cva 대체)                                     */
/* ------------------------------------------------------------------ */

export function navigationMenuTriggerStyle(): ViewStyle {
  return {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  };
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  root: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  list: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  } as any,
  item: {
    position: 'relative',
    marginHorizontal: 2,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  triggerChevron: {
    marginLeft: 4,
    fontSize: 10,
    color: '#6B7280',
  },
  triggerPressed: {
    backgroundColor: '#EEF2FF',
  },
  content: {
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  viewport: {
    // 필요하면 NavigationMenu 아래에 큰 페널용으로 사용
    marginTop: 8,
  },
  link: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkPressed: {
    backgroundColor: '#F3F4F6',
  },
  linkText: {
    fontSize: 14,
    color: '#111827',
  },
  indicatorWrapper: {
    alignItems: 'center',
    marginTop: 2,
  },
  indicator: {
    width: 8,
    height: 8,
    backgroundColor: '#E5E7EB',
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
  },
});
