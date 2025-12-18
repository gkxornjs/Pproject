// src/components/ui/collapsible.tsx
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
  LayoutAnimation,
  Platform,
  UIManager,
  ViewProps,
  PressableProps,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CollapsibleContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext() {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) {
    throw new Error(
      'Collapsible components must be used inside <Collapsible>',
    );
  }
  return ctx;
}

interface CollapsibleProps extends ViewProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Collapsible({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  style,
  ...rest
}: PropsWithChildren<CollapsibleProps>) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const currentOpen = isControlled ? !!open : internalOpen;

  const setOpen = (next: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const value = useMemo(
    () => ({
      open: currentOpen,
      setOpen,
    }),
    [currentOpen],
  );

  return (
    <CollapsibleContext.Provider value={value}>
      <View style={style} {...rest}>
        {children}
      </View>
    </CollapsibleContext.Provider>
  );
}

interface CollapsibleTriggerProps extends PressableProps {}

export function CollapsibleTrigger({
  children,
  ...rest
}: PropsWithChildren<CollapsibleTriggerProps>) {
  const { open, setOpen } = useCollapsibleContext();

  const handlePress = () => {
    setOpen(!open);
  };

  return (
    <Pressable onPress={handlePress} {...rest}>
      {children}
    </Pressable>
  );
}

interface CollapsibleContentProps extends ViewProps {}

export function CollapsibleContent({
  children,
  style,
  ...rest
}: PropsWithChildren<CollapsibleContentProps>) {
  const { open } = useCollapsibleContext();

  if (!open) return null;

  return (
    <View style={[styles.content, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    overflow: 'hidden',
  },
});
