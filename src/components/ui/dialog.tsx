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

/* ------------------------------------------------------------------ */
/* Context                                                            */
/* ------------------------------------------------------------------ */

interface DialogState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogState | null>(null);

function useDialogContext() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('Dialog components must be used inside <Dialog>');
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Root Dialog                                                         */
/* ------------------------------------------------------------------ */

interface DialogProps extends ViewProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dialog({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  style,
  ...rest
}: PropsWithChildren<DialogProps>) {
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
    () => ({ open: currentOpen, setOpen }),
    [currentOpen],
  );

  return (
    <DialogContext.Provider value={value}>
      <View style={style} {...rest}>
        {children}
      </View>
    </DialogContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Trigger                                                             */
/* ------------------------------------------------------------------ */

interface DialogTriggerProps extends PressableProps {}

export function DialogTrigger({
  children,
  ...rest
}: PropsWithChildren<DialogTriggerProps>) {
  const { setOpen } = useDialogContext();

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
/* Portal / Overlay (RN에서는 최소 구현)                               */
/* ------------------------------------------------------------------ */

interface DialogPortalProps extends ViewProps {}

export function DialogPortal({
  children,
}: PropsWithChildren<DialogPortalProps>) {
  // 웹에서는 Portal로 body에 렌더링하지만 RN에서는 바로 children 반환
  return <>{children}</>;
}

interface DialogOverlayProps extends ViewProps {}

export function DialogOverlay({
  style,
  ...rest
}: PropsWithChildren<DialogOverlayProps>) {
  // 실제 Overlay는 DialogContent 안에서 구현하므로,
  // 여기서는 스타일만 공유용으로 사용 가능
  return <View style={[styles.overlay, style]} {...rest} />;
}

/* ------------------------------------------------------------------ */
/* Content (Modal 실제 구현)                                           */
/* ------------------------------------------------------------------ */

interface DialogContentProps extends ViewProps {}

export function DialogContent({
  children,
  style,
  ...rest
}: PropsWithChildren<DialogContentProps>) {
  const { open, setOpen } = useDialogContext();

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <Pressable
        style={styles.backdrop}
        onPress={() => setOpen(false)}
      >
        <Pressable
          style={[styles.content, style]}
          onPress={(e) => e.stopPropagation()}
          {...rest}
        >
          {children}
          {/* 기본 닫기 버튼 (X) */}
          <DialogClose style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </DialogClose>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Close                                                               */
/* ------------------------------------------------------------------ */

interface DialogCloseProps extends PressableProps {}

export function DialogClose({
  children,
  style,
  ...rest
}: PropsWithChildren<DialogCloseProps>) {
  const { setOpen } = useDialogContext();

  const handlePress = () => {
    setOpen(false);
    rest.onPress?.(undefined as any);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={style}
      {...rest}
    >
      {children}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Header / Footer / Title / Description                              */
/* ------------------------------------------------------------------ */

interface DialogHeaderProps extends ViewProps {}

export function DialogHeader({
  children,
  style,
  ...rest
}: PropsWithChildren<DialogHeaderProps>) {
  return (
    <View style={[styles.header, style]} {...rest}>
      {children}
    </View>
  );
}

interface DialogFooterProps extends ViewProps {}

export function DialogFooter({
  children,
  style,
  ...rest
}: PropsWithChildren<DialogFooterProps>) {
  return (
    <View style={[styles.footer, style]} {...rest}>
      {children}
    </View>
  );
}

interface DialogTitleProps extends TextProps {}

export function DialogTitle({
  children,
  style,
  ...rest
}: PropsWithChildren<DialogTitleProps>) {
  return (
    <Text style={[styles.title, style]} {...rest}>
      {children}
    </Text>
  );
}

interface DialogDescriptionProps extends TextProps {}

export function DialogDescription({
  children,
  style,
  ...rest
}: PropsWithChildren<DialogDescriptionProps>) {
  return (
    <Text style={[styles.description, style]} {...rest}>
      {children}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    // 별도로 쓸 일이 있으면 재사용 가능
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    width: '85%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#9CA3AF',
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
    color: '#6B7280',
  },
});
