// src/components/screens/LogsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';

import { LineChart as BaseLineChart } from 'react-native-chart-kit';

interface LogsScreenProps {
  onNavigate: (screen: 'home' | 'logs' | 'settings' | 'location') => void;
}

const sensorData = [
  { time: '09:00', x: 0.12, y: 0.05, z: 9.81 },
  { time: '09:05', x: 0.15, y: 0.08, z: 9.79 },
  { time: '09:10', x: -0.1, y: 0.12, z: 9.83 },
  { time: '09:15', x: 0.2, y: -0.05, z: 9.8 },
  { time: '09:20', x: 0.08, y: 0.15, z: 9.82 },
  { time: '09:25', x: -0.12, y: 0.1, z: 9.79 },
  { time: '09:30', x: 0.18, y: -0.08, z: 9.81 },
  { time: '09:35', x: 0.05, y: 0.12, z: 9.8 },
];

const eventLogs = [
  { id: 1, type: 'safe' as const, time: '10:32', date: '2025-11-25', description: '정상 활동 - 걷기 감지' },
  { id: 2, type: 'shock' as const, time: '10:15', date: '2025-11-25', description: '충격 감지 - 의자에 앉음' },
  { id: 3, type: 'safe' as const, time: '09:45', date: '2025-11-25', description: '정상 활동 - 정지 상태' },
  { id: 4, type: 'shock' as const, time: '09:20', date: '2025-11-25', description: '충격 감지 - 문 닫힘' },
  { id: 5, type: 'fall' as const, time: '08:50', date: '2025-11-25', description: '낙상 의심 (사용자가 취소함)' },
  { id: 6, type: 'safe' as const, time: '08:30', date: '2025-11-25', description: '정상 활동 - 걷기 감지' },
  { id: 7, type: 'safe' as const, time: '08:00', date: '2025-11-25', description: '모니터링 시작' },
];

const BOTTOM_NAV_HEIGHT = 68;

