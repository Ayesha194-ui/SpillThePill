import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.95)' : '#ffffff',
          borderTopWidth: Platform.OS === 'web' ? 0 : 1,
          borderTopColor: '#e0e0e0',
          height: Platform.OS === 'web' ? 80 : 60,
          paddingBottom: Platform.OS === 'web' ? 20 : 10,
          paddingTop: Platform.OS === 'web' ? 10 : 5,
          display: Platform.OS === 'web' ? 'none' : 'flex', // Hide tab bar on web
        },
        tabBarActiveTintColor: '#2c5aa0',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>💾</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
