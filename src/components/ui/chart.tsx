import React, {
  createContext,
  PropsWithChildren,
  useContext,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewProps,
  TextProps,
} from 'react-native';

// 웹 버전과 동일한 형태를 최대한 유지하되 단순화
export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType<any>;
    color?: string;
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = createContext<ChartContextProps | null>(null);

export function useChart() {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return context;
}

interface ChartContainerProps extends ViewProps {
  config: ChartConfig;
}

/**
 * RN용 ChartContainer
 * - 실제 차트 라이브러리는 children 안에서 직접 사용 (예: react-native-chart-kit 등)
 * - 여기서는 config 컨텍스트만 제공하고, 기본 레이아웃/패딩 정도만 잡아줌
 */
export function ChartContainer({
  config,
  style,
  children,
  ...rest
}: PropsWithChildren<ChartContainerProps>) {
  return (
    <ChartContext.Provider value={{ config }}>
      <View style={[styles.container, style]} {...rest}>
        {children}
      </View>
    </ChartContext.Provider>
  );
}

/**
 * 웹 버전에서는 CSS 변수를 주입하는 역할이었는데,
 * RN에서는 전역 CSS가 없어서 아무 것도 하지 않는 컴포넌트로 둔다.
 */
export function ChartStyle(_: { id: string; config: ChartConfig }) {
  return null;
}

/**
 * Tooltip / Legend는 나중에 쓰기 좋게 가벼운 UI 래퍼로만 구현
 * (차트 라이브러리에서 onPress / onHover 등으로 직접 제어하면 됨)
 */

interface ChartTooltipProps extends ViewProps {
  label?: React.ReactNode;
  value?: React.ReactNode;
}

export function ChartTooltip({
  label,
  value,
  style,
  children,
  ...rest
}: PropsWithChildren<ChartTooltipProps>) {
  // children을 직접 넘겨서 커스텀 렌더도 가능하게
  return (
    <View style={[styles.tooltip, style]} {...rest}>
      {children ? (
        children
      ) : (
        <>
          {label !== undefined && (
            <Text style={styles.tooltipLabel}>{label}</Text>
          )}
          {value !== undefined && (
            <Text style={styles.tooltipValue}>{value}</Text>
          )}
        </>
      )}
    </View>
  );
}

// 웹 버전의 ChartTooltipContent는 Recharts payload를 기반으로 커스텀 렌더링 했지만,
// RN에서는 차트 라이브러리마다 구조가 달라서 any로 받아서 필요한 만큼만 사용하는 형태로 단순화한다.
export function ChartTooltipContent(props: any) {
  const { config } = useChart();

  // 최소한의 형태만 유지: label, value 정도만 표시
  const label =
    props?.label ??
    props?.payload?.[0]?.name ??
    props?.payload?.[0]?.dataKey;

  const value = props?.payload?.[0]?.value;

  // config 활용 (있다면 label 교체)
  let finalLabel: React.ReactNode = label;
  if (typeof label === 'string' && config[label]?.label) {
    finalLabel = config[label].label;
  }

  if (!props?.active) return null;

  return (
    <ChartTooltip style={props?.style} label={finalLabel} value={value} />
  );
}

interface ChartLegendProps extends ViewProps {}

export function ChartLegend({
  children,
  style,
  ...rest
}: PropsWithChildren<ChartLegendProps>) {
  return (
    <View style={[styles.legend, style]} {...rest}>
      {children}
    </View>
  );
}

interface ChartLegendContentProps extends ViewProps {
  items?: { key: string; color?: string }[];
}

/**
 * 간단한 Legend: config와 items(key, color)를 받아서 렌더링
 */
export function ChartLegendContent({
  items,
  style,
  ...rest
}: ChartLegendContentProps) {
  const { config } = useChart();

  if (!items || !items.length) return null;

  return (
    <View style={[styles.legendContent, style]} {...rest}>
      {items.map((item) => {
        const cfg = config[item.key] || {};
        return (
          <View key={item.key} style={styles.legendItem}>
            <View
              style={[
                styles.legendColorBox,
                { backgroundColor: item.color || cfg.color || '#9CA3AF' },
              ]}
            />
            <Text style={styles.legendLabel}>
              {cfg.label ?? item.key}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 8,
  },
  tooltip: {
    minWidth: 80,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  tooltipLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  tooltipValue: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  legend: {
    marginTop: 8,
  },
  legendContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  } as any,
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  legendColorBox: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 4,
  },
  legendLabel: {
    fontSize: 11,
    color: '#374151',
  },
});
