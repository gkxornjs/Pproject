import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';

interface LocationScreenProps {
  onNavigate: (screen: 'home' | 'logs' | 'settings' | 'location') => void;
}

export const LocationScreen: React.FC<LocationScreenProps> = ({
  onNavigate,
}) => {
  const [address, setAddress] = useState('서울특별시 강남구 테헤란로 123');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 위치 핀 펄스 애니메이션
  const pulse = useRef(new Animated.Value(0)).current;
  const pinBounce = useRef(new Animated.Value(0)).current;
  const refreshRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pinBounce, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pinBounce, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pinBounce]);

  const pinTranslateY = pinBounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  useEffect(() => {
    if (isRefreshing) {
      refreshRotate.setValue(0);
      Animated.loop(
        Animated.timing(refreshRotate, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      refreshRotate.stopAnimation();
    }
  }, [isRefreshing, refreshRotate]);

  const refreshSpin = refreshRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      // 주소 업데이트 시뮬레이션
      setAddress('서울특별시 강남구 테헤란로 123');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>현재 위치</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Map Card */}
        <View style={styles.mapCard}>
          <View style={styles.mapContainer}>
            {/* "그리드" 느낌 */}
            <View style={styles.mapGrid} />
            {/* 가짜 도로 라인들 */}
            <View style={[styles.roadHorizontal, styles.road]} />
            <View style={[styles.roadVertical, styles.road]} />

            {/* 중앙 위치 핀 */}
            <View style={styles.mapCenter}>
              <Animated.View
                style={[
                  styles.pulseCircle,
                  {
                    transform: [{ scale: pulseScale }],
                    opacity: pulseOpacity,
                  },
                ]}
              />
              {/* 위치 라벨 */}
              <View style={styles.locationLabelWrapper}>
                <View style={styles.locationLabelBox}>
                  <Text style={styles.locationLabelText}>나의 위치</Text>
                </View>
                <View style={styles.locationLabelArrow} />
              </View>

              <Animated.View
                style={{ transform: [{ translateY: pinTranslateY }] }}
              >
                <Text style={styles.pinEmoji}>📍</Text>
              </Animated.View>
            </View>

            {/* 줌 컨트롤 모양만 */}
            <View style={styles.zoomControls}>
              <View style={styles.zoomButton}>
                <Text style={styles.zoomButtonText}>+</Text>
              </View>
              <View style={styles.zoomButton}>
                <Text style={styles.zoomButtonText}>−</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 주소 카드 */}
        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressLabel}>현재 주소</Text>
            <View style={styles.addressBox}>
              <Text style={styles.addressText}>{address}</Text>
            </View>
          </View>
          <View style={styles.addressInfoRow}>
            <View style={styles.addressDot} />
            <Text style={styles.addressInfoText}>
              GPS 기반으로 자동 갱신됩니다.
            </Text>
          </View>
        </View>

        {/* 새로고침 버튼 */}
        <Pressable
          onPress={handleRefresh}
          disabled={isRefreshing}
          style={styles.refreshButton}
        >
          <Animated.View style={{ transform: [{ rotate: refreshSpin }] }}>
            <Text style={styles.refreshIcon}>↻</Text>
          </Animated.View>
          <Text style={styles.refreshText}>
            {isRefreshing ? '위치 가져오는 중...' : '위치 다시 가져오기'}
          </Text>
        </Pressable>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <View style={styles.infoIconCircle}>
            <Text style={styles.infoIcon}>ℹ️</Text>
          </View>
          <Text style={styles.infoText}>
            낙상 감지 시, 이 위치가 보호자 웹 대시보드에 전송됩니다.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <View style={styles.bottomNavInner}>
          <Pressable
            onPress={() => onNavigate('home')}
            style={styles.bottomNavItem}
          >
            <Text style={styles.bottomNavIcon}>🏠</Text>
            <Text style={styles.bottomNavLabel}>Home</Text>
          </Pressable>
          <Pressable
            onPress={() => onNavigate('location')}
            style={[styles.bottomNavItem, styles.bottomNavItemActive]}
          >
            <Text style={styles.bottomNavIcon}>📍</Text>
            <Text style={styles.bottomNavLabelActive}>위치</Text>
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
    backgroundColor: '#E0F2FE', // 기존 root 배경색
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  },
  root: {
    flex: 1,
    backgroundColor: '#E0F2FE', // blue-100-ish
  },
  header: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 80,
    gap: 16,
  } as any,
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: 'hidden',
  },
  mapContainer: {
    height: 280,
    backgroundColor: '#DBEAFE',
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.2)',
  },
  road: {
    position: 'absolute',
    backgroundColor: '#94A3B8',
  },
  roadHorizontal: {
    left: 0,
    right: 0,
    top: '50%',
    height: 3,
  },
  roadVertical: {
    top: 0,
    bottom: 0,
    left: '50%',
    width: 3,
  },
  mapCenter: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -40,
    marginTop: -40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
  },
  locationLabelWrapper: {
    position: 'absolute',
    top: -48,
    left: '50%',
    marginLeft: -60,
    alignItems: 'center',
  },
  locationLabelBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  locationLabelText: {
    fontSize: 16,
    color: '#1D4ED8',
  },
  locationLabelArrow: {
    marginTop: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
  },
  pinEmoji: {
    fontSize: 40,
    textAlign: 'center',
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    gap: 8,
  } as any,
  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  zoomButtonText: {
    fontSize: 20,
    color: '#374151',
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  addressHeader: {
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 8,
    fontWeight: '600',
  },
  addressBox: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  addressText: {
    fontSize: 16,
    color: '#111827',
  },
  addressInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  } as any,
  addressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  addressInfoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  refreshButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  } as any,
  refreshIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  refreshText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  infoBox: {
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  } as any,
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIcon: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
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
    backgroundColor: '#EFF6FF',
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
    color: '#2563EB',
    fontWeight: '600',
  },
});
