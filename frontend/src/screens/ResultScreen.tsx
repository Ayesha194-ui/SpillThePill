import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Platform, Alert, Clipboard } from 'react-native';
import { Text, ActivityIndicator, Snackbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ResultScreen({ route, navigation }: any) {
  const { medicineName, model, language } = route.params;
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [saveButtonState, setSaveButtonState] = useState<'default' | 'saved'>('default');
  const [feedbackStats, setFeedbackStats] = useState({ likes: 100, dislikes: 55 });
  const [userFeedback, setUserFeedback] = useState<'like' | 'dislike' | null>(null);

  useEffect(() => {
    fetchResult();
  }, []);

  useEffect(() => {
    // Load feedback from storage
    const key = `feedback_${medicineName}`;
    if (Platform.OS === 'web') {
      const stored = localStorage.getItem(key);
      if (stored) setUserFeedback(stored as 'like' | 'dislike');
    } else {
      AsyncStorage.getItem(key).then(stored => {
        if (stored) setUserFeedback(stored as 'like' | 'dislike');
      });
    }
  }, [medicineName]);

  const fetchResult = async () => {
    setLoading(true);
    setError('');
    try {
      let endpoint = `/api/drugs/simplify/${encodeURIComponent(medicineName.trim())}?model=${model}`;
      if (language) {
        endpoint += `&language=${language}`;
      }
      
      const res = await fetch(`http://localhost:5050${endpoint}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Unknown error');
      }
      const data = await res.json();
      setResult(data.simplified);
      // Save to recently viewed
      saveRecentlyViewed(medicineName.trim());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch result');
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Save recently viewed medicine
  const saveRecentlyViewed = async (name: string) => {
    try {
      let items: string[] = [];
      if (Platform.OS === 'web') {
        const raw = localStorage.getItem('recentlyViewed');
        items = raw ? JSON.parse(raw) : [];
      } else {
        const raw = await AsyncStorage.getItem('recentlyViewed');
        items = raw ? JSON.parse(raw) : [];
      }
      // Remove if already exists
      items = items.filter((item) => item.toLowerCase() !== name.toLowerCase());
      // Add to top
      items.unshift(name);
      // Limit to 10
      if (items.length > 10) items = items.slice(0, 10);
      if (Platform.OS === 'web') {
        localStorage.setItem('recentlyViewed', JSON.stringify(items));
      } else {
        await AsyncStorage.setItem('recentlyViewed', JSON.stringify(items));
      }
    } catch (e) {
      // Ignore errors for now
    }
  };

  // Save current medicine to Saved Medicines
  const saveToSavedMedicines = async (name: string) => {
    if (saveButtonState === 'saved') return; // Prevent duplicate saves
    try {
      let items: string[] = [];
      if (Platform.OS === 'web') {
        const raw = localStorage.getItem('savedMedicines') || '[]';
        items = JSON.parse(raw);
      } else {
        const raw = await AsyncStorage.getItem('savedMedicines');
        items = raw ? JSON.parse(raw) : [];
      }
      // Remove if already exists
      items = items.filter((item) => item.toLowerCase() !== name.toLowerCase());
      // Add to top
      items.unshift(name);
      // Limit to 20
      if (items.length > 20) items = items.slice(0, 20);
      if (Platform.OS === 'web') {
        localStorage.setItem('savedMedicines', JSON.stringify(items));
      } else {
        await AsyncStorage.setItem('savedMedicines', JSON.stringify(items));
      }
      setShowSnackbar(true);
      setSaveButtonState('saved');
      setTimeout(() => setSaveButtonState('default'), 2000);
    } catch (e) {
      // Ignore errors for now
    }
  };

  const handleNewSearch = () => {
    navigation.goBack();
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    if (userFeedback) return;
    setUserFeedback(type);
    setFeedbackStats(prev =>
      type === 'like'
        ? { ...prev, likes: prev.likes + 1 }
        : { ...prev, dislikes: prev.dislikes + 1 }
    );
    const key = `feedback_${medicineName}`;
    if (Platform.OS === 'web') {
      localStorage.setItem(key, type);
    } else {
      AsyncStorage.setItem(key, type);
    }
  };

  // Share/Compare/Reminder handlers (mock)
  const handleShare = () => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(result || medicineName);
      window.alert('Result copied to clipboard.');
    } else {
      Clipboard.setString(result || medicineName);
      Alert.alert('Copied!', 'Result copied to clipboard.');
    }
  };
  const handleCompare = () => {
    if (Platform.OS === 'web') {
      window.alert('Added to compare (mock).');
    } else {
      Alert.alert('Compare', 'Added to compare (mock).');
    }
  };
  const handleSetReminder = () => {
    if (Platform.OS === 'web') {
      window.alert('Reminder set (mock).');
    } else {
      Alert.alert('Set Reminder', 'Reminder set (mock).');
    }
  };

  const getLanguageDisplay = () => {
    if (!language) return null;
    const labels = {
      'es': '🇪🇸 Spanish',
      'fr': '🇫🇷 French',
      'de': '🇩🇪 German',
      'zh': '🇨🇳 Chinese',
      'ja': '🇯🇵 Japanese',
      'hi': '🇮🇳 Hindi',
      'mr': '🇮🇳 Marathi'
    };
    return labels[language as keyof typeof labels] || language;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2c5aa0" style={styles.loader} />
          <Text style={styles.loadingText}>🔍 Searching for medicine information...</Text>
          <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💊 Medicine Information</Text>
          <Text style={styles.headerSubtitle}>Your search results</Text>
        </View>

        {/* Medicine Info Card */}
        <View style={styles.medicineCard}>
          <View style={styles.medicineHeader}>
            <Text style={styles.medicineIcon}>💊</Text>
            <View style={styles.medicineInfo}>
              <Text style={styles.medicineName}>{medicineName}</Text>
              <Text style={styles.medicineModel}>
                {model === 'regular' ? '📖 Regular (Detailed)' : '✨ Simplified'}
              </Text>
            </View>
          </View>
          {language && (
            <View style={styles.translationBadge}>
              <Text style={styles.translationText}>🌍 {getLanguageDisplay()}</Text>
            </View>
          )}
        </View>

        {/* Results */}
        {result ? (
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>
              {language ? '🌍 Translated Information' : '📋 Medicine Details'}
            </Text>
            <View style={styles.resultCard}>
              <Text style={styles.resultText}>{result}</Text>
            </View>
          </View>
        ) : null}

        {/* Error */}
        {error ? (
          <View style={styles.errorSection}>
            <Text style={styles.sectionTitle}>❌ Error</Text>
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleNewSearch}>
            <Text style={styles.actionButtonIcon}>🔍</Text>
            <Text style={styles.actionButtonText}>New Search</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.secondaryButton, saveButtonState === 'saved' && { backgroundColor: '#e8f5e8', borderColor: '#4caf50' }]}
            onPress={() => saveToSavedMedicines(medicineName.trim())}
            disabled={saveButtonState === 'saved'}
          >
            <Text style={[styles.secondaryButtonIcon, saveButtonState === 'saved' && { color: '#4caf50' }]}>💾</Text>
            <Text style={[styles.secondaryButtonText, saveButtonState === 'saved' && { color: '#4caf50' }]}>
              {saveButtonState === 'saved' ? 'Saved! ✓' : 'Save Result'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleSetReminder}>
              <Text style={styles.quickActionIcon}>📅</Text>
              <Text style={styles.quickActionText}>Set Reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleCompare}>
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionText}>Compare</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleShare}>
              <Text style={styles.quickActionIcon}>📤</Text>
              <Text style={styles.quickActionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feedback Section */}
        <View style={styles.feedbackSection}>
          <Text style={styles.sectionTitle}>Was this helpful?</Text>
          {userFeedback ? (
            <View style={styles.feedbackStatsRow}>
              <Text style={styles.feedbackStat}>👍 {feedbackStats.likes}</Text>
              <Text style={styles.feedbackStat}>👎 {feedbackStats.dislikes}</Text>
            </View>
          ) : (
            <View style={styles.feedbackButtonsRow}>
              <TouchableOpacity style={styles.feedbackButton} onPress={() => handleFeedback('like')}>
                <Text style={styles.feedbackIcon}>👍</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.feedbackButton} onPress={() => handleFeedback('dislike')}>
                <Text style={styles.feedbackIcon}>👎</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
        style={[styles.snackbar, { backgroundColor: '#4caf50' }]}
      >
        Saved to Saved Medicines!
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff', // Light blue pastel background
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    backgroundColor: '#e6f3ff', // Slightly darker pastel blue
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#5a7c9a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loader: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#2c5aa0',
    fontWeight: '600',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
  },
  medicineCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  medicineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicineIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  medicineModel: {
    fontSize: 14,
    color: '#666',
  },
  translationBadge: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 8,
    alignSelf: 'flex-start',
  },
  translationText: {
    fontSize: 12,
    color: '#2d5a2d',
    fontWeight: '500',
  },
  resultSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c5aa0',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  errorSection: {
    padding: 20,
    paddingTop: 0,
  },
  errorCard: {
    backgroundColor: '#ffebee',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
  },
  actionSection: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#2c5aa0',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2c5aa0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#2c5aa0',
  },
  secondaryButtonText: {
    color: '#2c5aa0',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
  },
  feedbackSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  feedbackButtonsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  feedbackButton: {
    backgroundColor: '#e3f2fd',
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 16,
  },
  feedbackIcon: {
    fontSize: 28,
  },
  feedbackStatsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  feedbackStat: {
    fontSize: 18,
    marginHorizontal: 16,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  snackbar: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    zIndex: 100,
  },
}); 