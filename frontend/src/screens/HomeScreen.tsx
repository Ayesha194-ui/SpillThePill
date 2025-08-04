import React from 'react';
import { Platform } from 'react-native';
import MobileHomeScreen from './MobileHomeScreen';
import WebHomeScreen from './WebHomeScreen';

export default function HomeScreen() {
  if (Platform.OS === 'web') {
    return <WebHomeScreen />;
  }
  
  return <MobileHomeScreen />;
} 