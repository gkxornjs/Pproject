import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AccordionType = 'single' | 'multiple';

interface AccordionProps {
  type?: AccordionType; // 'single'이면 한 개만 열림, 'multiple'이면 여러 개 가능
  children: ReactNode;
}

/** 내부에서 어떤 아이템이 열려 있는지 관리하는 컨텍스트 */
interface AccordionContextValue {
  type: AccordionType;
  openItems: string[];
  toggleItem: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

export function Accordion({ type = 'single', children }: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (value: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenItems((prev) => {
      const isOpen = prev.includes(value);

      if (type === 'single') {
        return isOpen ? [] : [value];
      }
      // multiple
      if (isOpen) {
        return prev.filter((v) => v !== value);
      }
      return [...prev, value];
    });
  };

  const ctxValue = useMemo(
    () => ({ type, openItems, toggleItem }),
    [type, openItems],
  );

  return (
    <AccordionContext.Provider value={ctxValue}>
      <View>{children}</View>
    </AccordionContext.Provider>
  );
}

/* 개별 아이템 컨텍스트 (열림 여부 공유) */
interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(
  null,
);

interface AccordionItemProps {
  value: string;
  children: ReactNode;
}

export function AccordionItem({ value, children }: AccordionItemProps) {
  const accordion = useContext(AccordionContext);
  if (!accordion) {
    throw new Error('AccordionItem must be used inside <Accordion>');
  }

  const isOpen = accordion.openItems.includes(value);
  const itemCtx = useMemo(
    () => ({ value, isOpen }),
    [value, isOpen],
  );

  return (
    <AccordionItemContext.Provider value={itemCtx}>
      <View style={styles.item}>{children}</View>
    </AccordionItemContext.Provider>
  );
}

interface AccordionTriggerProps {
  children: ReactNode;
}

export function AccordionTrigger({ children }: AccordionTriggerProps) {
  const accordion = useContext(AccordionContext);
  const item = useContext(AccordionItemContext);

  if (!accordion || !item) {
    throw new Error('AccordionTrigger must be used inside <AccordionItem>');
  }

  const handlePress = () => {
    accordion.toggleItem(item.value);
  };

  return (
    <Pressable onPress={handlePress} style={styles.trigger}>
      <View style={styles.triggerContent}>
        <View style={{ flex: 1 }}>
          {typeof children === 'string' ? (
            <Text style={styles.triggerText}>{children}</Text>
          ) : (
            children
          )}
        </View>
        <Text
          style={[
            styles.chevron,
            item.isOpen && styles.chevronOpen,
          ]}
        >
          ⌄
        </Text>
      </View>
    </Pressable>
  );
}

interface AccordionContentProps {
  children: ReactNode;
}

export function AccordionContent({ children }: AccordionContentProps) {
  const item = useContext(AccordionItemContext);
  if (!item) {
    throw new Error('AccordionContent must be used inside <AccordionItem>');
  }

  if (!item.isOpen) return null;

  return <View style={styles.content}>{children}</View>;
}

const styles = StyleSheet.create({
  item: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  trigger: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 8,
    fontSize: 14,
    transform: [{ rotate: '0deg' }],
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  content: {
    paddingBottom: 12,
    paddingHorizontal: 4,
  },
});
