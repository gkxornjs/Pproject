// src/components/ui/tooltip.tsx
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  PropsWithChildren,
  ReactElement,
} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewProps,
  PressableProps,
  ViewStyle,
  StyleProp,
} from 'react-native';

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltipContext() {
  const ctx = useContext(TooltipContext);
  if (!ctx) {
    throw new Error('Tooltip* components must be used inside <Tooltip>.');
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/* TooltipProvider (web API 유지용, RN에선 단순 래퍼)                   */
/* ------------------------------------------------------------------ */

interface TooltipProviderProps extends ViewProps {
  delayDuration?: number;
}

export function TooltipProvider({
  children,
}: PropsWithChildren<TooltipProviderProps>) {
  // delayDuration은 RN에서 사용하지 않음
  return <>{children}</>;
}

/* ------------------------------------------------------------------ */
/* Tooltip Root                                                        */
/* ------------------------------------------------------------------ */

interface TooltipProps extends ViewProps {}

export function Tooltip({
  children,
  style,
  ...rest
}: PropsWithChildren<TooltipProps>) {
  const [open, setOpen] = useState(false);

  const value = useMemo(
    () => ({ open, setOpen }),
    [open],
  );

  return (
    <TooltipContext.Provider value={value}>
      <View style={[style]} {...rest}>
        {children}
      </View>
    </TooltipContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* TooltipTrigger                                                      */
/* ------------------------------------------------------------------ */

interface TooltipTriggerProps extends PressableProps {
  asChild?: boolean;
}

export function TooltipTrigger({
  asChild,
  children,
  ...rest
}: PropsWithChildren<TooltipTriggerProps>) {
  const { setOpen } = useTooltipContext();

  const handlePressIn = () => setOpen(true);
  const handlePressOut = () => setOpen(false);

  if (asChild && React.isValidElement(children)) {
    // 자식 컴포넌트에 이벤트 주입 (Radix asChild 패턴)
    const child = children as ReactElement<any>;
    return React.cloneElement(child, {
      onPressIn: (e: any) => {
        child.props.onPressIn?.(e);
        handlePressIn();
      },
      onPressOut: (e: any) => {
        child.props.onPressOut?.(e);
        handlePressOut();
      },
    });
  }

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...rest}
    >
      {children}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* TooltipContent                                                      */
/* ------------------------------------------------------------------ */

interface TooltipContentProps extends ViewProps {
  // web API 유지용 prop들 (side, align, hidden 등)이 넘어와도 에러 안 나게 느슨하게 받기
  side?: 'top' | 'right' | 'bottom' | 'left';
  hidden?: boolean;
}

export function TooltipContent({
  children,
  style,
  hidden,
  side = 'right',
  ...rest
}: PropsWithChildren<TooltipContentProps>) {
  const { open } = useTooltipContext();

  if (!open || hidden) return null;

  // 기본 위치: 오른쪽
  const positionStyle: ViewStyle = {};

  // 수평 정렬 (start / center / end 같은게 필요하다면 여기서 alignSelf로 처리)
  // 일단 center만 쓰고 싶으면 필요 없고, 아래처럼 해도 됨:
  positionStyle.alignSelf = 'center';

  // 사이드에 따라 위/아래/좌/우 위치 설정
  switch (side) {
    case 'top':
      positionStyle.bottom = '100%';
      positionStyle.marginBottom = 8;
      break;
    case 'bottom':
      positionStyle.top = '100%';
      positionStyle.marginTop = 8;
      break;
    case 'left':
      positionStyle.right = '100%';
      positionStyle.marginRight = 8;
      break;
    case 'right':
    default:
      positionStyle.left = '100%';
      positionStyle.marginLeft = 8;
      break;
  }

  return (
    <View style={styles.contentContainer} pointerEvents="none">
      <View
        style={[styles.content, positionStyle, style]}
        {...rest}
      >
        {typeof children === 'string' ? (
          <Text style={styles.contentText}>{children}</Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
}


/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  contentContainer: {
    position: 'absolute',
    zIndex: 50,
  },
  content: {
    maxWidth: 200,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#111827', // dark bg
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  contentText: {
    fontSize: 12,
    color: '#F9FAFB',
  },
});
