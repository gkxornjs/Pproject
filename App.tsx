// App.tsx (React Native 버전)
import { useState } from 'react';
import React, { useEffect } from "react";
import { View, StyleSheet } from 'react-native';

import { OnboardingScreen } from './src/components/screens/OnboardingScreen';
import { HomeScreen } from './src/components/screens/HomeScreen';
import { FallAlertScreen } from './src/components/screens/FallAlertScreen';
import { SettingsScreen } from './src/components/screens/SettingsScreen';
import { LocationScreen } from './src/components/screens/LocationScreen';
import { LogsScreen } from './src/components/screens/LogsScreen';
import testFirebaseConnection from "./src/components/firebase/testConnection";
type Screen = 'onboarding' | 'home' | 'alert' | 'settings' | 'logs' | 'location';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [sensorPermission, setSensorPermission] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [userName, setUserName] = useState('');
  const [guardianContact, setGuardianContact] = useState('');
  const [sensitivity, setSensitivity] = useState(50);

  const handleStart = () => {
    if (sensorPermission && notificationPermission) {
      setCurrentScreen('home');
    }
  };

  const handleSensorPermission = () => {
    setSensorPermission(true);
  };

  const handleNotificationPermission = () => {
    setNotificationPermission(true);
  };

  const simulateFall = () => {
    setCurrentScreen('alert');
  };

  const cancelAlert = () => {
    setCurrentScreen('home');
  };

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };
  useEffect(() => {
    testFirebaseConnection();
  }, []);

  return (
    <View style={styles.container}>
      {currentScreen === 'onboarding' && (
        <OnboardingScreen
          onStart={handleStart}
          onSensorPermission={handleSensorPermission}
          onNotificationPermission={handleNotificationPermission}
          sensorGranted={sensorPermission}
          notificationGranted={notificationPermission}
        />
      )}

      {currentScreen === 'home' && (
        <HomeScreen onNavigate={navigateTo} onSimulateFall={simulateFall} />
      )}

      {currentScreen === 'alert' && (
        <FallAlertScreen onCancel={cancelAlert} />
      )}

      {currentScreen === 'settings' && (
        <SettingsScreen
          onNavigate={navigateTo}
          userName={userName}
          setUserName={setUserName}
          guardianContact={guardianContact}
          setGuardianContact={setGuardianContact}
          sensitivity={sensitivity}
          setSensitivity={setSensitivity}
        />
      )}

      {currentScreen === 'location' && (
        <LocationScreen onNavigate={navigateTo} />
      )}

      {currentScreen === 'logs' && (
        <LogsScreen onNavigate={navigateTo} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // gray-50-ish
  },
});
