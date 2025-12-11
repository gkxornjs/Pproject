// src/components/ui/popover.tsx
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  PropsWithChildren,
} from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewProps,
  PressableProps,
  ViewStyle,
} from 'react-native';

type Align = 'start' | 'center' | 'end';

interface PopoverState {
  open: boolean;
  setOpen: (open: boolean) => void;
  align: Align;
  sideOffset: number;
}

const PopoverContext = createContext<PopoverState | null>(null);

function usePopover() {
  const ctx = useContext(PopoverContext);
  if (!ctx) {
    throw new Error('Popover* components must be used inside <Popover>');
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Root                                                                */
/* ------------------------------------------------------------------ */

interface PopoverProps extends ViewProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: Align;
  sideOffset?: number;
}

export function Popover({
  open,
  defaultOpen = false,
  onOpenChange,
  align = 'center',
  sideOffset = 4,
  children,
  style,
  ...rest
}: PropsWithChildren<PopoverProps>) {
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
    () => ({ open: currentOpen, setOpen, align, sideOffset }),
    [currentOpen, align, sideOffset],
  );

  return (
    <PopoverContext.Provider value={value}>
      <View style={[styles.root, style]} {...rest}>
        {children}
      </View>
    </PopoverContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Trigger                                                             */
/* ------------------------------------------------------------------ */

interface PopoverTriggerProps extends PressableProps {}

export function PopoverTrigger({
  children,
  ...rest
}: PropsWithChildren<PopoverTriggerProps>) {
  const { open, setOpen } = usePopover();

  const handlePress = () => {
    setOpen(!open);
    rest.onPress?.(undefined as any);
  };

  return (
    <Pressable onPress={handlePress} {...rest}>
      {children}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Anchor (RN에서는 별도 기능 없이 래퍼 정도로 사용 가능)            */
/* ------------------------------------------------------------------ */

interface PopoverAnchorProps extends ViewProps {}

export function PopoverAnchor({
  children,
  style,
  ...rest
}: PropsWithChildren<PopoverAnchorProps>) {
  return (
    <View style={style} {...rest}>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

interface PopoverContentProps extends ViewProps {
  align?: Align;
  sideOffset?: number;
}

export function PopoverContent({
  children,
  style,
  align: alignProp,
  sideOffset: sideOffsetProp,
  ...rest
}: PropsWithChildren<PopoverContentProps>) {
  const { open, align, sideOffset } = usePopover();

  if (!open) return null;

  const finalAlign = alignProp ?? align;
  const finalOffset = sideOffsetProp ?? sideOffset;

  const alignmentStyle: ViewStyle =
    finalAlign === 'start'
      ? { left: 0 }
      : finalAlign === 'end'
      ? { right: 0 }
      : { left: '50%', transform: [{ translateX: -72 }] }; // width≈144 기준

  return (
    <View
      style={[
        styles.content,
        alignmentStyle,
        { marginTop: finalOffset },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  root: {
    position: 'relative',
  },
  content: {
    position: 'absolute',
    top: '100%',
    width: 144,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    zIndex: 50,
  },
});
