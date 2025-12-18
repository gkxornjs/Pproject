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
  Alert
} from 'react-native';
import Slider from '@react-native-community/slider';

interface SettingsScreenProps {
  onNavigate: (screen: 'home' | 'logs' | 'settings' | 'location') => void;
  userName: string; setUserName: (name: string) => void;
  userAge: string; setUserAge: (age: string) => void;
  userContact: string; setUserContact: (contact: string) => void;
  guardianContact: string; setGuardianContact: (contact: string) => void;
  sensitivity: number; setSensitivity: (value: number) => void;
  notifyGuardian: boolean; setNotifyGuardian: (v: boolean) => void;
  notify119: boolean; setNotify119: (v: boolean) => void;
  alertCountdown: number; setAlertCountdown: (v: number) => void;
  onSave: () => void;
}

const CustomCheckbox = ({ checked, onChange, disabled }: { checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) => {
  return (
    <Pressable
      onPress={() => !disabled && onChange && onChange(!checked)}
      style={[styles.checkboxBase, checked && styles.checkboxChecked, disabled && styles.checkboxDisabled]}
    >
      {checked && <Text style={styles.checkboxLabel}>✓</Text>}
    </Pressable>
  );
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onNavigate,
  userName, setUserName,
  userAge, setUserAge,
  userContact, setUserContact,
  guardianContact, setGuardianContact,
  sensitivity, setSensitivity,
  notifyGuardian, setNotifyGuardian,
  notify119, setNotify119,
  alertCountdown, setAlertCountdown,
  onSave,
}) => {
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 

  const formatPhoneNumber = (text: string) => {
    if (!text) return '';
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 3) return cleaned;
    else if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    else return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handleUserContactChange = (text: string) => setUserContact(formatPhoneNumber(text));
  const handleGuardianContactChange = (text: string) => setGuardianContact(formatPhoneNumber(text));

  const handleSave = () => {
    if (!userName.trim() || !userAge.trim() || !userContact.trim() || !guardianContact.trim()) {
      Alert.alert("입력 오류", "모든 정보를 입력해주세요.");
      return;
    }
    onSave(); 
    setSaved(true);
    setIsEditing(false); 
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>설정</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          
          {/* 1. 사용자 정보 */}
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>사용자 정보</Text>
            <Text style={styles.label}>이름</Text>
            <TextInput
              value={userName}
              onChangeText={setUserName}
              placeholder="이름"
              style={[styles.textInput, !isEditing && styles.disabledInput]}
              editable={isEditing}
            />
            <Text style={[styles.label, { marginTop: 12 }]}>나이</Text>
            <TextInput
              value={userAge} 
              onChangeText={setUserAge}
              placeholder="나이"
              keyboardType="number-pad"
              style={[styles.textInput, !isEditing && styles.disabledInput]}
              editable={isEditing}
            />
            <Text style={[styles.label, { marginTop: 12 }]}>사용자 연락처</Text>
            <TextInput
              value={formatPhoneNumber(userContact)}
              onChangeText={handleUserContactChange}
              placeholder="010-0000-0000"
              keyboardType="phone-pad"
              maxLength={13}
              style={[styles.textInput, !isEditing && styles.disabledInput]}
              editable={isEditing}
            />
          </View>

          {/* 2. 보호자 정보 */}
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>보호자 정보</Text>
            <Text style={styles.label}>보호자 연락처</Text>
            <TextInput
              value={formatPhoneNumber(guardianContact)}
              onChangeText={handleGuardianContactChange}
              placeholder="010-0000-0000"
              keyboardType="phone-pad"
              maxLength={13}
              style={[styles.textInput, !isEditing && styles.disabledInput]}
              editable={isEditing}
            />
          </View>

          {/* 3. 알림 설정 */}
          <View style={styles.card}>
            <Text style={styles.label}>알림 전송 대상</Text>
            <View style={styles.checkRow}>
              <CustomCheckbox checked={notifyGuardian} onChange={isEditing ? setNotifyGuardian : undefined} disabled={!isEditing}/>
              <Text style={styles.checkLabel}>보호자에게 전송</Text>
            </View>
            <View style={styles.checkRow}>
              <CustomCheckbox checked={notify119} onChange={isEditing ? setNotify119 : undefined} disabled={!isEditing}/>
              <Text style={styles.checkLabel}>119에 전송</Text>
            </View>
          </View>

          {/* 4. 민감도 설정 */}
          <View style={styles.card}>
            <View style={styles.sensitivityHeader}>
              <View>
                <Text style={styles.label}>감지 민감도</Text>
                <Text style={styles.sensitivityHint}>낮을수록 민감</Text>
              </View>
              <Text style={styles.sensitivityValue}>{sensitivity}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={10}
              maximumValue={100}
              step={1}
              value={Number(sensitivity)} 
              onValueChange={(val) => setSensitivity(Math.round(val))} // 정수 반올림
              minimumTrackTintColor="#059669"
              maximumTrackTintColor="#D1D5DB"
              thumbTintColor="#059669"
              disabled={!isEditing}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>10 (민감)</Text>
              <Text style={styles.sliderLabelText}>100 (둔감)</Text>
            </View>
          </View>

          {/* 5. 카운트다운 설정 */}
          <View style={styles.card}>
            <View style={styles.sensitivityHeader}>
              <View>
                <Text style={styles.label}>알림 취소 시간</Text>
                <Text style={styles.sensitivityHint}>10~30초</Text>
              </View>
              <Text style={styles.sensitivityValue}>{alertCountdown}초</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={10}
              maximumValue={30}
              step={1}
              value={Number(alertCountdown)} 
              onValueChange={(val) => setAlertCountdown(Math.round(val))} // 정수 반올림
              minimumTrackTintColor="#059669"
              maximumTrackTintColor="#D1D5DB"
              thumbTintColor="#059669"
              disabled={!isEditing}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>10초</Text>
              <Text style={styles.sliderLabelText}>30초</Text>
            </View>
          </View>

          {!isEditing ? (
            <Pressable onPress={() => setIsEditing(true)} style={styles.editButton}>
              <Text style={styles.editButtonText}>✏️ 정보 수정하기</Text>
            </Pressable>
          ) : (
            <Pressable onPress={handleSave} style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}>
              <Text style={styles.saveIcon}>💾</Text>
              <Text style={styles.saveText}>{saved ? '저장되었습니다!' : '저장 완료'}</Text>
            </Pressable>
          )}
        </ScrollView>

        <View style={styles.bottomNav}>
          <Pressable onPress={() => onNavigate('home')} style={styles.bottomNavItem}><Text style={styles.bottomNavIcon}>🏠</Text><Text style={styles.bottomNavLabel}>Home</Text></Pressable>
          <Pressable onPress={() => onNavigate('location')} style={styles.bottomNavItem}><Text style={styles.bottomNavIcon}>📍</Text><Text style={styles.bottomNavLabel}>위치</Text></Pressable>
          <Pressable onPress={() => onNavigate('logs')} style={styles.bottomNavItem}><Text style={styles.bottomNavIcon}>📄</Text><Text style={styles.bottomNavLabel}>Logs</Text></Pressable>
          <Pressable onPress={() => onNavigate('settings')} style={[styles.bottomNavItem, styles.bottomNavItemActive]}><Text style={styles.bottomNavIcon}>⚙️</Text><Text style={styles.bottomNavLabelActive}>설정</Text></Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0 },
  root: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 24, paddingVertical: 12, marginBottom: 16 },
  headerTitle: { fontSize: 24, color: '#111827', fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 100, gap: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, marginBottom: 16 },
  sectionHeader: { fontSize: 20, fontWeight: '700', color: '#059669', marginBottom: 12, marginTop: 4 },
  label: { fontSize: 16, color: '#111827', marginBottom: 6, fontWeight: '600' },
  textInput: { borderWidth: 2, borderColor: '#D1D5DB', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, fontSize: 18, color: '#111827', backgroundColor: '#FFFFFF' },
  disabledInput: { backgroundColor: '#F3F4F6', color: '#9CA3AF', borderColor: '#E5E7EB' },
  sensitivityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sensitivityHint: { fontSize: 12, color: '#6B7280' },
  sensitivityValue: { fontSize: 22, fontWeight: '700', color: '#059669' },
  slider: { width: '100%', height: 40, marginTop: 10 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  sliderLabelText: { fontSize: 12, color: '#6B7280' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  checkLabel: { fontSize: 16, color: '#111827' },
  checkHint: { marginTop: 10, fontSize: 12, color: '#6B7280' },
  saveButton: { marginTop: 4, paddingVertical: 16, borderRadius: 18, backgroundColor: '#059669', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, elevation: 5 },
  saveButtonPressed: { backgroundColor: '#047857' },
  saveIcon: { fontSize: 20, color: '#FFFFFF' },
  saveText: { fontSize: 18, color: '#FFFFFF', fontWeight: '700' },
  editButton: { marginTop: 4, paddingVertical: 16, borderRadius: 18, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', elevation: 5 },
  editButtonText: { fontSize: 18, color: '#FFFFFF', fontWeight: '700' },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', elevation: 6, flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E7EB', height: 70, alignItems: 'center' },
  bottomNavItem: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
  bottomNavItemActive: { backgroundColor: '#ECFDF5' },
  bottomNavIcon: { fontSize: 20, marginBottom: 4 },
  bottomNavLabel: { fontSize: 12, color: '#4B5563' },
  bottomNavLabelActive: { fontSize: 12, color: '#059669', fontWeight: '600' },
  checkboxBase: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', marginRight: 8 },
  checkboxChecked: { backgroundColor: '#059669', borderColor: '#059669' },
  checkboxDisabled: { backgroundColor: '#F3F4F6', borderColor: '#000000' },
  checkboxLabel: { color: '#121212', fontSize: 16, fontWeight: 'bold' },
});