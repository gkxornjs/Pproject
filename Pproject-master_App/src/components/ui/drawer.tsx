// src/components/ui/drawer.tsx
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
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
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

type DrawerSide = 'bottom' | 'top' | 'left' | 'right';

interface DrawerState {
  open: boolean;
  setOpen: (open: boolean) => void;
  side: DrawerSide;
}

const DrawerContext = createContext<DrawerState | null>(null);

function useDrawerContext() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('Drawer components must be used inside <Drawer>');
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Root                                                               */
/* ------------------------------------------------------------------ */

interface DrawerProps extends ViewProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: DrawerSide;
}

export function Drawer({
  open,
  defaultOpen = false,
  onOpenChange,
  side = 'bottom',
  children,
  style,
  ...rest
}: PropsWithChildren<DrawerProps>) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const currentOpen = isControlled ? !!open : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const value = useMemo(
    () => ({ open: currentOpen, setOpen, side }),
    [currentOpen, side],
  );

  return (
    <DrawerContext.Provider value={value}>
      <View style={style} {...rest}>
        {children}
      </View>
    </DrawerContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Trigger                                                             */
/* ------------------------------------------------------------------ */

interface DrawerTriggerProps extends PressableProps {}

export function DrawerTrigger({
  children,
  ...rest
}: PropsWithChildren<DrawerTriggerProps>) {
  const { setOpen } = useDrawerContext();

  const handlePress = () => {
    setOpen(true);
    rest.onPress?.(undefined as any);
  };

  return (
    <Pressable onPress={handlePress} {...rest}>
      {children}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Portal / Overlay                                                    */
/* ------------------------------------------------------------------ */

interface DrawerPortalProps extends ViewProps {}

export function DrawerPortal({
  children,
}: PropsWithChildren<DrawerPortalProps>) {
  // 웹처럼 Portal이 따로 필요 없어서 그대로 children 반환
  return <>{children}</>;
}

interface DrawerOverlayProps extends ViewProps {}

export function DrawerOverlay({
  style,
  ...rest
}: PropsWithChildren<DrawerOverlayProps>) {
  return <View style={[styles.overlay, style]} {...rest} />;
}

/* ------------------------------------------------------------------ */
/* Content (Modal + 방향별 위치)                                      */
/* ------------------------------------------------------------------ */

interface DrawerContentProps extends ViewProps {}

export function DrawerContent({
  children,
  style,
  ...rest
}: PropsWithChildren<DrawerContentProps>) {
  const { open, setOpen, side } = useDrawerContext();

  const containerStyle = getContainerStyle(side);
  const contentStyle = getContentStyle(side);

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={() => setOpen(false)}
    >
      <Pressable
        style={styles.backdrop}
        onPress={() => setOpen(false)}
      >
        <View style={containerStyle}>
          <Pressable
            style={[styles.contentBase, contentStyle, style]}
            onPress={(e) => e.stopPropagation()}
            {...rest}
          >
            {/* 바텀 드로어용 핸들 바 */}
            {side === 'bottom' && (
              <View style={styles.handleWrapper}>
                <View style={styles.handle} />
              </View>
            )}
            {children}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Close                                                               */
/* ------------------------------------------------------------------ */

interface DrawerCloseProps extends PressableProps {}

export function DrawerClose({
  children,
  style,
  ...rest
}: PropsWithChildren<DrawerCloseProps>) {
  const { setOpen } = useDrawerContext();

  const handlePress = () => {
    setOpen(false);
    rest.onPress?.(undefined as any);
  };

  return (
    <Pressable onPress={handlePress} style={style} {...rest}>
      {children}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Header / Footer / Title / Description                              */
/* ------------------------------------------------------------------ */

interface DrawerHeaderProps extends ViewProps {}

export function DrawerHeader({
  children,
  style,
  ...rest
}: PropsWithChildren<DrawerHeaderProps>) {
  return (
    <View style={[styles.header, style]} {...rest}>
      {children}
    </View>
  );
}

interface DrawerFooterProps extends ViewProps {}

export function DrawerFooter({
  children,
  style,
  ...rest
}: PropsWithChildren<DrawerFooterProps>) {
  return (
    <View style={[styles.footer, style]} {...rest}>
      {children}
    </View>
  );
}

interface DrawerTitleProps extends TextProps {}

export function DrawerTitle({
  children,
  style,
  ...rest
}: PropsWithChildren<DrawerTitleProps>) {
  return (
    <Text style={[styles.title, style]} {...rest}>
      {children}
    </Text>
  );
}

interface DrawerDescriptionProps extends TextProps {}

export function DrawerDescription({
  children,
  style,
  ...rest
}: PropsWithChildren<DrawerDescriptionProps>) {
  return (
    <Text style={[styles.description, style]} {...rest}>
      {children}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getContainerStyle(side: DrawerSide): StyleProp<ViewStyle> {
  switch (side) {
    case 'top':
      return [styles.container, { justifyContent: 'flex-start' }] as StyleProp<ViewStyle>;
    case 'bottom':
      return [styles.container, { justifyContent: 'flex-end' }] as StyleProp<ViewStyle>;
    case 'left':
      return [
        styles.container,
        { justifyContent: 'center', alignItems: 'flex-start' },
      ] as StyleProp<ViewStyle>;
    case 'right':
      return [
        styles.container,
        { justifyContent: 'center', alignItems: 'flex-end' },
      ] as StyleProp<ViewStyle>;
    default:
      return [styles.container] as StyleProp<ViewStyle>;
  }
}

function getContentStyle(side: DrawerSide): ViewStyle {
  switch (side) {
    case 'top':
      return {
        width: '100%',
        maxHeight: '80%',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
      } as ViewStyle;
    case 'bottom':
      return {
        width: '100%',
        maxHeight: '80%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      } as ViewStyle;
    case 'left':
      return {
        width: '75%',
        height: '100%',
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
      } as ViewStyle;
    case 'right':
      return {
        width: '75%',
        height: '100%',
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
      } as ViewStyle;
    default:
      return { width: '100%' } as ViewStyle;
  }
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // overlay 역할
  },
  contentBase: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  handleWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  handle: {
    width: 100,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
  },
  header: {
    marginBottom: 8,
  },
  footer: {
    marginTop: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
  },
});
