import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';

interface OnboardingScreenProps {
  onStart: () => void;
  onSensorPermission: () => void;
  onNotificationPermission: () => void;
  sensorGranted: boolean;
  notificationGranted: boolean;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onStart,
  onSensorPermission,
  onNotificationPermission,
  sensorGranted,
  notificationGranted,
}) => {
  // 로고 박스 튀어나오는 애니메이션
  const logoScale = useRef(new Animated.Value(0)).current;
  // 폰 + 파동 애니메이션
  const phoneScale = useRef(new Animated.Value(0)).current;
  const wavesScale = useRef(new Animated.Value(0)).current;
  const wavesOpacity = useRef(new Animated.Value(0.5)).current;
  
  useEffect(() => {
    Animated.spring(logoScale, {
      toValue: 1,
      stiffness: 200,
      useNativeDriver: true,
    }).start();

    const phoneLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(phoneScale, {
          toValue: 1.05,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(phoneScale, {
          toValue: 0.95,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );

    const wavesLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(wavesScale, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(wavesOpacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(wavesScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(wavesOpacity, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    phoneLoop.start();
    wavesLoop.start();

    return () => {
      phoneLoop.stop();
      wavesLoop.stop();
    };
  }, [logoScale, phoneScale, wavesScale, wavesOpacity]);

  const canStart = sensorGranted && notificationGranted;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.inner}>
        {/* Logo & Title */}
        <View style={styles.logoSection}>
          <Animated.View
            style={[
              styles.logoBox,
              { transform: [{ scale: logoScale }] },
            ]}
          >
            <View style={styles.logoIconBox}>
              <Text style={styles.logoIcon}>📱</Text>
            </View>
          </Animated.View>
          <Text style={styles.title}>SilverGuard</Text>
          <Text style={styles.subtitle}>스마트폰 기반 낙상 감지 시스템</Text>
        </View>

        {/* Illustration */}
        <View style={styles.illustrationWrapper}>
          <View style={styles.illustrationInner}>
            <Animated.View
              style={[
                styles.wavesCircle,
                {
                  transform: [{ scale: wavesScale }],
                  opacity: wavesOpacity,
                },
              ]}
            >
              <Text style={styles.wavesEmoji}>🌊</Text>
            </Animated.View>
            <Animated.View
              style={[
                styles.phoneIconBox,
                { transform: [{ scale: phoneScale }] },
              ]}
            >
              <Text style={styles.phoneEmoji}>📱</Text>
            </Animated.View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsWrapper}>
          {/* 시작하기 */}
          <Pressable
            onPress={onStart}
            disabled={!canStart}
            style={({ pressed }) => [
              styles.startButton,
              !canStart && styles.startButtonDisabled,
              pressed && canStart && styles.startButtonPressed,
            ]}
          >
            <Text style={styles.startButtonText}>시작하기</Text>
          </Pressable>

          {/* 센서 권한 */}
          <Pressable
            onPress={onSensorPermission}
            disabled={sensorGranted}
            style={({ pressed }) => [
              styles.permissionButton,
              styles.sensorButton,
              sensorGranted && styles.permissionButtonGranted,
              pressed && !sensorGranted && styles.permissionButtonPressed,
            ]}
          >
            <Text style={styles.permissionText}>센서 권한 허용</Text>
            {sensorGranted && <Text style={styles.checkIcon}>✔️</Text>}
          </Pressable>

          {/* 알림 권한 */}
          <Pressable
            onPress={onNotificationPermission}
            disabled={notificationGranted}
            style={({ pressed }) => [
              styles.permissionButton,
              styles.notificationButton,
              notificationGranted && styles.permissionButtonGrantedNotif,
              pressed &&
                !notificationGranted &&
                styles.permissionButtonPressed,
            ]}
          >
            <Text style={styles.permissionText}>알림 권한 허용</Text>
            {notificationGranted && <Text style={styles.checkIcon}>✔️</Text>}
          </Pressable>
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
    backgroundColor: '#ECFDF5', // 기존 root 배경색
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 24,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    marginBottom: 16,
  },
  logoIconBox: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#059669', // emerald-600
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  logoIcon: {
    fontSize: 40,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#4B5563',
  },
  illustrationWrapper: {
    height: 160,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationInner: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wavesCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wavesEmoji: {
    fontSize: 56,
    color: '#22D3EE',
  },
  phoneIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneEmoji: {
    fontSize: 36,
    color: '#059669',
  },
  buttonsWrapper: {
    width: '100%',
    marginTop: 16,
  },
  startButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginBottom: 12,
  },
  startButtonDisabled: {
    opacity: 0.4,
  },
  startButtonPressed: {
    backgroundColor: '#047857',
  },
  startButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  permissionButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  } as any,
  sensorButton: {
    borderColor: '#059669',
  },
  notificationButton: {
    borderColor: '#06B6D4',
  },
  permissionButtonPressed: {
    backgroundColor: '#F9FAFB',
  },
  permissionButtonGranted: {
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
  permissionButtonGrantedNotif: {
    backgroundColor: '#ECFEFF',
    borderColor: '#7DD3FC',
  },
  permissionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  checkIcon: {
    fontSize: 18,
  },
});
