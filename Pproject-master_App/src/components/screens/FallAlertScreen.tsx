import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, SafeAreaView, Platform, StatusBar, Alert } from 'react-native';
import { Audio } from 'expo-av';

interface FallAlertScreenProps {
  onCancel: () => void;
  countdownSeconds: number; 
  notifyGuardian: boolean;
  notify119: boolean;
  guardianContact: string;
  userId: string; 
}

const SERVER_URL_FALL_ALERT = 'http://192.168.3.3:60010/alert/fall'; 

export const FallAlertScreen: React.FC<FallAlertScreenProps> = ({
  onCancel,
  countdownSeconds,
  notifyGuardian,
  notify119,
  guardianContact,
  userId, 
}) => {
  const [countdown, setCountdown] = useState(countdownSeconds);
  const hasSentAlertRef = useRef(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const iconScale = useRef(new Animated.Value(1)).current;
  const iconOpacity = useRef(new Animated.Value(1)).current;
  const countScale = useRef(new Animated.Value(1)).current;
  const progress = useRef(new Animated.Value(1)).current;

  // ---------------------------------------------------------
  // 🔊 [핵심 수정] 오디오 모드 설정 및 재생
  // ---------------------------------------------------------
  async function playSiren() {
    try {
      console.log('🔊 오디오 세션 설정 중...');
      
      // 1. 무음 모드에서도 소리가 나도록 강제 설정 (iOS 필수)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true, // 무음 모드 무시하고 재생
        shouldDuckAndroid: true,    // 다른 앱 소리 줄이기
        playThroughEarpieceAndroid: false, // 스피커로 출력
        staysActiveInBackground: true,
      });

      console.log('🔊 파일 로딩 중...');
      // 2. 소리 파일 로드 및 재생
      const { sound } = await Audio.Sound.createAsync(
         require('../../../assets/siren.mp3'),
         { shouldPlay: true, isLooping: true, volume: 1.0 } // 바로 재생, 무한 반복, 볼륨 최대
      );
      
      setSound(sound);
      console.log('✅ 소리 재생 시작');
    } catch (error) {
      console.log('❌ 소리 재생 실패:', error);
      Alert.alert("오류", "사이렌 소리 파일을 찾을 수 없습니다. assets 폴더를 확인해주세요.");
    }
  }

  // 화면 켜지면 소리 재생
  useEffect(() => {
    playSiren();

    return () => {
      // 화면 꺼지면 정리
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
      }
    };
  }, []);

  // ---------------------------------------------------------
  // [기존 로직 유지]
  // ---------------------------------------------------------
  useEffect(() => {
    setCountdown(countdownSeconds);
    hasSentAlertRef.current = false;
  }, [countdownSeconds]);

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

  useEffect(() => {
    countScale.setValue(1.5);
    Animated.timing(countScale, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [countdown, countScale]);

  useEffect(() => {
    progress.setValue(1);
    Animated.timing(progress, {
      toValue: 0,
      duration: countdownSeconds * 1000,
      useNativeDriver: false,
    }).start();
  }, [progress, countdownSeconds]);

  const sendFallAlertToServer = async () => {
    if (hasSentAlertRef.current) return;
    hasSentAlertRef.current = true;

    // 전송 시 소리 끄기
    if (sound) {
        await sound.stopAsync();
    }

    console.log(`🚀 [알림 요청] ${SERVER_URL_FALL_ALERT} 로 전송 시도...`);

    try {
      const res = await fetch(SERVER_URL_FALL_ALERT, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardianContact,
          notifyGuardian,
          notify119,
          userId,
        }),
      });

      if (!res.ok) {
        Alert.alert("전송 실패", "서버 오류가 발생했습니다.");
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        Alert.alert("알림 전송 성공", "보호자에게 비상 문자가 전송되었습니다.");
      } else {
        // Alert.alert("전송 실패", data.msg);
      }

    } catch (error: any) {
      Alert.alert("연결 실패", "서버에 연결할 수 없습니다.");
    }
  };

  useEffect(() => {
    if (countdown === 0) {
      sendFallAlertToServer(); 
    }
  }, [countdown]);

  const handleCancel = async () => {
    if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
    }
    onCancel();
  };

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
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
        <Pressable style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelText}>괜찮습니다 (취소)</Text>
        </Pressable>
        <Text style={styles.infoText}>
          {countdownSeconds}초 내 취소하지 않으면 보호자에게 문자가 전송됩니다.
        </Text>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#b91c1c', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0 },
  container: { flex: 1, backgroundColor: '#b91c1c', paddingHorizontal: 24, paddingVertical: 32, alignItems: 'center', justifyContent: 'center' },
  iconWrapper: { marginBottom: 32 },
  iconCircle: { width: 128, height: 128, borderRadius: 64, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  iconText: { fontSize: 56 },
  title: { fontSize: 32, color: '#ffffff', fontWeight: '700', textAlign: 'center', marginBottom: 32 },
  countdownWrapper: { alignItems: 'center', marginBottom: 40 },
  countdownText: { fontSize: 72, color: '#ffffff', fontWeight: '700' },
  secondsText: { fontSize: 20, color: '#fee2e2', marginTop: 4 },
  cancelButton: { width: '100%', paddingVertical: 16, borderRadius: 24, backgroundColor: '#facc15', alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  cancelText: { fontSize: 20, fontWeight: '700', color: '#111827' },
  infoText: { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 8, paddingHorizontal: 8 },
  progressTrack: { width: '100%', height: 10, borderRadius: 999, backgroundColor: 'rgba(127,29,29,0.7)', overflow: 'hidden', marginTop: 24 },
  progressBar: { height: '100%', backgroundColor: '#facc15' },
});