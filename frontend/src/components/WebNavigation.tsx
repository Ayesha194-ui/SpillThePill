import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';

interface WebNavigationProps {
  currentTab: string;
}

export default function WebNavigation({ currentTab }: WebNavigationProps) {
  const router = useRouter();

  // Only show on web
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.navBar} className="web-top-nav">
        {/* Centered SpillThePill Title */}
        <TouchableOpacity 
          style={styles.logoContainer}
          onPress={() => router.push('/')}
        >
          <Text style={styles.logo}>💊 SpillThePill</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  navBar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
  },
  logoContainer: {
    cursor: 'pointer',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#424242',
    textAlign: 'center',
  },
}); 