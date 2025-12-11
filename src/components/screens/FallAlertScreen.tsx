import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';

interface FallAlertScreenProps {
  onCancel: () => void;
}

export const FallAlertScreen: React.FC<FallAlertScreenProps> = ({ onCancel }) => {
  const [countdown, setCountdown] = useState(10);

  // 아이콘 깜빡임(스케일 + 투명도)
  const iconScale = useRef(new Animated.Value(1)).current;
  const iconOpacity = useRef(new Animated.Value(1)).current;

  // 숫자 튀어나오는 느낌
  const countScale = useRef(new Animated.Value(1)).current;

  // 진행바 (1 → 0)
  const progress = useRef(new Animated.Value(1)).current;

  // 아이콘 무한 깜빡임
  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(iconScale, {
            toValue: 1.1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(iconScale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(iconOpacity, {
            toValue: 0.7,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(iconOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [iconScale, iconOpacity]);

  // 카운트다운
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          console.log('Alert sent to guardian!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 숫자 애니메이션 (값 바뀔 때마다 튀어나오는 느낌)
  useEffect(() => {
    countScale.setValue(1.5);
    Animated.timing(countScale, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [countdown, countScale]);

  // 10초 동안 진행바 감소
  useEffect(() => {
    progress.setValue(1);
    Animated.timing(progress, {
      toValue: 0,
      duration: 10_000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const handleCancel = () => {
    onCancel();
  };

  return (
    <View style={styles.container}>
      {/* 경고 아이콘 */}
      <Animated.View
        style={[
          styles.iconWrapper,
          { transform: [{ scale: iconScale }], opacity: iconOpacity },
        ]}
      >
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>⚠️</Text>
        </View>
      </Animated.View>

      {/* 타이틀 */}
      <Text style={styles.title}>낙상 의심 감지</Text>

      {/* 카운트다운 */}
      <View style={styles.countdownWrapper}>
        <Animated.Text
          style={[
            styles.countdownText,
            { transform: [{ scale: countScale }] },
          ]}
        >
          {countdown}
        </Animated.Text>
        <Text style={styles.secondsText}>초</Text>
      </View>

      {/* 취소 버튼 */}
      <Pressable style={styles.cancelButton} onPress={handleCancel}>
        <Text style={styles.cancelText}>괜찮습니다 (취소)</Text>
      </Pressable>

      {/* 안내 문구 */}
      <Text style={styles.infoText}>
        10초 내 취소하지 않으면 보호자에게 알림이 전송됩니다.
      </Text>

      {/* 진행 바 */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b91c1c', // red-700-ish
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginBottom: 32,
  },
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
  iconText: {
    fontSize: 56,
  },
  title: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
  },
  countdownWrapper: {
    alignItems: 'center',
    marginBottom: 40,
  },
  countdownText: {
    fontSize: 72,
    color: '#ffffff',
    fontWeight: '700',
  },
  secondsText: {
    fontSize: 20,
    color: '#fee2e2',
    marginTop: 4,
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: '#facc15', // yellow-400
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  cancelText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
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
  progressBar: {
    height: '100%',
    backgroundColor: '#facc15',
  },
});
