import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 🔥 Firestore Import
import { collection, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; 

interface LogEntry {
  id: string;
  date: string;
  time: string;
  content: string;
  source: string;
}

interface LogsScreenProps {
  onNavigate: (screen: 'home' | 'logs' | 'settings' | 'location') => void;
  // App.tsx에서 받아온 현재 유저 ID
  userId: string; 
}

// ---------------------------------------------------------
// 🔥 유틸리티 함수: 로그 내용 포맷팅
// ---------------------------------------------------------
const formatLogContent = (data: any): string => {
    if (data.event) return data.event; // '낙상 감지(확정)'
    if (data.note) return data.note;   // 'Cancelled by User'
    if (data.status) return `상태 변경: ${data.status.toUpperCase()}`;
    return '기록 알 수 없음';
}

export const LogsScreen: React.FC<LogsScreenProps> = ({ onNavigate, userId }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------
  // 🔥 [핵심] Firestore 실시간 로그 리스너
  // ---------------------------------------------------------
  useEffect(() => {
    if (!userId || !db) return;

    // 1. users/{userId}/logs 서브컬렉션 참조
    const logsColRef = collection(db, "users", userId, "logs");
    
    // 2. 쿼리: timestamp를 기준으로 최신순 정렬
    const q = query(logsColRef, orderBy("timestamp", "desc"));

    console.log(`👀 [Logs] Firestore 리스너 시작: ${userId}/logs`);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedLogs: LogEntry[] = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Timestamp 객체를 밀리초로 변환
        let timestampMs = 0;
        if (data.timestamp instanceof Timestamp) {
            timestampMs = data.timestamp.toMillis();
        } else if (data.timestamp?.toMillis) {
            timestampMs = data.timestamp.toMillis();
        } else {
            timestampMs = Date.now(); // 실패 시 현재 시간 사용
        }

        return {
          id: doc.id,
          date: new Date(timestampMs).toLocaleDateString('ko-KR'),
          time: new Date(timestampMs).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          content: formatLogContent(data),
          source: data.source || '앱',
        };
      });

      setLogs(loadedLogs);
      setLoading(false);
    }, (error) => {
      console.error("❌ Firestore Logs Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
            <Ionicons name="arrow-back" size={24} color="black" onPress={() => onNavigate('home')} />
            <Text style={styles.headerTitle}>이벤트 기록</Text>
            <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.infoText}>낙상 감지 및 시스템 활동 기록</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#059669" />
              <Text style={styles.loadingText}>기록을 불러오는 중...</Text>
            </View>
          ) : (
            <ScrollView style={styles.logScrollView} contentContainerStyle={styles.logContentContainer}>
              {logs.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>아직 기록된 이벤트가 없습니다.</Text>
                  <Text style={styles.emptyHint}>낙상 시뮬레이션을 실행하여 테스트해보세요.</Text>
                </View>
              ) : (
                logs.map((log) => (
                  <View key={log.id} style={styles.logItem}>
                    <View style={styles.logIconCircle}>
                      <Text style={styles.logIcon}>
                        {log.content.includes('낙상') || log.content.includes('응급') ? '🚨' : '✅'}
                      </Text>
                    </View>
                    <View style={styles.logDetails}>
                      <Text style={styles.logContentText}>{log.content}</Text>
                      <View style={styles.logMeta}>
                        <Text style={styles.logMetaText}>
                          {log.date} {log.time}
                        </Text>
                        <Text style={styles.logSourceText}>
                          출처: {log.source}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>

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
              style={[styles.bottomNavItem, styles.bottomNavItemActive]}
            >
              <Text style={styles.bottomNavIconActive}>📄</Text>
              <Text style={styles.bottomNavLabelActive}>Logs</Text>
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

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F3F4F6', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0 },
    root: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { 
        backgroundColor: 'rgba(255,255,255,0.9)', 
        paddingHorizontal: 24, 
        paddingVertical: 12, 
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: { fontSize: 24, fontWeight: '700', color: '#111827' },
    content: { flex: 1, paddingHorizontal: 24, paddingVertical: 16, paddingBottom: 70 },
    infoText: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
    logScrollView: { flex: 1 },
    logContentContainer: { paddingBottom: 20 },
    logItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderLeftWidth: 5,
        borderLeftColor: '#059669',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    logIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    logIcon: { fontSize: 20 },
    logDetails: { flex: 1 },
    logContentText: { fontSize: 16, fontWeight: '600', color: '#111827' },
    logMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
    logMetaText: { fontSize: 12, color: '#6B7280' },
    logSourceText: { fontSize: 12, color: '#9CA3AF', fontWeight: 'bold' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 300 },
    loadingText: { marginTop: 10, fontSize: 16, color: '#6B7280' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 300, paddingVertical: 50 },
    emptyText: { fontSize: 18, fontWeight: '600', color: '#4B5563', marginBottom: 5 },
    emptyHint: { fontSize: 14, color: '#9CA3AF' },

    bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', elevation: 6, flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E7EB', height: 70, alignItems: 'center' },
    bottomNavInner: { flexDirection: 'row' },
    bottomNavItem: { flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
    bottomNavItemActive: { backgroundColor: '#ECFDF5' },
    bottomNavIcon: { fontSize: 20, marginBottom: 4, color: '#4B5563' },
    bottomNavIconActive: { fontSize: 20, marginBottom: 4, color: '#059669' },
    bottomNavLabel: { fontSize: 12, color: '#4B5563' },
    bottomNavLabelActive: { fontSize: 12, color: '#059669', fontWeight: '600' },
});