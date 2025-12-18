// src/components/ui/sheet.tsx
import React, { PropsWithChildren } from 'react';
import {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from './drawer';

// Drawer에서 정의한 side 타입 재사용
type SheetSide = 'top' | 'right' | 'bottom' | 'left';

/* ------------------------------------------------------------------ */
/* Root (Sheet = Drawer 래퍼)                                         */
/* ------------------------------------------------------------------ */

type DrawerProps = React.ComponentProps<typeof Drawer>;

export function Sheet(props: DrawerProps) {
  return <Drawer {...props} />;
}

/* ------------------------------------------------------------------ */
/* Trigger / Close                                                     */
/* ------------------------------------------------------------------ */

type DrawerTriggerProps = React.ComponentProps<typeof DrawerTrigger>;

export function SheetTrigger(props: DrawerTriggerProps) {
  return <DrawerTrigger {...props} />;
}

type DrawerCloseProps = React.ComponentProps<typeof DrawerClose>;

export function SheetClose(props: DrawerCloseProps) {
  return <DrawerClose {...props} />;
}

/* ------------------------------------------------------------------ */
/* Content (side 지원 그대로 전달)                                    */
/* ------------------------------------------------------------------ */

type DrawerContentProps = React.ComponentProps<typeof DrawerContent>;

interface SheetContentProps extends DrawerContentProps {
  side?: SheetSide;
}

export function SheetContent({
  side = 'right',
  children,
  ...rest
}: PropsWithChildren<SheetContentProps>) {
  return (
    <DrawerContent {...rest}>
      {children}
    </DrawerContent>
  );
}

/* ------------------------------------------------------------------ */
/* Header / Footer / Title / Description                              */
/* ------------------------------------------------------------------ */

type DrawerHeaderProps = React.ComponentProps<typeof DrawerHeader>;
type DrawerFooterProps = React.ComponentProps<typeof DrawerFooter>;
type DrawerTitleProps = React.ComponentProps<typeof DrawerTitle>;
type DrawerDescriptionProps = React.ComponentProps<typeof DrawerDescription>;

export function SheetHeader(props: DrawerHeaderProps) {
  return <DrawerHeader {...props} />;
}

export function SheetFooter(props: DrawerFooterProps) {
  return <DrawerFooter {...props} />;
}

export function SheetTitle(props: DrawerTitleProps) {
  return <DrawerTitle {...props} />;
}

export function SheetDescription(props: DrawerDescriptionProps) {
  return <DrawerDescription {...props} />;
}
