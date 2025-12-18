import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';

interface AlertDialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

interface AlertDialogProps {
  open?: boolean; // 컨트롤 모드도 지원
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const value = useMemo<AlertDialogContextValue>(
    () => ({
      open: isControlled ? !!open : internalOpen,
      setOpen: (next) => {
        if (!isControlled) setInternalOpen(next);
        onOpenChange?.(next);
      },
    }),
    [isControlled, open, internalOpen, onOpenChange],
  );

  return (
    <AlertDialogContext.Provider value={value}>
      {children}
    </AlertDialogContext.Provider>
  );
}

function useAlertDialogContext() {
  const ctx = useContext(AlertDialogContext);
  if (!ctx) {
    throw new Error('AlertDialog* components must be used inside <AlertDialog>.');
  }
  return ctx;
}

/* Trigger: 다이얼로그 열기 버튼 */
interface TriggerProps {
  children: ReactNode;
}

export function AlertDialogTrigger({ children }: TriggerProps) {
  const { setOpen } = useAlertDialogContext();

  return (
    <Pressable onPress={() => setOpen(true)}>
      {typeof children === 'string' ? (
        <Text style={styles.triggerText}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

/* Portal: 웹에선 의미 있었지만 RN에서는 그냥 children만 반환 */
interface PortalProps {
  children: ReactNode;
}

export function AlertDialogPortal({ children }: PortalProps) {
  return <>{children}</>;
}

/* Overlay: Content 안에서만 써서 스타일 용도로 사용 */
interface OverlayProps {
  children?: ReactNode;
}

export function AlertDialogOverlay({ children }: OverlayProps) {
  return <View style={styles.overlay}>{children}</View>;
}

/* Content: Modal + 카드 UI */
interface ContentProps {
  children: ReactNode;
}

export function AlertDialogContent({ children }: ContentProps) {
  const { open, setOpen } = useAlertDialogContext();

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <AlertDialogOverlay>
        <Pressable
          style={styles.overlayPressable}
          onPress={() => setOpen(false)}
        >
          {/* 안쪽 카드 누를 때 닫히지 않게 */}
          <Pressable
            style={styles.content}
            onPress={(e: GestureResponderEvent) => e.stopPropagation()}
          >
            {children}
          </Pressable>
        </Pressable>
      </AlertDialogOverlay>
    </Modal>
  );
}

/* Header / Footer / Title / Description */

interface ViewLikeProps {
  children: ReactNode;
  style?: any;
}

export function AlertDialogHeader({ children, style }: ViewLikeProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function AlertDialogFooter({ children, style }: ViewLikeProps) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

interface TitleProps {
  children: ReactNode;
  style?: any;
}

export function AlertDialogTitle({ children, style }: TitleProps) {
  return (
    <Text style={[styles.title, style]}>
      {children}
    </Text>
  );
}

interface DescriptionProps {
  children: ReactNode;
  style?: any;
}

export function AlertDialogDescription({ children, style }: DescriptionProps) {
  return (
    <Text style={[styles.description, style]}>
      {children}
    </Text>
  );
}

/* Action / Cancel 버튼 */

interface ButtonProps {
  children: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: any;
}

export function AlertDialogAction({ children, onPress, style }: ButtonProps) {
  const { setOpen } = useAlertDialogContext();

  const handlePress = (e: GestureResponderEvent) => {
    onPress?.(e);
    setOpen(false);
  };

  return (
    <Pressable style={[styles.actionButton, style]} onPress={handlePress}>
      <Text style={styles.actionButtonText}>{children}</Text>
    </Pressable>
  );
}

export function AlertDialogCancel({ children, onPress, style }: ButtonProps) {
  const { setOpen } = useAlertDialogContext();

  const handlePress = (e: GestureResponderEvent) => {
    onPress?.(e);
    setOpen(false);
  };

  return (
    <Pressable style={[styles.cancelButton, style]} onPress={handlePress}>
      <Text style={styles.cancelButtonText}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  triggerText: {
    color: '#007aff',
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayPressable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    marginBottom: 8,
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#444',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#007aff',
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '500',
  },
});
