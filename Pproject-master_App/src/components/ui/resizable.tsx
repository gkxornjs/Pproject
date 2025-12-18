// src/components/ui/resizable.tsx
import React, { PropsWithChildren } from 'react';
import {
  View,
  StyleSheet,
  ViewProps,
  ViewStyle,
} from 'react-native';

/* ------------------------------------------------------------------ */
/* ResizablePanelGroup                                                 */
/* ------------------------------------------------------------------ */

type Direction = 'horizontal' | 'vertical';

interface ResizablePanelGroupProps extends ViewProps {
  direction?: Direction; // 'horizontal'이면 좌우, 'vertical'이면 상하 배치
}

export function ResizablePanelGroup({
  direction = 'horizontal',
  children,
  style,
  ...rest
}: PropsWithChildren<ResizablePanelGroupProps>) {
  return (
    <View
      style={[
        styles.group,
        direction === 'horizontal'
          ? styles.groupHorizontal
          : styles.groupVertical,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* ResizablePanel                                                      */
/* ------------------------------------------------------------------ */

interface ResizablePanelProps extends ViewProps {
  /** flex 비율 (예: 1, 2 등) */
  flex?: number;
}

export function ResizablePanel({
  flex = 1,
  children,
  style,
  ...rest
}: PropsWithChildren<ResizablePanelProps>) {
  const panelStyle: ViewStyle = { flex };

  return (
    <View style={[styles.panel, panelStyle, style]} {...rest}>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* ResizableHandle                                                     */
/* ------------------------------------------------------------------ */

interface ResizableHandleProps extends ViewProps {
  withHandle?: boolean;
  direction?: Direction;
}

export function ResizableHandle({
  withHandle,
  direction = 'horizontal',
  style,
  ...rest
}: PropsWithChildren<ResizableHandleProps>) {
  const isVertical = direction === 'vertical';

  return (
    <View
      style={[
        styles.handle,
        isVertical ? styles.handleHorizontal : styles.handleVertical,
        style,
      ]}
      {...rest}
    >
      {withHandle && (
        <View
          style={[
            styles.handleGrip,
            isVertical && styles.handleGripVertical,
          ]}
        />
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  group: {
    width: '100%',
    height: '100%',
  },
  groupHorizontal: {
    flexDirection: 'row',
  },
  groupVertical: {
    flexDirection: 'column',
  },
  panel: {
    minWidth: 0,
    minHeight: 0,
  },
  handle: {
    backgroundColor: '#E5E7EB', // gray-200
    justifyContent: 'center',
    alignItems: 'center',
  },
  handleVertical: {
    width: '100%',
    height: 8,
  },
  handleHorizontal: {
    width: 8,
    height: '100%',
  },
  handleGrip: {
    width: 24,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#9CA3AF', // gray-400
  },
  handleGripVertical: {
    width: 4,
    height: 24,
  },
});
