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
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

// 🔥 [Firebase] Firestore로 변경: db와 updateDoc 사용
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; 

const { width } = Dimensions.get('window');

interface LocationScreenProps {
  onNavigate: (screen: 'home' | 'logs' | 'settings' | 'location') => void;
  // 부모(App.tsx)에게 찾은 주소를 전달하는 함수
  setGlobalAddress: (address: string) => void;
  // 🔥 [추가] 부모로부터 받은 내 ID
  userId: string;
}

export const LocationScreen: React.FC<LocationScreenProps> = ({
  onNavigate,
  setGlobalAddress, 
  userId, // 🔥 여기서 받음
}) => {
  // 초기 상태
  const [address, setAddress] = useState('위치를 찾는 중...');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ---------------------------------------------------------
  // 🔥 [기능 1] 주소 중복 제거 및 포맷팅 함수
  // ---------------------------------------------------------
  const formatAddress = (addr: Location.LocationGeocodedAddress) => {
    const components = [
      addr.region,   // 시/도
      addr.city,     // 시/군/구
      addr.district, // 구
      addr.street,   // 도로명/동
      addr.name      // 상세
    ];

    const validComponents = components.filter((c): c is string => c !== null && c !== undefined && typeof c === 'string' && c.trim() !== '');
    const uniqueComponents = [...new Set(validComponents)];

    const finalComponents = uniqueComponents.filter((item, index) => {
      const nextItem = uniqueComponents[index + 1];
      if (nextItem && nextItem.startsWith(item) && nextItem !== item) {
        return false;
      }
      return true;
    });

    return finalComponents.join(' ');
  };

  // ---------------------------------------------------------
  // 🔥 [기능 2] Firebase에 위치 정보 저장 함수 (Firestore)
  // ---------------------------------------------------------
  const saveLocationToFirebase = async (lat: number, lng: number, addr: string) => {
    // ID가 없으면 저장하지 않음 (안전장치)
    if (!userId) return;

    // Firestore Document Reference
    const userRef = doc(db, "users", userId);
    
    // Firestore Update Operation
    updateDoc(userRef, {
      // 대시보드가 읽기 쉬운 최상위 필드
      currentAddress: addr, 
      location: {
        latitude: lat,
        longitude: lng,
        address: addr, // 로그용
        timestamp: new Date().getTime() // JS Timestamp
      }
    })
    .then(() => console.log(`✅ 위치 정보 저장 완료 (Firestore: ${userId})`))
    .catch((err) => console.error("❌ 위치 저장 실패 (Firestore):", err));
  };

  // ---------------------------------------------------------
  // 📍 위치 가져오기 함수 (GPS)
  // ---------------------------------------------------------
  const getLocation = async () => {
    setIsRefreshing(true);
    setErrorMsg(null);
    setAddress('위치를 가져오는 중...');

    try {
      // 1. 위치 권한 요청
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('위치 권한이 거부되었습니다.');
        setAddress('위치 권한이 필요합니다.');
        Alert.alert("권한 오류", "앱 설정에서 위치 권한을 허용해주세요.");
        setIsRefreshing(false);
        return;
      }

      // 2. 현재 위치 좌표 가져오기 (정확도 높음)
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);

      // 3. 주소 변환 (Reverse Geocoding)
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const addrObj = reverseGeocode[0];
        
        // 🔥 중복 제거된 깔끔한 주소 생성
        const fullAddress = formatAddress(addrObj);
        
        setAddress(fullAddress);
        setGlobalAddress(fullAddress); // 앱 전체 공유
        
        // 🔥 Firebase에 저장 (Firestore)
        saveLocationToFirebase(
            currentLocation.coords.latitude, 
            currentLocation.coords.longitude, 
            fullAddress
        );

      } else {
        setAddress('주소를 찾을 수 없습니다.');
      }

    } catch (error) {
      console.error(error);
      setAddress('위치 찾기 실패 (GPS를 켜주세요)');
    } finally {
      setIsRefreshing(false);
    }
  };

  // 화면이 켜질 때 자동으로 위치 찾기
  useEffect(() => {
    getLocation();
  }, [userId]); // userId가 로드되면 다시 시도

  // ---------------------------------------------------------
  // 애니메이션 설정 (기존 UI 유지)
  // ---------------------------------------------------------
  const pulse = useRef(new Animated.Value(0)).current;
  const pinBounce = useRef(new Animated.Value(0)).current;
  const refreshRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pinBounce, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pinBounce, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pinBounce]);

  const pinTranslateY = pinBounce.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  useEffect(() => {
    if (isRefreshing) {
      refreshRotate.setValue(0);
      Animated.loop(
        Animated.timing(refreshRotate, { toValue: 1, duration: 700, useNativeDriver: true }),
      ).start();
    } else {
      refreshRotate.stopAnimation();
    }
  }, [isRefreshing, refreshRotate]);

  const refreshSpin = refreshRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
            <Ionicons name="arrow-back" size={24} color="black" onPress={() => onNavigate('home')} />
            <Text style={styles.headerTitle}>현재 위치</Text>
            <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Map Card */}
          <View style={styles.mapCard}>
            <View style={styles.mapContainer}>
              {location ? (
                <MapView
                  style={StyleSheet.absoluteFill}
                  region={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  showsUserLocation={true}
                >
                  <Marker
                    coordinate={{
                      latitude: location.coords.latitude,
                      longitude: location.coords.longitude,
                    }}
                    title="현재 위치"
                    description={address}
                  />
                </MapView>
              ) : (
                <View style={styles.loadingContainer}>
                   <ActivityIndicator size="large" color="#3B82F6" />
                   <Text style={{ marginTop: 10, color: '#666', fontWeight: 'bold' }}>
                       {errorMsg || "GPS 신호 수신 중..."}
                   </Text>
                </View>
              )}
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
            onPress={getLocation}
            disabled={isRefreshing}
            style={styles.refreshButton}
          >
            <Animated.View style={{ transform: [{ rotate: refreshSpin }] }}>
              <Text style={styles.refreshIcon}>↻</Text>
            </Animated.View>
            <Text style={styles.refreshText}>
              {isRefreshing ? '위치 갱신 중...' : '위치 다시 가져오기'}
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
/* Styles (기존 스타일 유지)                                           */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E0F2FE',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  },
  root: {
    flex: 1,
    backgroundColor: '#E0F2FE',
  },
  header: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    height: 300, 
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
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
    color: '#4B5563',
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