export const LogsScreen: React.FC<LogsScreenProps> = ({ onNavigate }) => {
  // ✅ 차트가 카드 밖으로 튀지 않게 width를 줄여줌 (screen padding 24*2=48, card padding 16*2=32)
  const screenWidth = Dimensions.get('window').width - 48 - 32;

  const labels = sensorData.map((d) => d.time);
  const chartData = {
    labels,
    datasets: [
      { data: sensorData.map((d) => d.x), color: () => '#3B82F6', strokeWidth: 2 },
      { data: sensorData.map((d) => d.y), color: () => '#F59E0B', strokeWidth: 2 },
      { data: sensorData.map((d) => d.z), color: () => '#10B981', strokeWidth: 2 },
    ],
    legend: ['X축', 'Y축', 'Z축'],
  };

  const LineChart: any = BaseLineChart;

  const countSafe = eventLogs.filter((e) => e.type === 'safe').length;
  const countShock = eventLogs.filter((e) => e.type === 'shock').length;
  const countFall = eventLogs.filter((e) => e.type === 'fall').length;

  const getEventIcon = (type: 'safe' | 'shock' | 'fall') => (type === 'safe' ? '🛡️' : type === 'shock' ? '⚡' : '⚠️');

  const getEventColors = (type: 'safe' | 'shock' | 'fall') => {
    switch (type) {
      case 'safe':
        return { bg: '#ECFDF5', border: '#BBF7D0', badgeBg: '#D1FAE5', badgeText: '#047857' };
      case 'shock':
        return { bg: '#FFF7ED', border: '#FED7AA', badgeBg: '#FFEDD5', badgeText: '#C2410C' };
      case 'fall':
        return { bg: '#FEF2F2', border: '#FECACA', badgeBg: '#FEE2E2', badgeText: '#B91C1C' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>최근 센서 로그</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Graph */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>가속도계 그래프 (m/s²)</Text>
            <View style={styles.chartWrapper}>
              <LineChart
                data={chartData}
                width={screenWidth}
                height={220}
                chartConfig={{
                  backgroundColor: '#FFFFFF',
                  backgroundGradientFrom: '#FFFFFF',
                  backgroundGradientTo: '#FFFFFF',
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                  propsForDots: { r: '3' },
                  propsForBackgroundLines: { stroke: '#E5E7EB', strokeDasharray: '3 3' },
                }}
                bezier
                style={styles.chart}
                withInnerLines
                withOuterLines={false}
              />
            </View>
          </View>

          {/* Event list (내부 스크롤) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>이벤트 기록</Text>

            <View style={styles.logListContainer}>
              <ScrollView style={styles.logList} contentContainerStyle={styles.logListContent} nestedScrollEnabled>
                {eventLogs.map((event) => {
                  const colors = getEventColors(event.type);
                  return (
                    <View key={event.id} style={[styles.logItem, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                      <View style={styles.logIconBox}>
                        <Text style={styles.logIcon}>{getEventIcon(event.type)}</Text>
                      </View>

                      <View style={styles.logTextBox}>
                        <Text style={styles.logTitle} numberOfLines={1}>
                          {event.description}
                        </Text>
                        <Text style={styles.logSub}>
                          {event.date} {event.time}
                        </Text>
                      </View>

                      <View style={styles.logBadgeBox}>
                        <View style={[styles.logBadge, { backgroundColor: colors.badgeBg }]}>
                          <Text style={[styles.logBadgeText, { color: colors.badgeText }]}>
                            {event.type === 'safe' ? '안전' : event.type === 'shock' ? '충격' : '낙상'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Summary */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.summarySafe]}>
              <Text style={styles.summaryNumber}>{countSafe}</Text>
              <Text style={styles.summaryLabel}>안전</Text>
            </View>
            <View style={[styles.summaryCard, styles.summaryShock]}>
              <Text style={styles.summaryNumber}>{countShock}</Text>
              <Text style={styles.summaryLabel}>충격</Text>
            </View>
            <View style={[styles.summaryCard, styles.summaryFall]}>
              <Text style={styles.summaryNumber}>{countFall}</Text>
              <Text style={styles.summaryLabel}>낙상</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Nav */}
        <View style={styles.bottomNav}>
          <Pressable onPress={() => onNavigate('home')} style={styles.bottomNavItem}>
            <Text style={styles.bottomNavIcon}>🏠</Text>
            <Text style={styles.bottomNavLabel}>Home</Text>
          </Pressable>
          <Pressable onPress={() => onNavigate('location')} style={styles.bottomNavItem}>
            <Text style={styles.bottomNavIcon}>📍</Text>
            <Text style={styles.bottomNavLabel}>위치</Text>
          </Pressable>
          <Pressable onPress={() => onNavigate('logs')} style={[styles.bottomNavItem, styles.bottomNavItemActive]}>
            <Text style={styles.bottomNavIcon}>📄</Text>
            <Text style={styles.bottomNavLabelActive}>Logs</Text>
          </Pressable>
          <Pressable onPress={() => onNavigate('settings')} style={styles.bottomNavItem}>
            <Text style={styles.bottomNavIcon}>⚙️</Text>
            <Text style={styles.bottomNavLabel}>설정</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  },
  root: { flex: 1, backgroundColor: '#EEF2FF' },

  header: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerTitle: { fontSize: 24, color: '#111827', fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 16,
  } as any,

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardTitle: { fontSize: 18, color: '#111827', fontWeight: '600', marginBottom: 12 },

  // ✅ 튀어나옴 방지
  chartWrapper: {
    width: '100%',
    height: 220,
    overflow: 'hidden',
    borderRadius: 12,
  },
  chart: { borderRadius: 12 },

  // ✅ 이벤트 리스트 내부 스크롤
  logListContainer: { maxHeight: 260 },
  logList: { flexGrow: 0 },
  logListContent: { paddingBottom: 4 },

  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    padding: 12,
    marginBottom: 8,
  },
  logIconBox: { marginRight: 12 },
  logIcon: { fontSize: 22 },
  logTextBox: { flex: 1, minWidth: 0 },
  logTitle: { fontSize: 16, color: '#111827' },
  logSub: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  logBadgeBox: { marginLeft: 8 },
  logBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  logBadgeText: { fontSize: 11, fontWeight: '600' },

  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: BOTTOM_NAV_HEIGHT / 2,
  } as any,
  summaryCard: { flex: 1, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', borderWidth: 2 },
  summarySafe: { backgroundColor: '#ECFDF5', borderColor: '#BBF7D0' },
  summaryShock: { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' },
  summaryFall: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  summaryNumber: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  summaryLabel: { fontSize: 13, color: '#374151' },

  bottomNav: {
    height: BOTTOM_NAV_HEIGHT,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  bottomNavItem: { flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  bottomNavItemActive: { backgroundColor: '#EEF2FF' },
  bottomNavIcon: { fontSize: 20, marginBottom: 4 },
  bottomNavLabel: { fontSize: 12, color: '#4B5563' },
  bottomNavLabelActive: { fontSize: 12, color: '#4F46E5', fontWeight: '600' },
});
