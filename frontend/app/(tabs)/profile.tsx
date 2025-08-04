import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native-paper';
import WebNavigation from '../../src/components/WebNavigation';
import { useAuth } from '../../src/contexts/AuthContext';
import LoginScreen from '../../src/screens/LoginScreen';

// Import web enhancements only on web platform
if (Platform.OS === 'web') {
  require('../../src/styles/web-enhancements.css');
}

export default function ProfileTab() {
  const { user, isLoading, isAuthenticated, logout, getSavedMedicines } = useAuth();
  const [savedMedicines, setSavedMedicines] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSavedMedicines();
    }
  }, [isAuthenticated]);

  const loadSavedMedicines = async () => {
    console.log('Loading saved medicines for profile...');
    const medicines = await getSavedMedicines();
    console.log('Profile loaded medicines:', medicines);
    setSavedMedicines(medicines);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            setSavedMedicines([]);
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <WebNavigation currentTab="profile" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#424242" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <WebNavigation currentTab="profile" />
        <LoginScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebNavigation currentTab="profile" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Web Layout */}
        {Platform.OS === 'web' ? (
          <View style={styles.webContainer}>
            {/* Header Section */}
            <View style={styles.webHeader}>
              <Text style={styles.webHeaderTitle}>Account Settings</Text>
              <Text style={styles.webHeaderSubtitle}>Manage your profile and saved medicines</Text>
            </View>

            {/* Main Content Grid */}
            <View style={styles.webContentGrid}>
              {/* User Profile Section */}
              <View style={styles.webProfileSection}>
                <View style={styles.webProfileHeader}>
                  <View style={styles.webAvatar}>
                    <Text style={styles.webAvatarText}>
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.webUserInfo}>
                    <Text style={styles.webUserName}>{user?.name || 'User'}</Text>
                    <Text style={styles.webUserEmail}>{user?.email}</Text>
                  </View>
                </View>
                
                <View style={styles.webProfileActions}>
                  <TouchableOpacity style={styles.webLogoutButton} onPress={handleLogout}>
                    <Text style={styles.webLogoutText}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Saved Medicines Section */}
              <View style={styles.webMedicinesSection}>
                <Text style={styles.webSectionTitle}>Saved Medicines</Text>
                {savedMedicines.length === 0 ? (
                  <View style={styles.webEmptyState}>
                    <Text style={styles.webEmptyIcon}>💊</Text>
                    <Text style={styles.webEmptyTitle}>No saved medicines yet</Text>
                    <Text style={styles.webEmptyText}>
                      Search for medicines to save them here for quick access
                    </Text>
                  </View>
                ) : (
                  <View style={styles.webMedicinesList}>
                    {savedMedicines.map((medicine, index) => (
                      <View key={index} style={styles.webMedicineItem}>
                        <Text style={styles.webMedicineName}>{medicine}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : (
          /* Mobile Layout - Keep existing mobile design */
          <>
            {/* Header */}
            <View style={styles.header} className={Platform.OS === 'web' ? 'web-glass-card web-modern-radius' : ''}>
              <Text style={styles.headerTitle} className={Platform.OS === 'web' ? 'web-text-shadow' : ''}>
                👤 Profile
              </Text>
              <Text style={styles.headerSubtitle}>
                Your account settings
              </Text>
            </View>

            {/* User Profile Card */}
            <View style={styles.content} className={Platform.OS === 'web' ? 'web-glass-card web-modern-radius' : ''}>
              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{user?.name || 'User'}</Text>
                  <Text style={styles.userEmail}>{user?.email}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>

            {/* Saved Medicines Section */}
            <View style={styles.content} className={Platform.OS === 'web' ? 'web-glass-card web-modern-radius' : ''}>
              <Text style={styles.sectionTitle}>💊 Saved Medicines</Text>
              {savedMedicines.length === 0 ? (
                <Text style={styles.emptyText}>
                  No saved medicines yet. Search for medicines to save them here.
                </Text>
              ) : (
                <View style={styles.medicinesList}>
                  {savedMedicines.map((medicine, index) => (
                    <View key={index} style={styles.medicineItem}>
                      <Text style={styles.medicineName}>{medicine}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? 'transparent' : '#f0f8ff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 60 : 40,
    alignItems: 'center',
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.95)' : '#e6f3ff',
    borderRadius: Platform.OS === 'web' ? 20 : 0,
    margin: Platform.OS === 'web' ? 20 : 0,
  },
  headerTitle: {
    fontSize: Platform.OS === 'web' ? 36 : 28,
    fontWeight: 'bold',
    color: Platform.OS === 'web' ? '#424242' : '#2c5aa0',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: Platform.OS === 'web' ? '#757575' : '#5a7c9a',
  },
  content: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.95)' : 'white',
    borderRadius: Platform.OS === 'web' ? 20 : 16,
    padding: Platform.OS === 'web' ? 32 : 24,
    margin: 20,
    shadowColor: Platform.OS === 'web' ? '#B3EBF2' : '#000',
    shadowOffset: { width: 0, height: Platform.OS === 'web' ? 4 : 2 },
    shadowOpacity: Platform.OS === 'web' ? 0.15 : 0.1,
    shadowRadius: Platform.OS === 'web' ? 12 : 8,
    elevation: Platform.OS === 'web' ? 6 : 3,
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: Platform.OS === 'web' ? 'rgba(179, 235, 242, 0.3)' : 'transparent',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Platform.OS === 'web' ? '#424242' : '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Platform.OS === 'web' ? '#757575' : '#666',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Platform.OS === 'web' ? '#757575' : '#666',
    marginTop: 16,
  },
  loginButton: {
    backgroundColor: Platform.OS === 'web' ? '#FDC5DC' : '#2c5aa0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Platform.OS === 'web' ? '#424242' : '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Platform.OS === 'web' ? '#757575' : '#666',
  },
  logoutButton: {
    backgroundColor: Platform.OS === 'web' ? '#ffb6c1' : '#ff6b6b',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: Platform.OS === 'web' ? '#757575' : '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  medicinesList: {
    marginTop: 16,
  },
  medicineItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Platform.OS === 'web' ? '#f0f8ff' : '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: Platform.OS === 'web' ? 'rgba(179, 235, 242, 0.3)' : 'transparent',
  },
  medicineName: {
    fontSize: 16,
    color: Platform.OS === 'web' ? '#424242' : '#333',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Platform.OS === 'web' ? '#2c5aa0' : '#2c5aa0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  // New styles for web layout
  webContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'transparent',
  },
  webHeader: {
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  webHeaderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
  },
  webHeaderSubtitle: {
    fontSize: 16,
    color: '#757575',
  },
  webContentGrid: {
    marginTop: 20,
    gap: 20,
  },
  webProfileSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#B3EBF2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(179, 235, 242, 0.3)',
  },
  webProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  webAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2c5aa0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  webAvatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  webUserInfo: {
    flex: 1,
  },
  webUserName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 4,
  },
  webUserEmail: {
    fontSize: 14,
    color: '#757575',
  },
  webProfileActions: {
    alignItems: 'center',
  },
  webLogoutButton: {
    backgroundColor: '#ffb6c1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  webLogoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webMedicinesSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#B3EBF2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(179, 235, 242, 0.3)',
  },
  webSectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 16,
    textAlign: 'center',
  },
  webEmptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  webEmptyIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  webEmptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
  },
  webEmptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  webMedicinesList: {
    marginTop: 16,
  },
  webMedicineItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(179, 235, 242, 0.3)',
  },
  webMedicineName: {
    fontSize: 16,
    color: '#424242',
  },
}); 