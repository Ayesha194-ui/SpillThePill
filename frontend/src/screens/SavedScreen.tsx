import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebNavigation from '../components/WebNavigation';
import { useAuth } from '../contexts/AuthContext';

// Import web enhancements only on web platform
if (Platform.OS === 'web') {
  require('../styles/web-enhancements.css');
}

interface SavedMedicine {
  name: string;
  savedAt: string;
  model?: string;
  language?: string;
}

export default function SavedScreen() {
  const router = useRouter();
  const { isAuthenticated, getSavedMedicines, removeSavedMedicine } = useAuth();
  const [savedMedicines, setSavedMedicines] = useState<SavedMedicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Load saved medicines on mount and when screen is focused
  const loadSavedMedicines = async () => {
    try {
      if (!isAuthenticated) {
        setSavedMedicines([]);
        setIsLoading(false);
        return;
      }
      
      const items = await getSavedMedicines();
      
      // Convert to SavedMedicine objects with timestamps
      const savedMedicinesData: SavedMedicine[] = items.map((name, index) => ({
        name,
        savedAt: new Date(Date.now() - index * 60000).toISOString(), // Mock timestamps
        model: 'simplified', // Default model
        language: 'English', // Default language
      }));
      
      setSavedMedicines(savedMedicinesData);
    } catch (e) {
      setSavedMedicines([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSavedMedicines();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadSavedMedicines();
    }, [])
  );

  const filteredMedicines = savedMedicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMedicinePress = (medicine: SavedMedicine) => {
    router.push({
      pathname: '/result',
      params: {
        medicineName: medicine.name,
        model: medicine.model || 'simplified',
        language: medicine.language || 'English',
      },
    });
  };

  const handleDeleteMedicine = async (medicineName: string) => {
    try {
      await removeSavedMedicine(medicineName);
      loadSavedMedicines();
    } catch (e) {
      console.error('Error deleting medicine:', e);
      Alert.alert('Error', 'Failed to delete medicine. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Delete ${selectedItems.length} selected items?`);
      if (!confirmed) return;
    } else {
      Alert.alert(
        'Delete Items',
        `Delete ${selectedItems.length} selected items?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performBulkDelete },
        ]
      );
      return;
    }
    performBulkDelete();
  };

  const performBulkDelete = async () => {
    try {
      for (const medicineName of selectedItems) {
        await removeSavedMedicine(medicineName);
      }
      
      setSelectedItems([]);
      setIsSelectionMode(false);
      loadSavedMedicines();
    } catch (e) {
      console.error('Error bulk deleting medicines:', e);
      Alert.alert('Error', 'Failed to delete some medicines. Please try again.');
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedItems([]);
  };

  const toggleItemSelection = (medicineName: string) => {
    setSelectedItems(prev => 
      prev.includes(medicineName)
        ? prev.filter(item => item !== medicineName)
        : [...prev, medicineName]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>📚 Loading saved medicines...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Web Navigation */}
      <WebNavigation currentTab="saved" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header} className={Platform.OS === 'web' ? 'web-glass-card web-modern-radius' : ''}>
          <Text style={styles.headerTitle} className={Platform.OS === 'web' ? 'web-text-shadow' : ''}>
            💾 Saved Medicines
          </Text>
          <Text style={styles.headerSubtitle}>
            {savedMedicines.length} medicine{savedMedicines.length !== 1 ? 's' : ''} saved
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer} className={Platform.OS === 'web' ? 'web-glass-card web-modern-radius' : ''}>
            <Text style={styles.searchLabel}>🔍 Search Saved</Text>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search your saved medicines..."
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.actionButton}
            className={Platform.OS === 'web' ? 'web-gradient-button web-hover-effect' : ''}
            onPress={toggleSelectionMode}
          >
            <Text style={styles.actionButtonIcon}>
              {isSelectionMode ? '✕' : '☑️'}
            </Text>
            <Text style={styles.actionButtonText}>
              {isSelectionMode ? 'Cancel' : 'Select'}
            </Text>
          </TouchableOpacity>

          {isSelectionMode && selectedItems.length > 0 && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleBulkDelete}
            >
              <Text style={styles.actionButtonIcon}>🗑️</Text>
              <Text style={styles.actionButtonText}>
                Delete ({selectedItems.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Saved Medicines List */}
        {!isAuthenticated ? (
          <View style={styles.emptyContainer} className={Platform.OS === 'web' ? 'web-glass-card web-modern-radius' : ''}>
            <Text style={styles.emptyIcon}>🔐</Text>
            <Text style={styles.emptyTitle}>Sign In Required</Text>
            <Text style={styles.emptySubtitle}>
              Please sign in to view and manage your saved medicines
            </Text>
            <TouchableOpacity
              style={styles.emptyActionButton}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Text style={styles.emptyActionText}>🔐 Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : filteredMedicines.length === 0 ? (
          <View style={styles.emptyContainer} className={Platform.OS === 'web' ? 'web-glass-card web-modern-radius' : ''}>
            <Text style={styles.emptyIcon}>💾</Text>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No matches found' : 'No saved medicines yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Search for medicines and save them here for quick access'
              }
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.emptyActionButton}
                onPress={() => router.push('/')}
              >
                <Text style={styles.emptyActionText}>🔍 Start Searching</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.medicinesList}>
            {filteredMedicines.map((medicine, index) => (
              <View
                key={`${medicine.name}-${index}`}
                style={[
                  styles.medicineCard,
                  selectedItems.includes(medicine.name) && styles.selectedCard
                ]}
                className={Platform.OS === 'web' ? 'web-glass-card web-modern-radius web-hover-effect' : ''}
              >
                <TouchableOpacity
                  style={styles.medicineContent}
                  onPress={() => isSelectionMode 
                    ? toggleItemSelection(medicine.name)
                    : handleMedicinePress(medicine)
                  }
                  onLongPress={() => {
                    if (!isSelectionMode) {
                      setIsSelectionMode(true);
                      setSelectedItems([medicine.name]);
                    }
                  }}
                >
                  <View style={styles.medicineHeader}>
                    <Text style={styles.medicineIcon}>💊</Text>
                    <View style={styles.medicineInfo}>
                      <Text style={styles.medicineName}>{medicine.name}</Text>
                      <Text style={styles.medicineDetails}>
                        {medicine.model} • {medicine.language} • {formatDate(medicine.savedAt)}
                      </Text>
                    </View>
                    {isSelectionMode && (
                      <View style={[
                        styles.selectionIndicator,
                        selectedItems.includes(medicine.name) && styles.selectedIndicator
                      ]}>
                        <Text style={styles.selectionText}>
                          {selectedItems.includes(medicine.name) ? '✓' : ''}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                {!isSelectionMode && (
                  <View style={styles.medicineActions}>
                    <TouchableOpacity
                      style={styles.actionIconButton}
                      onPress={() => handleMedicinePress(medicine)}
                    >
                      <Text style={styles.actionIcon}>👁️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionIconButton}
                      onPress={() => handleDeleteMedicine(medicine.name)}
                    >
                      <Text style={styles.actionIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
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
    color: Platform.OS === 'web' ? '#1a1a1a' : '#2c5aa0',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: Platform.OS === 'web' ? '#666' : '#5a7c9a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    color: '#2c5aa0',
    fontWeight: '600',
  },
  searchSection: {
    padding: 20,
    paddingTop: 10,
  },
  searchContainer: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.95)' : 'white',
    borderRadius: Platform.OS === 'web' ? 20 : 16,
    padding: Platform.OS === 'web' ? 24 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: Platform.OS === 'web' ? 4 : 2 },
    shadowOpacity: Platform.OS === 'web' ? 0.15 : 0.1,
    shadowRadius: Platform.OS === 'web' ? 12 : 8,
    elevation: Platform.OS === 'web' ? 6 : 3,
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
  },
  searchLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c5aa0',
    marginBottom: 12,
  },
  searchInput: {
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  actionSection: {
    padding: 20,
    paddingTop: 10,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? 'transparent' : '#2c5aa0',
    borderRadius: Platform.OS === 'web' ? 20 : 16,
    padding: Platform.OS === 'web' ? 20 : 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: Platform.OS === 'web' ? 6 : 4 },
    shadowOpacity: Platform.OS === 'web' ? 0.3 : 0.2,
    shadowRadius: Platform.OS === 'web' ? 12 : 8,
    elevation: Platform.OS === 'web' ? 8 : 4,
    borderWidth: Platform.OS === 'web' ? 2 : 0,
    borderColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
  },
  deleteButton: {
    backgroundColor: Platform.OS === 'web' ? 'transparent' : '#dc3545',
    borderColor: Platform.OS === 'web' ? 'rgba(220, 53, 69, 0.3)' : 'transparent',
  },
  actionButtonIcon: {
    fontSize: 18,
    marginRight: 8,
    color: 'white',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.95)' : 'white',
    borderRadius: Platform.OS === 'web' ? 20 : 16,
    padding: 40,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: Platform.OS === 'web' ? 4 : 2 },
    shadowOpacity: Platform.OS === 'web' ? 0.15 : 0.1,
    shadowRadius: Platform.OS === 'web' ? 12 : 8,
    elevation: Platform.OS === 'web' ? 6 : 3,
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyActionButton: {
    backgroundColor: '#2c5aa0',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  emptyActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  medicinesList: {
    padding: 20,
    paddingTop: 10,
  },
  medicineCard: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.95)' : 'white',
    borderRadius: Platform.OS === 'web' ? 20 : 16,
    padding: Platform.OS === 'web' ? 24 : 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: Platform.OS === 'web' ? 4 : 2 },
    shadowOpacity: Platform.OS === 'web' ? 0.15 : 0.1,
    shadowRadius: Platform.OS === 'web' ? 12 : 8,
    elevation: Platform.OS === 'web' ? 6 : 3,
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
  },
  selectedCard: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(179, 235, 242, 0.1)' : '#e6f3ff',
    borderColor: Platform.OS === 'web' ? '#FDC5DC' : '#2c5aa0',
    borderWidth: 2,
  },
  medicineContent: {
    flex: 1,
  },
  medicineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicineIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  medicineDetails: {
    fontSize: 14,
    color: '#666',
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  selectedIndicator: {
    backgroundColor: '#2c5aa0',
    borderColor: '#2c5aa0',
  },
  selectionText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  medicineActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  actionIconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  actionIcon: {
    fontSize: 16,
  },
}); 