import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  PropsWithChildren,
} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
  ViewStyle,
  Text,
} from 'react-native';
import { Button } from './button';

type Orientation = 'horizontal' | 'vertical';

interface CarouselProps {
  orientation?: Orientation;
  style?: ViewStyle;
  onIndexChange?: (index: number) => void;
}

interface CarouselContextValue {
  orientation: Orientation;
  scrollRef: React.RefObject<ScrollView | null>;
  size: { width: number; height: number };
  setSize: (width: number, height: number) => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  slideCount: number;
  setSlideCount: (count: number) => void;
  scrollNext: () => void;
  scrollPrev: () => void;
  canScrollNext: boolean;
  canScrollPrev: boolean;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

function useCarouselContext() {
  const ctx = useContext(CarouselContext);
  if (!ctx) {
    throw new Error('Carousel components must be used inside <Carousel>');
  }
  return ctx;
}

export function Carousel({
  orientation = 'horizontal',
  style,
  onIndexChange,
  children,
}: PropsWithChildren<CarouselProps>) {
  const scrollRef = useRef<ScrollView | null>(null);
  const [size, setSizeState] = useState({ width: 0, height: 0 });
  const [activeIndex, setActiveIndexState] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  const setSize = (width: number, height: number) => {
    if (size.width !== width || size.height !== height) {
      setSizeState({ width, height });
    }
  };

  const setActiveIndex = (index: number) => {
    setActiveIndexState(index);
    onIndexChange?.(index);
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current || slideCount === 0) return;
    if (orientation === 'horizontal') {
      if (!size.width) return;
      scrollRef.current.scrollTo({ x: size.width * index, y: 0, animated: true });
    } else {
      if (!size.height) return;
      scrollRef.current.scrollTo({ x: 0, y: size.height * index, animated: true });
    }
  };

  const scrollNext = () => {
    const next = Math.min(activeIndex + 1, slideCount - 1);
    if (next !== activeIndex) {
      setActiveIndex(next);
      scrollToIndex(next);
    }
  };

  const scrollPrev = () => {
    const prev = Math.max(activeIndex - 1, 0);
    if (prev !== activeIndex) {
      setActiveIndex(prev);
      scrollToIndex(prev);
    }
  };

  const canScrollPrev = activeIndex > 0;
  const canScrollNext = slideCount > 0 && activeIndex < slideCount - 1;

  const value: CarouselContextValue = useMemo(
    () => ({
      orientation,
      scrollRef,
      size,
      setSize,
      activeIndex,
      setActiveIndex,
      slideCount,
      setSlideCount,
      scrollNext,
      scrollPrev,
      canScrollNext,
      canScrollPrev,
    }),
    [
      orientation,
      size,
      activeIndex,
      slideCount,
      canScrollNext,
      canScrollPrev,
    ],
  );

  return (
    <CarouselContext.Provider value={value}>
      <View style={[styles.container, style]}>{children}</View>
    </CarouselContext.Provider>
  );
}

interface CarouselContentProps {
  style?: ViewStyle;
}

export function CarouselContent({
  children,
  style,
}: PropsWithChildren<CarouselContentProps>) {
  const {
    orientation,
    scrollRef,
    size,
    setSize,
    setActiveIndex,
    setSlideCount,
  } = useCarouselContext();

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setSize(width, height);
    },
    [setSize],
  );

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset } = event.nativeEvent;
      if (orientation === 'horizontal' && size.width > 0) {
        const index = Math.round(contentOffset.x / size.width);
        setActiveIndex(index);
      } else if (orientation === 'vertical' && size.height > 0) {
        const index = Math.round(contentOffset.y / size.height);
        setActiveIndex(index);
      }
    },
    [orientation, size, setActiveIndex],
  );

  const childArray = React.Children.toArray(children);
  setSlideCount(childArray.length);

  return (
    <View style={[styles.viewport, style]} onLayout={handleLayout}>
      <ScrollView
        ref={scrollRef}
        horizontal={orientation === 'horizontal'}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {childArray.map((child, index) => (
          <View
            key={index}
            style={[
              orientation === 'horizontal'
                ? { width: size.width }
                : { height: size.height },
            ]}
          >
            {child}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

interface CarouselItemProps {
  style?: ViewStyle;
}

export function CarouselItem({
  children,
  style,
}: PropsWithChildren<CarouselItemProps>) {
  return <View style={style}>{children}</View>;
}

type ButtonProps = React.ComponentProps<typeof Button>;

export function CarouselPrevious({
  style,
  ...rest
}: ButtonProps) {
  const { orientation, scrollPrev, canScrollPrev } = useCarouselContext();

  const positionStyle: ViewStyle =
    orientation === 'horizontal'
      ? {
          position: 'absolute',
          left: 8,
          top: '50%',
          marginTop: -20,
        }
      : {
          position: 'absolute',
          top: 8,
          left: '50%',
          marginLeft: -20,
          transform: [{ rotate: '90deg' }],
        };

  return (
    <View style={positionStyle}>
      <Button
        variant="outline"
        size="icon"
        disabled={!canScrollPrev}
        {...rest}
      >
        <Text>{'‹'}</Text>
      </Button>
    </View>
  );
}

export function CarouselNext({
  style,
  ...rest
}: ButtonProps) {
  const { orientation, scrollNext, canScrollNext } = useCarouselContext();

  const positionStyle: ViewStyle =
    orientation === 'horizontal'
      ? {
          position: 'absolute',
          right: 8,
          top: '50%',
          marginTop: -20,
        }
      : {
          position: 'absolute',
          bottom: 8,
          left: '50%',
          marginLeft: -20,
          transform: [{ rotate: '90deg' }],
        };

  return (
    <View style={positionStyle}>
      <Button
        variant="outline"
        size="icon"
        disabled={!canScrollNext}
        {...rest}
      >
        <Text>{'›'}</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  viewport: {
    overflow: 'hidden',
  },
});
