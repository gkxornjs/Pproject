import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Slider } from '../ui/slider';
interface SettingsScreenProps {
  onNavigate: (screen: 'home' | 'logs' | 'settings' | 'location') => void;
  userName: string;
  setUserName: (name: string) => void;
  guardianContact: string;
  setGuardianContact: (contact: string) => void;
  sensitivity: number;
  setSensitivity: (value: number) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onNavigate,
  userName,
  setUserName,
  guardianContact,
  setGuardianContact,
  sensitivity,
  setSensitivity,
}) => {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>설정</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Name */}
        <View style={styles.card}>
          <Text style={styles.label}>사용자 이름</Text>
          <TextInput
            value={userName}
            onChangeText={setUserName}
            placeholder="이름을 입력하세요"
            placeholderTextColor="#9CA3AF"
            style={styles.textInput}
          />
        </View>

        {/* Guardian Contact */}
        <View style={styles.card}>
          <Text style={styles.label}>보호자 연락처</Text>
          <TextInput
            value={guardianContact}
            onChangeText={setGuardianContact}
            placeholder="010-0000-0000"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            style={styles.textInput}
          />
        </View>

        {/* Sensitivity */}
        <View style={styles.card}>
          <View style={styles.sensitivityHeader}>
            <View>
              <Text style={styles.label}>감지 민감도 (Threshold)</Text>
              <Text style={styles.sensitivityHint}>
                낮을수록 민감, 높을수록 덜 민감
              </Text>
            </View>
            <Text style={styles.sensitivityValue}>{sensitivity}</Text>
          </View>

          <Slider
            style={styles.slider}
            min={10}
            max={100}
            step={1}
            value={sensitivity}
            onValueChange={(val) => setSensitivity(Math.round(val))}
            
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>10</Text>
            <Text style={styles.sliderLabelText}>100</Text>
          </View>
        </View>

        {/* Firebase 상태 */}
        <View style={styles.card}>
          <View style={styles.firebaseRow}>
            <Text style={styles.label}>Firebase 연결 상태</Text>
            <View style={styles.firebaseStatus}>
              <View style={styles.firebaseDot} />
              <Text style={styles.firebaseText}>Connected</Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
          ]}
        >
          <Text style={styles.saveIcon}>💾</Text>
          <Text style={styles.saveText}>
            {saved ? '저장되었습니다!' : '저장하기'}
          </Text>
        </Pressable>
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
            style={[styles.bottomNavItem, styles.bottomNavItemActive]}
          >
            <Text style={styles.bottomNavIcon}>⚙️</Text>
            <Text style={styles.bottomNavLabelActive}>설정</Text>
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
    backgroundColor: '#F3F4F6', // 기존 root 배경색
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  },
  root: {
    flex: 1,
    backgroundColor: '#F3F4F6', // slate-50-ish
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
    color: '#111827',
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 80,
    gap: 16,
  } as any,
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  label: {
    fontSize: 18,
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 18,
    color: '#111827',
  },
  sensitivityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sensitivityHint: {
    fontSize: 12,
    color: '#6B7280',
  },
  sensitivityValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#059669',
  },
  slider: {
    width: '100%',
    marginTop: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#6B7280',
  },
  firebaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  firebaseStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  } as any,
  firebaseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  firebaseText: {
    fontSize: 16,
    color: '#059669',
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: '#059669',
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
  saveButtonPressed: {
    backgroundColor: '#047857',
  },
  saveIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  saveText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
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
