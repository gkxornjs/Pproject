// src/components/ui/sidebar.tsx
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
  useWindowDimensions,
  ViewProps,
  PressableProps,
  TextProps,
  StyleProp
  , ViewStyle
} from 'react-native';
import { Button } from './button';
import { Input } from './input';
import { Separator } from './separator';
import { Drawer, DrawerContent } from './drawer';

type SidebarState = 'expanded' | 'collapsed';

type SidebarContextProps = {
  state: SidebarState;
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextProps | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

interface SidebarProviderProps extends ViewProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  children,
  style,
  ...rest
}: PropsWithChildren<SidebarProviderProps>) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = openProp ?? internalOpen;

  const setOpen = (next: boolean) => {
    if (onOpenChange) onOpenChange(next);
    else setInternalOpen(next);
  };

  const toggleSidebar = () => setOpen(!open);

  const state: SidebarState = open ? 'expanded' : 'collapsed';

  const ctxValue = useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      toggleSidebar,
    }),
    [state, open, isMobile],
  );

  return (
    <SidebarContext.Provider value={ctxValue}>
      <View style={[styles.wrapper, style]} {...rest}>
        {children}
      </View>
    </SidebarContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Sidebar                                                             */
/* ------------------------------------------------------------------ */

interface SidebarProps extends ViewProps {
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
}

export function Sidebar({
  side = 'left',
  children,
  style,
  ...rest
}: PropsWithChildren<SidebarProps>) {
  const { isMobile, open, setOpen } = useSidebar();

  if (isMobile) {
    // 모바일: Drawer로 슬라이드 사이드바
    return (
      <Drawer open={open} onOpenChange={setOpen} side={side}>
        <DrawerContent>
          <View style={styles.sidebarMobile} {...rest}>
            {children}
          </View>
        </DrawerContent>
      </Drawer>
    );
  }

  // 큰 화면: 고정 사이드바
  return (
    <View
      style={[
        styles.sidebarDesktop,
        side === 'left' ? styles.sidebarLeft : styles.sidebarRight,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Trigger                                                              */
/* ------------------------------------------------------------------ */

type ButtonProps = React.ComponentProps<typeof Button>;

interface SidebarTriggerProps extends Omit<ButtonProps, 'style'> {
  style?: StyleProp<ViewStyle>;
}

export function SidebarTrigger({
  style,
  ...rest
}: SidebarTriggerProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      style={[styles.triggerButton, style]}
      onPress={() => toggleSidebar()}
      {...rest}
    >
      <Text style={styles.triggerIcon}>≡</Text>
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Rail (RN에선 사실상 필요 없으니 no-op에 가깝게)                     */
/* ------------------------------------------------------------------ */

interface SidebarRailProps extends ViewProps {}

export function SidebarRail({
  style,
  ...rest
}: SidebarRailProps) {
  // 웹에서 사이드바 경계 클릭용 레일이었지만,
  // RN에선 굳이 필요 없어서 작은 터치 영역 정도로만 남겨둠.
  return <View style={style} {...rest} />;
}

/* ------------------------------------------------------------------ */
/* Inset (메인 콘텐츠 영역 래퍼)                                       */
/* ------------------------------------------------------------------ */

interface SidebarInsetProps extends ViewProps {}

export function SidebarInset({
  children,
  style,
  ...rest
}: PropsWithChildren<SidebarInsetProps>) {
  return (
    <View style={[styles.inset, style]} {...rest}>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* 단순 Wrappers: Header / Footer / Content / Group / Separator        */
/* ------------------------------------------------------------------ */

interface SidebarSimpleViewProps extends ViewProps {}

export function SidebarHeader({
  children,
  style,
  ...rest
}: PropsWithChildren<SidebarSimpleViewProps>) {
  return (
    <View style={[styles.header, style]} {...rest}>
      {children}
    </View>
  );
}

export function SidebarFooter({
  children,
  style,
  ...rest
}: PropsWithChildren<SidebarSimpleViewProps>) {
  return (
    <View style={[styles.footer, style]} {...rest}>
      {children}
    </View>
  );
}

export function SidebarContent({
  children,
  style,
  ...rest
}: PropsWithChildren<SidebarSimpleViewProps>) {
  return (
    <View style={[styles.content, style]} {...rest}>
      {children}
    </View>
  );
}

export function SidebarGroup({
  children,
  style,
  ...rest
}: PropsWithChildren<SidebarSimpleViewProps>) {
  return (
    <View style={[styles.group, style]} {...rest}>
      {children}
    </View>
  );
}

interface SidebarGroupLabelProps extends TextProps {}

export function SidebarGroupLabel({
  children,
  style,
  ...rest
}: PropsWithChildren<SidebarGroupLabelProps>) {
  return (
    <Text style={[styles.groupLabel, style]} {...rest}>
      {children}
    </Text>
  );
}

interface SidebarGroupContentProps extends ViewProps {}

export function SidebarGroupContent({
  children,
  style,
  ...rest
}: PropsWithChildren<SidebarGroupContentProps>) {
  return (
    <View style={style} {...rest}>
      {children}
    </View>
  );
}

interface SidebarSeparatorProps extends React.ComponentProps<typeof Separator> {}

export function SidebarSeparator(props: SidebarSeparatorProps) {
  return (
    <Separator
      style={[styles.separator, props.style]}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Input                                                               */
/* ------------------------------------------------------------------ */

type InputProps = React.ComponentProps<typeof Input>;

export function SidebarInput({
  style,
  ...rest
}: InputProps) {
  return (
    <Input
      style={[styles.input, style]}
      {...rest}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Menu / MenuItem / MenuButton / Submenu                             */
/* ------------------------------------------------------------------ */

interface SidebarMenuProps extends ViewProps {}

export function SidebarMenu({
  children,
  style,
  ...rest
}: PropsWithChildren<SidebarMenuProps>) {
  return (
    <View style={[styles.menu, style]} {...rest}>
      {children}
    </View>
  );
}

interface SidebarMenuItemProps extends ViewProps {}

export function SidebarMenuItem({
  children,
  style,
  ...rest
}: PropsWithChildren<SidebarMenuItemProps>) {
  return (
    <View style={[styles.menuItem, style]} {...rest}>
      {children}
    </View>
  );
}

type SidebarMenuButtonVariant = 'default' | 'outline';
type SidebarMenuButtonSize = 'default' | 'sm' | 'lg';

interface SidebarMenuButtonProps extends PressableProps {
  isActive?: boolean;
  variant?: SidebarMenuButtonVariant;
  size?: SidebarMenuButtonSize;
}

export function SidebarMenuButton({
  children,
  isActive,
  variant = 'default',
  size = 'default',
  style,
  ...rest
}: PropsWithChildren<SidebarMenuButtonProps>) {
  const extra: any = {};
  if (variant === 'outline') {
    extra.borderWidth = 1;
    extra.borderColor = '#D1D5DB';
    extra.backgroundColor = '#FFFFFF';
  }
  const sizeStyle =
    size === 'sm'
      ? styles.menuButtonSm
      : size === 'lg'
      ? styles.menuButtonLg
      : styles.menuButton;

  return (
    <Pressable
      style={({ pressed }) => [
        sizeStyle,
        isActive && styles.menuButtonActive,
        pressed && styles.menuButtonPressed,
        extra,
        style,
      ]}
      {...rest}
    >
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.menuButtonText,
            isActive && styles.menuButtonTextActive,
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

/* 간단한 액션/배지/스켈레톤은 Placeholder 구현 */

interface SidebarMenuActionProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
}

export function SidebarMenuAction({
  children,
  style,
  ...rest
}: PropsWithChildren<SidebarMenuActionProps>) {
  return (
    <Pressable style={[styles.menuAction, style]} {...rest}>
      {children}
    </Pressable>
  );
}

interface SidebarMenuBadgeProps extends ViewProps {}

export function SidebarMenuBadge({
  children,
  style,
  ...rest
}: PropsWithChildren<SidebarMenuBadgeProps>) {
  return (
    <View style={[styles.menuBadge, style]} {...rest}>
      <Text style={styles.menuBadgeText}>{children}</Text>
    </View>
  );
}

interface SidebarMenuSkeletonProps extends ViewProps {
  showIcon?: boolean;
}

export function SidebarMenuSkeleton({
  showIcon,
  style,
  ...rest
}: SidebarMenuSkeletonProps) {
  return (
    <View style={[styles.menuSkeleton, style]} {...rest}>
      {showIcon && <View style={styles.menuSkeletonIcon} />}
      <View style={styles.menuSkeletonBar} />
    </View>
  );
}

/* Submenu */

interface SidebarMenuSubProps extends ViewProps {}

export function SidebarMenuSub({
  children,
  style,
  ...rest
}: PropsWithChildren<SidebarMenuSubProps>) {
  return (
    <View style={[styles.menuSub, style]} {...rest}>
      {children}
    </View>
  );
}

interface SidebarMenuSubItemProps extends ViewProps {}

export function SidebarMenuSubItem({
  children,
  style,
  ...rest
}: PropsWithChildren<SidebarMenuSubItemProps>) {
  return (
    <View style={[styles.menuSubItem, style]} {...rest}>
      {children}
    </View>
  );
}

interface SidebarMenuSubButtonProps extends PressableProps {
  isActive?: boolean;
  size?: 'sm' | 'md';
}

export function SidebarMenuSubButton({
  children,
  isActive,
  size = 'md',
  style,
  ...rest
}: PropsWithChildren<SidebarMenuSubButtonProps>) {
  const sizeStyle = size === 'sm' ? styles.subButtonSm : styles.subButtonMd;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.subButtonBase,
        sizeStyle,
        isActive && styles.subButtonActive,
        pressed && styles.subButtonPressed,
        style,
      ]}
      {...rest}
    >
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.subButtonText,
            isActive && styles.subButtonTextActive,
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
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100%',
  },
  sidebarMobile: {
    flex: 1,
    backgroundColor: '#111827', // gray-900-ish for sidebar bg
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  sidebarDesktop: {
    width: 260,
    backgroundColor: '#111827',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  sidebarLeft: {
    borderRightWidth: 1,
    borderRightColor: '#1F2937',
  },
  sidebarRight: {
    borderLeftWidth: 1,
    borderLeftColor: '#1F2937',
  },
  inset: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  triggerButton: {
    width: 32,
    height: 32,
  },
  triggerIcon: {
    fontSize: 18,
    color: '#111827',
  },
  header: {
    padding: 8,
    gap: 4,
  },
  footer: {
    padding: 8,
    gap: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  group: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  separator: {
    marginVertical: 4,
  },
  input: {
    height: 32,
    marginVertical: 4,
  },
  menu: {
    flexDirection: 'column',
    gap: 4,
  } as any,
  menuItem: {
    position: 'relative',
  },
  menuButton: {
    height: 32,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  } as any,
  menuButtonSm: {
    height: 28,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  } as any,
  menuButtonLg: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  } as any,
  menuButtonActive: {
    backgroundColor: '#1F2937',
  },
  menuButtonPressed: {
    backgroundColor: '#374151',
  },
  menuButtonText: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  menuButtonTextActive: {
    fontWeight: '600',
  },
  menuAction: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBadge: {
    position: 'absolute',
    right: 4,
    top: 4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4B5563',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  menuBadgeText: {
    fontSize: 11,
    color: '#F9FAFB',
  },
  menuSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    borderRadius: 8,
    paddingHorizontal: 8,
  } as any,
  menuSkeletonIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#4B5563',
  },
  menuSkeletonBar: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4B5563',
  },
  menuSub: {
    marginLeft: 16,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#4B5563',
    flexDirection: 'column',
    gap: 4,
  } as any,
  menuSubItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subButtonBase: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  } as any,
  subButtonSm: {
    height: 28,
  },
  subButtonMd: {
    height: 32,
  },
  subButtonActive: {
    backgroundColor: '#1F2937',
  },
  subButtonPressed: {
    backgroundColor: '#374151',
  },
  subButtonText: {
    fontSize: 13,
    color: '#E5E7EB',
  },
  subButtonTextActive: {
    fontWeight: '600',
  },
});
