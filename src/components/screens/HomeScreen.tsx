import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';

interface HomeScreenProps {
  onNavigate: (screen: 'home' | 'logs' | 'settings' | 'location') => void;
  onSimulateFall: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onSimulateFall,
}) => {
  const [debugMode, setDebugMode] = useState(false);
  const [accelerometer, setAccelerometer] = useState({
    x: 0.12,
    y: 0.05,
    z: 9.81,
  });

  // 펄스 애니메이션용 Animated 값
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse1, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse1, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(pulse2, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse2, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    loop1.start();
    loop2.start();
    return () => {
      loop1.stop();
      loop2.stop();
    };
  }, [pulse1, pulse2]);

  const scale1 = pulse1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });
  const opacity1 = pulse1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0],
  });

  const scale2 = pulse2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });
  const opacity2 = pulse2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  // 랜덤 가속도 값 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setAccelerometer({
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
        z: 9.81 + (Math.random() - 0.5) * 0.3,
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.root}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SilverGuard</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
      >
        {/* 상태 카드 */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIconCircle}>
              <Text style={styles.statusIcon}>🛡️</Text>
            </View>
            <View>
              <Text style={styles.statusTitle}>현재 안전합니다</Text>
              <Text style={styles.statusSubtitle}>실시간 모니터링 중</Text>
            </View>
          </View>
        </View>

        {/* 펄스 애니메이션 */}
        <View style={styles.pulseWrapper}>
          <View style={styles.pulseInner}>
            <Animated.View
              style={[
                styles.pulseCircle,
                {
                  transform: [{ scale: scale1 }],
                  opacity: opacity1,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.pulseCircle,
                {
                  transform: [{ scale: scale2 }],
                  opacity: opacity2,
                },
              ]}
            />
            <View style={styles.centerCircle}>
              <Text style={styles.centerIcon}>🛡️</Text>
            </View>
          </View>
        </View>

        {/* 디버그 토글 */}
        <View style={styles.debugCard}>
          <View style={styles.debugLabelRow}>
            <Text style={styles.debugLabel}>
              디버그 모드: 가속도 값 표시
            </Text>
            <Pressable
              onPress={() => setDebugMode((v) => !v)}
              style={[
                styles.switchTrack,
                debugMode ? styles.switchTrackOn : styles.switchTrackOff,
              ]}
            >
              <View
                style={[
                  styles.switchThumb,
                  debugMode ? styles.switchThumbOn : styles.switchThumbOff,
                ]}
              />
            </Pressable>
          </View>
        </View>

        {/* 디버그 패널 */}
        {debugMode && (
          <View style={styles.debugPanel}>
            <Text style={styles.debugPanelTitle}>가속도계 값</Text>
            <View style={styles.debugRow}>
              <Text style={styles.debugAxis}>X:</Text>
              <Text style={styles.debugValue}>
                {accelerometer.x.toFixed(3)} m/s²
              </Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={styles.debugAxis}>Y:</Text>
              <Text style={styles.debugValue}>
                {accelerometer.y.toFixed(3)} m/s²
              </Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={styles.debugAxis}>Z:</Text>
              <Text style={styles.debugValue}>
                {accelerometer.z.toFixed(3)} m/s²
              </Text>
            </View>
          </View>
        )}

        {/* 낙상 시뮬레이션 버튼 */}
        <Pressable
          onPress={onSimulateFall}
          style={styles.devButton}
        >
          <Text style={styles.devButtonText}>
            [DEV] Simulate Fall
          </Text>
        </Pressable>

        {/* 현재 위치 */}
        <View style={styles.locationCard}>
          <View style={styles.locationHeaderRow}>
            <View style={styles.locationTitleRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationTitle}>현재 위치</Text>
            </View>
            <View style={styles.locationBadge}>
              <View style={styles.locationDot} />
              <Text style={styles.locationBadgeText}>실시간</Text>
            </View>
          </View>

          <Text style={styles.locationText}>
            서울특별시 강남구 테헤란로 123
          </Text>

          <Pressable
            onPress={() => onNavigate('location')}
            style={styles.locationLinkRow}
          >
            <Text style={styles.locationLinkText}>상세 지도 보기</Text>
            <Text style={styles.locationLinkArrow}>{'›'}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* 하단 네비게이션 */}
      <View style={styles.bottomNav}>
        <View style={styles.bottomNavInner}>
          <Pressable
            onPress={() => onNavigate('home')}
            style={[styles.bottomNavItem, styles.bottomNavItemActive]}
          >
            <Text style={styles.bottomNavIcon}>🏠</Text>
            <Text style={styles.bottomNavLabelActive}>Home</Text>
          </Pressable>
          <Pressable
            onPress={() => onNavigate('location')}
            style={styles.bottomNavItem}
          >
            <Text style={styles.bottomNavIcon}>📍</Text>
            <Text style={styles.bottomNavLabel}>위치</Text>
          </Pressable>
          <Pressable
            onPress={() => onNavigate('logs')}
            style={styles.bottomNavItem}
          >
            <Text style={styles.bottomNavIcon}>📄</Text>
            <Text style={styles.bottomNavLabel}>Logs</Text>
          </Pressable>
          <Pressable
            onPress={() => onNavigate('settings')}
            style={styles.bottomNavItem}
          >
            <Text style={styles.bottomNavIcon}>⚙️</Text>
            <Text style={styles.bottomNavLabel}>설정</Text>
          </Pressable>
        </View>
      </View>
    </View>
    </SafeAreaView>
  );
};

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ECFEF5', // 기존 root 배경색
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  },
  root: {
    flex: 1,
    backgroundColor: '#ECFEF3', // emerald-50 느낌
  },
  header: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    color: '#111827',
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 80,
  },
  statusCard: {
    backgroundColor: '#059669', // emerald-600
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  } as any,
  statusIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusSubtitle: {
    fontSize: 16,
    color: '#A7F3D0',
    marginTop: 4,
  },
  pulseWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    height: 200,
  },
  pulseInner: {
    width: 192,
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: '#22C55E', // emerald-500
  },
  centerCircle: {
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  centerIcon: {
    fontSize: 64,
    color: '#FFFFFF',
  },
  debugCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  debugLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  debugLabel: {
    fontSize: 16,
    color: '#111827',
  },
  switchTrack: {
    width: 56,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackOn: {
    backgroundColor: '#10B981',
  },
  switchTrackOff: {
    backgroundColor: '#D1D5DB',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  switchThumbOn: {
    transform: [{ translateX: 24 }],
  },
  switchThumbOff: {
    transform: [{ translateX: 0 }],
  },
  debugPanel: {
    backgroundColor: '#020617',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  debugPanelTitle: {
    fontSize: 18,
    color: '#4ADE80',
    marginBottom: 12,
  },
  debugRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  debugAxis: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  debugValue: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  devButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F97316',
    opacity: 0.7,
    alignItems: 'center',
  },
  devButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  locationCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  } as any,
  locationIcon: {
    fontSize: 18,
    color: '#2563EB',
  },
  locationTitle: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  } as any,
  locationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  locationBadgeText: {
    fontSize: 10,
    color: '#16A34A',
  },
  locationText: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 8,
  },
  locationLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  } as any,
  locationLinkText: {
    fontSize: 13,
    color: '#2563EB',
  },
  locationLinkArrow: {
    fontSize: 14,
    color: '#2563EB',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  bottomNavInner: {
    flexDirection: 'row',
  },
  bottomNavItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavItemActive: {
    backgroundColor: '#ECFDF5',
  },
  bottomNavIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  bottomNavLabel: {
    fontSize: 12,
    color: '#4B5563',
  },
  bottomNavLabelActive: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
});
