import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, SafeAreaView, Platform, StatusBar } from 'react-native';

interface FallAlertScreenProps {
  onCancel: () => void;

  countdownSeconds: number; // ✅ 10~30
  notifyGuardian: boolean;
  notify119: boolean;
  guardianContact: string;
}

export const FallAlertScreen: React.FC<FallAlertScreenProps> = ({
  onCancel,
  countdownSeconds,
  notifyGuardian,
  notify119,
  guardianContact,
}) => {
  const [countdown, setCountdown] = useState(countdownSeconds);
  //서버 신호
  const hasSentAlertRef = useRef(false);

  // 아이콘 깜빡임
  const iconScale = useRef(new Animated.Value(1)).current;
  const iconOpacity = useRef(new Animated.Value(1)).current;

  // 숫자 튀어나오는 느낌
  const countScale = useRef(new Animated.Value(1)).current;

  // 진행바 (1 → 0)
  const progress = useRef(new Animated.Value(1)).current;

  // countdownSeconds 변경 시 리셋
  useEffect(() => {
    setCountdown(countdownSeconds);
  }, [countdownSeconds]);

  // 아이콘 무한 깜빡임
  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(iconScale, { toValue: 1.1, duration: 400, useNativeDriver: true }),
          Animated.timing(iconScale, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(iconOpacity, { toValue: 0.7, duration: 400, useNativeDriver: true }),
          Animated.timing(iconOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [iconScale, iconOpacity]);

  // 카운트다운 interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownSeconds]);

  // 숫자 애니메이션
  useEffect(() => {
    countScale.setValue(1.5);
    Animated.timing(countScale, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [countdown, countScale]);

  // 진행바 duration = countdownSeconds
  useEffect(() => {
    progress.setValue(1);
    Animated.timing(progress, {
      toValue: 0,
      duration: countdownSeconds * 1000,
      useNativeDriver: false,
    }).start();
  }, [progress, countdownSeconds]);

  //서버로 알림 보내는 함수
   const sendFallAlertToServer = async () => {
    try {
      const res = await fetch('http://IP:3000/api/fall-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guardianContact,
          notifyGuardian,
          notify119,
        }),
      });

      if (!res.ok) {
        console.log('❌ 서버 응답 오류', res.status);
        return;
      }

      const data = await res.json().catch(() => null);
      console.log('✅ 서버로 낙상 알림 전송 성공', data);
    } catch (error) {
      console.log('❌ 서버로 낙상 알림 전송 실패', error);
    }
  };

  // countdown == 0이면 전송(데모)
  useEffect(() => {
    if (countdown !== 0) return;

    if (notifyGuardian && guardianContact) {
      console.log(`✅ 보호자에게 전송: ${guardianContact}`);
    }
    if (notify119) {
      console.log('✅ 119에 전송');
    }
    sendFallAlertToServer();
  }, [countdown, notifyGuardian, notify119, guardianContact]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 아이콘 */}
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale: iconScale }], opacity: iconOpacity }]}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>⚠️</Text>
          </View>
        </Animated.View>

        <Text style={styles.title}>낙상 의심 감지</Text>

        <View style={styles.countdownWrapper}>
          <Animated.Text style={[styles.countdownText, { transform: [{ scale: countScale }] }]}>
            {countdown}
          </Animated.Text>
          <Text style={styles.secondsText}>초</Text>
        </View>

        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>괜찮습니다 (취소)</Text>
        </Pressable>

        <Text style={styles.infoText}>
          {countdownSeconds}초 내 취소하지 않으면 체크된 대상에게 알림이 전송됩니다.
        </Text>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#b91c1c',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#b91c1c',
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: { marginBottom: 32 },
  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  iconText: { fontSize: 56 },

  title: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
  },

  countdownWrapper: { alignItems: 'center', marginBottom: 40 },
  countdownText: { fontSize: 72, color: '#ffffff', fontWeight: '700' },
  secondsText: { fontSize: 20, color: '#fee2e2', marginTop: 4 },

  cancelButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: '#facc15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  cancelText: { fontSize: 20, fontWeight: '700', color: '#111827' },

  infoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },

  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(127,29,29,0.7)',
    overflow: 'hidden',
    marginTop: 24,
  },
  progressBar: { height: '100%', backgroundColor: '#facc15' },
});
