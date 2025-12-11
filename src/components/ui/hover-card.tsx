// src/components/ui/hover-card.tsx
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
  StyleSheet,
  ViewProps,
  PressableProps,
  ViewStyle,
} from 'react-native';

type Align = 'start' | 'center' | 'end';

interface HoverCardState {
  open: boolean;
  setOpen: (open: boolean) => void;
  align: Align;
  sideOffset: number;
}

const HoverCardContext = createContext<HoverCardState | null>(null);

function useHoverCardContext() {
  const ctx = useContext(HoverCardContext);
  if (!ctx) {
    throw new Error('HoverCard components must be used inside <HoverCard>');
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Root                                                                */
/* ------------------------------------------------------------------ */

interface HoverCardProps extends ViewProps {
  align?: Align;
  sideOffset?: number;
}

export function HoverCard({
  align = 'center',
  sideOffset = 4,
  children,
  style,
  ...rest
}: PropsWithChildren<HoverCardProps>) {
  const [open, setOpen] = useState(false);

  const value = useMemo(
    () => ({ open, setOpen, align, sideOffset }),
    [open, align, sideOffset],
  );

  return (
    <HoverCardContext.Provider value={value}>
      <View style={[styles.root, style]} {...rest}>
        {children}
      </View>
    </HoverCardContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Trigger                                                              */
/* ------------------------------------------------------------------ */

interface HoverCardTriggerProps extends PressableProps {}

export function HoverCardTrigger({
  children,
  ...rest
}: PropsWithChildren<HoverCardTriggerProps>) {
  const { setOpen } = useHoverCardContext();

  return (
    <Pressable
      onPressIn={() => setOpen(true)}
      onPressOut={() => setOpen(false)}
      {...rest}
    >
      {children}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Content                                                              */
/* ------------------------------------------------------------------ */

interface HoverCardContentProps extends ViewProps {
  align?: Align;
  sideOffset?: number;
}

export function HoverCardContent({
  children,
  style,
  align: alignProp,
  sideOffset: offsetProp,
  ...rest
}: PropsWithChildren<HoverCardContentProps>) {
  const { open, align, sideOffset } = useHoverCardContext();

  if (!open) return null;

  const finalAlign = alignProp ?? align;
  const finalOffset = offsetProp ?? sideOffset;

  const alignmentStyle: ViewStyle =
  finalAlign === 'start'
    ? { left: 0 }
    : finalAlign === 'end'
    ? { right: 0 }
    : { left: '50%', transform: [{ translateX: -75 }] };
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
/* Styles                                                               */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  root: {
    position: 'relative',
  },
  content: {
    position: 'absolute',
    top: '100%',
    width: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    zIndex: 50,
  },
});
