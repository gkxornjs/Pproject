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
  Pressable,
  StyleSheet,
  ViewProps,
  PressableProps,
  TextProps,
  ViewStyle,
  StyleProp,
} from 'react-native';

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface TabsContextValue {
  value?: string;
  setValue: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('Tabs* components must be used inside <Tabs>.');
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Tabs Root                                                           */
/* ------------------------------------------------------------------ */

interface TabsProps extends ViewProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  children,
  style,
  ...rest
}: PropsWithChildren<TabsProps>) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue,
  );

  const currentValue = isControlled ? value : internalValue;

  const setValue = (next: string) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };

  const ctxValue: TabsContextValue = useMemo(
    () => ({ value: currentValue, setValue }),
    [currentValue],
  );

  return (
    <TabsContext.Provider value={ctxValue}>
      <View style={[styles.tabsRoot, style]} {...rest}>
        {children}
      </View>
    </TabsContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* TabsList                                                            */
/* ------------------------------------------------------------------ */

interface TabsListProps extends ViewProps {}

export function TabsList({
  children,
  style,
  ...rest
}: PropsWithChildren<TabsListProps>) {
  return (
    <View style={[styles.tabsList, style]} {...rest}>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* TabsTrigger                                                         */
/* ------------------------------------------------------------------ */

interface TabsTriggerProps extends Omit<PressableProps, 'style'> {
  value: string;
  style?: StyleProp<ViewStyle>;
}

export function TabsTrigger({
  value,
  children,
  style,
  ...rest
}: PropsWithChildren<TabsTriggerProps>) {
  const { value: active, setValue } = useTabsContext();
  const isActive = active === value;

  const handlePress = () => {
    setValue(value);
    rest.onPress?.(undefined as any);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.tabsTrigger,
        isActive && styles.tabsTriggerActive,
        pressed && styles.tabsTriggerPressed,
        style,
      ]}
      onPress={handlePress}
      {...rest}
    >
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.tabsTriggerText,
            isActive && styles.tabsTriggerTextActive,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* TabsContent                                                         */
/* ------------------------------------------------------------------ */

interface TabsContentProps extends ViewProps {
  value: string;
}

export function TabsContent({
  value,
  children,
  style,
  ...rest
}: PropsWithChildren<TabsContentProps>) {
  const { value: active } = useTabsContext();

  if (active !== value) return null;

  return (
    <View style={[styles.tabsContent, style]} {...rest}>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  tabsRoot: {
    flexDirection: 'column',
    gap: 8,
  } as any,
  tabsList: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    padding: 3,
    borderRadius: 999,
    backgroundColor: '#F3F4F6', // gray-100
  },
  tabsTrigger: {
    height: 32,
    minWidth: 64,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabsTriggerActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  tabsTriggerPressed: {
    opacity: 0.8,
  },
  tabsTriggerText: {
    fontSize: 14,
    color: '#4B5563',
  },
  tabsTriggerTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
  tabsContent: {
    flex: 1,
    marginTop: 8,
  },
});
