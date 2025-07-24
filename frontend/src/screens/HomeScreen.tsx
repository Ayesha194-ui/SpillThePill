import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Modal,
  ScrollView as RNScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

function ScrollContainer({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'web') {
    return (
      <div style={{
        height: '100vh',
        width: '100%',
        overflowY: 'auto',
        background: '#f0f8ff',
      }}>
        {children}
      </div>
    );
  }
  return (
    <RNScrollView
      style={styles.scrollView}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={true}
      keyboardShouldPersistTaps='handled'
    >
      {children}
    </RNScrollView>
  );
}

// Modal Components
const BrowseMedicinesModal = ({ visible, onClose, onMedicineSelect }: { 
  visible: boolean; 
  onClose: () => void;
  onMedicineSelect: (medicine: string) => void;
}) => {
  const mockMedicines = [
    'Ibuprofen', 'Paracetamol', 'Aspirin', 'Amoxicillin', 'Omeprazole',
    'Metformin', 'Lisinopril', 'Atorvastatin', 'Amlodipine', 'Losartan'
  ];

  const handleMedicineSelect = (medicine: string) => {
    onMedicineSelect(medicine);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>💊 Browse Medicines</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <RNScrollView style={styles.modalScrollView}>
            <Text style={styles.modalSubtitle}>Popular medicines you can search:</Text>
            {mockMedicines.map((medicine, index) => (
              <TouchableOpacity
                key={index}
                style={styles.clickableMedicineItem}
                onPress={() => handleMedicineSelect(medicine)}
              >
                <Text style={styles.medicineItemText}>💊 {medicine}</Text>
                <Text style={styles.medicineItemHint}>Tap to search</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.modalTip}>💡 Tip: Tap any medicine above to search for detailed information!</Text>
          </RNScrollView>
        </View>
      </View>
    </Modal>
  );
};

const ByConditionModal = ({ visible, onClose, onMedicineSelect }: { 
  visible: boolean; 
  onClose: () => void;
  onMedicineSelect: (medicine: string) => void;
}) => {
  const conditions = [
    { name: 'Fever', medicines: ['Paracetamol', 'Ibuprofen'] },
    { name: 'Pain', medicines: ['Ibuprofen', 'Aspirin', 'Paracetamol'] },
    { name: 'Infection', medicines: ['Amoxicillin', 'Azithromycin'] },
    { name: 'Heartburn', medicines: ['Omeprazole', 'Ranitidine'] },
    { name: 'Diabetes', medicines: ['Metformin', 'Insulin'] },
    { name: 'High Blood Pressure', medicines: ['Lisinopril', 'Amlodipine'] },
  ];

  const handleMedicineSelect = (medicine: string) => {
    onMedicineSelect(medicine);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🏥 Search by Condition</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <RNScrollView style={styles.modalScrollView}>
            <Text style={styles.modalSubtitle}>Common conditions and their medicines:</Text>
            {conditions.map((condition, index) => (
              <View key={index} style={styles.conditionItem}>
                <Text style={styles.conditionName}>{condition.name}</Text>
                <View style={styles.medicinesList}>
                  {condition.medicines.map((medicine, medIndex) => (
                    <TouchableOpacity
                      key={medIndex}
                      style={styles.clickableMedicineButton}
                      onPress={() => handleMedicineSelect(medicine)}
                    >
                      <Text style={styles.medicineButtonText}>💊 {medicine}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
            <Text style={styles.modalTip}>💡 Tip: Tap any medicine above to search for detailed information!</Text>
          </RNScrollView>
        </View>
      </View>
    </Modal>
  );
};

const LearnAboutPillsModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const tips = [
    'Always read the label and follow dosage instructions',
    'Take medicines with food if recommended',
    'Store medicines in a cool, dry place',
    'Never share prescription medicines',
    'Check expiration dates regularly',
    'Ask your doctor about drug interactions',
    'Keep a list of all your medicines',
    'Don&apos;t stop taking medicine without consulting your doctor'
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📚 Learn About Pills</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <RNScrollView style={styles.modalScrollView}>
            <Text style={styles.modalSubtitle}>Important safety tips:</Text>
            {tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.modalTipText}>• {tip}</Text>
              </View>
            ))}
            <Text style={styles.modalTip}>💡 Remember: Always consult healthcare professionals for medical advice!</Text>
          </RNScrollView>
        </View>
      </View>
    </Modal>
  );
};

const AskPillBotModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🤖 Ask PillBot</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.modalSubtitle}>Coming Soon! 🚀</Text>
            <Text style={styles.modalText}>
              Our AI chatbot is being trained to answer all your medicine questions!
            </Text>
            <Text style={styles.modalText}>
              For now, use the search above to get detailed information about any medicine.
            </Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>AI Assistant</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const [medicineName, setMedicineName] = useState('');
  const [selectedModel, setSelectedModel] = useState<'regular' | 'simplified'>('simplified');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [savedMedicines, setSavedMedicines] = useState<string[]>([]);
  
  // Modal states
  const [browseModalVisible, setBrowseModalVisible] = useState(false);
  const [conditionModalVisible, setConditionModalVisible] = useState(false);
  const [learnModalVisible, setLearnModalVisible] = useState(false);
  const [pillBotModalVisible, setPillBotModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = useRef(null);

  // Load recently viewed on mount and when screen is focused
  const loadRecentlyViewed = async () => {
    try {
      let items: string[] = [];
      if (Platform.OS === 'web') {
        const raw = localStorage.getItem('recentlyViewed') || '[]';
        items = JSON.parse(raw);
      } else {
        const raw = await AsyncStorage.getItem('recentlyViewed');
        items = raw ? JSON.parse(raw) : [];
      }
      setRecentlyViewed(items);
    } catch (e) {
      setRecentlyViewed([]);
    }
  };

  const loadSavedMedicines = async () => {
    try {
      let items: string[] = [];
      if (Platform.OS === 'web') {
        const raw = localStorage.getItem('savedMedicines') || '[]';
        items = JSON.parse(raw);
      } else {
        const raw = await AsyncStorage.getItem('savedMedicines');
        items = raw ? JSON.parse(raw) : [];
      }
      setSavedMedicines(items);
    } catch (e) {
      setSavedMedicines([]);
    }
  };

  useEffect(() => {
    loadRecentlyViewed();
    loadSavedMedicines();
  }, []);

  // Reload when HomeScreen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadRecentlyViewed();
      loadSavedMedicines();
    }, [])
  );

  const handleSearch = () => {
    if (medicineName.trim()) {
      navigation.navigate('ResultScreen' as any, {
        medicineName: medicineName.trim(),
        model: selectedModel,
        language: selectedLanguage,
      } as any);
    }
  };

  // New function to handle medicine selection from modals
  const handleMedicineSelect = (medicine: string) => {
    setMedicineName(medicine);
    // Auto-search after a short delay to show the user the medicine was selected
    setTimeout(() => {
      handleSearch();
    }, 500);
  };

  const showLanguagePicker = () => {
    setLanguageModalVisible(true);
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setLanguageModalVisible(false);
  };

  // Quick Access handlers
  const handleBrowseMedicines = () => setBrowseModalVisible(true);
  const handleByCondition = () => setConditionModalVisible(true);
  const handleLearnAboutPills = () => setLearnModalVisible(true);
  const handleAskPillBot = () => setChatModalVisible(true);

  const getLanguageLabel = () => {
    if (!selectedLanguage) return '🇺🇸 No translation';
    const labels = {
      'es': '🇪🇸 Spanish',
      'fr': '🇫🇷 French', 
      'de': '🇩🇪 German',
      'zh': '🇨🇳 Chinese',
      'ja': '🇯🇵 Japanese',
      'hi': '🇮🇳 Hindi',
      'mr': '🇮🇳 Marathi'
    };
    return labels[selectedLanguage as keyof typeof labels] || selectedLanguage;
  };

  const trendingMedicines = [
    { name: 'Paracetamol', info: 'Used to treat pain and fever. Commonly known as acetaminophen.' },
    { name: 'Cetirizine', info: 'An antihistamine used for allergy relief.' },
    { name: 'ORS Sachets', info: 'Oral rehydration salts for dehydration and diarrhea.' },
  ];

  const handleTrendingClick = (medicine: string) => {
    setMedicineName(medicine);
    setTimeout(() => {
      handleSearch();
    }, 500);
  };

  const tips = [
    'Always read the label and follow dosage instructions.',
    'Take medicines with food if recommended.',
    'Store medicines in a cool, dry place.',
    'Never share prescription medicines.',
    'Check expiration dates regularly.',
    'Ask your doctor about drug interactions.',
    'Keep a list of all your medicines.',
    'Don\'t stop taking medicine without consulting your doctor.',
    'Report any side effects to your healthcare provider.',
    'Drink plenty of water when taking medicines unless told otherwise.',
  ];
  const [tipOfTheDay, setTipOfTheDay] = useState('');

  useEffect(() => {
    // Pick a random tip on each app load
    setTipOfTheDay(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  const openRouterApiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatHistory((prev) => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsChatLoading(true);
    try {
      if (!openRouterApiKey) {
        setChatHistory((prev) => [...prev, { role: 'bot', text: 'No OpenRouter API key set. Please set EXPO_PUBLIC_OPENROUTER_API_KEY in your .env file.' }]);
        setIsChatLoading(false);
        return;
      }
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3-0324:free', // updated to DeepSeek
          messages: [
            { role: 'system', content: 'You are PillBot, a friendly and helpful medicine assistant. Answer questions about medicines in a simple, clear way.' },
            ...chatHistory.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
            { role: 'user', content: userMsg },
          ],
          max_tokens: 120,
        }),
      });
      const data = await response.json();
      const botMsg = data.choices?.[0]?.message?.content || 'Sorry, I could not answer that.';
      setChatHistory((prev) => [...prev, { role: 'bot', text: botMsg }]);
    } catch (e) {
      setChatHistory((prev) => [...prev, { role: 'bot', text: 'Sorry, there was an error connecting to PillBot.' }]);
    }
    setIsChatLoading(false);
  };

  const handleHistoryClick = (medicine: string) => {
    setMedicineName(medicine);
    setTimeout(() => {
      handleSearch();
    }, 500);
  };

  return (
    <ScrollContainer>
      {/* Modals */}
      <BrowseMedicinesModal 
        visible={browseModalVisible} 
        onClose={() => setBrowseModalVisible(false)}
        onMedicineSelect={handleMedicineSelect}
      />
      <ByConditionModal 
        visible={conditionModalVisible} 
        onClose={() => setConditionModalVisible(false)}
        onMedicineSelect={handleMedicineSelect}
      />
      <LearnAboutPillsModal 
        visible={learnModalVisible} 
        onClose={() => setLearnModalVisible(false)} 
      />
      <AskPillBotModal 
        visible={pillBotModalVisible} 
        onClose={() => setPillBotModalVisible(false)} 
      />

      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🌍 Select Language</Text>
              <TouchableOpacity onPress={() => setLanguageModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>Choose your preferred language:</Text>
              <View style={styles.languageGrid}>
                {[
                  { flag: '🇺🇸', name: 'English', code: 'English' },
                  { flag: '🇪🇸', name: 'Spanish', code: 'Spanish' },
                  { flag: '🇫🇷', name: 'French', code: 'French' },
                  { flag: '🇩🇪', name: 'German', code: 'German' },
                  { flag: '🇮🇹', name: 'Italian', code: 'Italian' },
                  { flag: '🇵🇹', name: 'Portuguese', code: 'Portuguese' },
                  { flag: '🇷🇺', name: 'Russian', code: 'Russian' },
                  { flag: '🇨🇳', name: 'Chinese', code: 'Chinese' },
                  { flag: '🇯🇵', name: 'Japanese', code: 'Japanese' },
                  { flag: '🇰🇷', name: 'Korean', code: 'Korean' },
                  { flag: '🇮🇳', name: 'Hindi', code: 'Hindi' },
                  { flag: '🇮🇳', name: 'Marathi', code: 'Marathi' },
                ].map((lang, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.languageOption,
                      selectedLanguage === lang.code && styles.selectedLanguageOption
                    ]}
                    onPress={() => handleLanguageSelect(lang.code)}
                  >
                    <Text style={styles.languageFlag}>{lang.flag}</Text>
                    <Text style={[
                      styles.languageName,
                      selectedLanguage === lang.code && styles.selectedLanguageName
                    ]}>
                      {lang.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <View style={styles.recentlyViewedSection}>
          <Text style={styles.sectionTitle}>📖 Recently Viewed</Text>
          <View style={styles.recentlyViewedList}>
            {recentlyViewed.map((item, idx) => (
              <TouchableOpacity
                key={item + idx}
                style={styles.recentlyViewedItem}
                onPress={() => handleHistoryClick(item)}
              >
                <Text style={styles.recentlyViewedIcon}>💊</Text>
                <Text style={styles.recentlyViewedText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Saved Medicines Section */}
      {savedMedicines.length > 0 && (
        <View style={styles.savedMedicinesSection}>
          <Text style={styles.sectionTitle}>💾 Saved Medicines</Text>
          <View style={styles.savedMedicinesList}>
            {savedMedicines.map((item, idx) => (
              <TouchableOpacity
                key={item + idx}
                style={styles.savedMedicinesItem}
                onPress={() => handleHistoryClick(item)}
              >
                <Text style={styles.savedMedicinesIcon}>💊</Text>
                <Text style={styles.savedMedicinesText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      {/* Header Section */}
      <View style={styles.header}>
          <Text style={styles.title}>💊 SpillThePill</Text>
          <Text style={styles.subtitle}>Get simplified drug information</Text>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchLabel}>🔍 Search Medicine</Text>
            <TextInput
              style={styles.searchInput}
              value={medicineName}
              onChangeText={setMedicineName}
              placeholder="Enter medicine name (e.g., Ibuprofen)"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Model Selection */}
        <View style={styles.modelSection}>
          <Text style={styles.sectionTitle}>📋 Choose Model</Text>
          <View style={styles.modelButtons}>
            <TouchableOpacity
              style={[
                styles.modelButton,
                selectedModel === 'regular' && styles.modelButtonActive
              ]}
              onPress={() => setSelectedModel('regular')}
            >
              <Text style={styles.modelButtonIcon}>📖</Text>
              <Text style={[
                styles.modelButtonText,
                selectedModel === 'regular' && styles.modelButtonTextActive
              ]}>
                Regular
              </Text>
              <Text style={styles.modelButtonSubtext}>Detailed info</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modelButton,
                selectedModel === 'simplified' && styles.modelButtonActive
              ]}
              onPress={() => setSelectedModel('simplified')}
            >
              <Text style={styles.modelButtonIcon}>✨</Text>
              <Text style={[
                styles.modelButtonText,
                selectedModel === 'simplified' && styles.modelButtonTextActive
              ]}>
                Simplified
              </Text>
              <Text style={styles.modelButtonSubtext}>Easy to understand</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Language Selection */}
        <View style={styles.languageSection}>
          <Text style={styles.sectionTitle}>🌍 Translation</Text>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={showLanguagePicker}
          >
            <Text style={styles.languageButtonText}>{getLanguageLabel()}</Text>
            <Text style={styles.languageButtonIcon}>🔽</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Access */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>⚡ Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity style={styles.quickAccessItem} onPress={handleBrowseMedicines}>
              <Text style={styles.quickAccessIcon}>💊</Text>
              <Text style={styles.quickAccessText}>Browse Medicines</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAccessItem} onPress={handleByCondition}>
              <Text style={styles.quickAccessIcon}>🩺</Text>
              <Text style={styles.quickAccessText}>By Condition</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAccessItem} onPress={handleLearnAboutPills}>
              <Text style={styles.quickAccessIcon}>🧠</Text>
              <Text style={styles.quickAccessText}>Learn About Pills</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAccessItem} onPress={handleAskPillBot}>
              <Text style={styles.quickAccessIcon}>🤖</Text>
              <Text style={styles.quickAccessText}>Ask PillBot</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trending Section */}
        <View style={styles.trendingSection}>
          <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
          <View style={styles.trendingList}>
            {trendingMedicines.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.trendingItem}
                onPress={() => handleTrendingClick(item.name)}
              >
                <Text style={styles.trendingIcon}>💊</Text>
                <Text style={styles.trendingText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tip of the Day */}
        <View style={styles.tipSection}>
          <Text style={styles.sectionTitle}>💡 Tip of the Day</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>{tipOfTheDay}</Text>
          </View>
        </View>

        {/* Search Button */}
        <TouchableOpacity 
          style={[styles.searchButton, !medicineName.trim() && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={!medicineName.trim()}
        >
          <Text style={styles.searchButtonIcon}>🔍</Text>
          <Text style={styles.searchButtonText}>Search Medicine</Text>
        </TouchableOpacity>

      {/* Chat Modal */}
      <Modal
        visible={chatModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setChatModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: 500, width: '95%' }]}> 
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🤖 Ask PillBot</Text>
              <TouchableOpacity onPress={() => setChatModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.modalBody, { height: 350 }]}> 
              <RNScrollView
                ref={chatScrollRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 10 }}
                onContentSizeChange={() => chatScrollRef.current?.scrollToEnd?.({ animated: true })}
              >
                {chatHistory.length === 0 && (
                  <Text style={{ color: '#888', fontStyle: 'italic', marginBottom: 10 }}>
                    Ask me anything about medicines!
                  </Text>
                )}
                {chatHistory.map((msg, idx) => (
                  <View key={idx} style={{ marginBottom: 10, alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                    <View style={{ backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#f0f0f0', borderRadius: 12, padding: 10 }}>
                      <Text style={{ color: '#333' }}>{msg.text}</Text>
                    </View>
                  </View>
                ))}
                {isChatLoading && (
                  <Text style={{ color: '#1976d2', fontStyle: 'italic' }}>PillBot is typing...</Text>
                )}
              </RNScrollView>
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <TextInput
                  style={{ flex: 1, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 8, marginRight: 8 }}
                  placeholder="Type your question..."
                  value={chatInput}
                  onChangeText={setChatInput}
                  editable={!isChatLoading}
                />
                <TouchableOpacity
                  style={{ backgroundColor: '#1976d2', borderRadius: 8, padding: 10, alignItems: 'center', justifyContent: 'center' }}
                  onPress={sendChatMessage}
                  disabled={isChatLoading || !chatInput.trim()}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f8ff', // Light blue pastel background
  },
  scrollView: {
    // Removed flex: 1 from here
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    backgroundColor: '#e6f3ff', // Slightly darker pastel blue
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#5a7c9a',
    textAlign: 'center',
  },
  searchSection: {
    padding: 20,
    paddingTop: 10,
  },
  searchContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  modelSection: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c5aa0',
    marginBottom: 16,
  },
  modelButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modelButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  modelButtonActive: {
    backgroundColor: '#e6f3ff',
    borderWidth: 2,
    borderColor: '#2c5aa0',
  },
  modelButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  modelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  modelButtonTextActive: {
    color: '#2c5aa0',
  },
  modelButtonSubtext: {
    fontSize: 12,
    color: '#666',
  },
  languageSection: {
    padding: 20,
    paddingTop: 10,
  },
  languageButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  languageButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  languageButtonIcon: {
    fontSize: 16,
    color: '#666',
  },
  quickAccessSection: {
    padding: 20,
    paddingTop: 10,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAccessItem: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickAccessIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickAccessText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  trendingSection: {
    padding: 20,
    paddingTop: 10,
  },
  trendingList: {
    gap: 8,
  },
  trendingItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trendingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  trendingText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  tipSection: {
    padding: 20,
    paddingTop: 10,
  },
  tipCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  tipText: {
    fontSize: 14,
    color: '#856404',
    fontStyle: 'italic',
  },
  searchButton: {
    backgroundColor: '#2c5aa0',
    borderRadius: 16,
    padding: 18,
    margin: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonDisabled: {
    backgroundColor: '#ccc',
  },
  searchButtonIcon: {
    fontSize: 20,
    marginRight: 8,
    color: 'white',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  recentlyViewedSection: {
    padding: 20,
    paddingTop: 10,
  },
  recentlyViewedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentlyViewedItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  recentlyViewedIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  recentlyViewedText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  savedMedicinesSection: {
    padding: 20,
    paddingTop: 10,
  },
  savedMedicinesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  savedMedicinesItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  savedMedicinesIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  savedMedicinesText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 0,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  modalScrollView: {
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  modalBody: {
    padding: 20,
  },
  modalTip: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 15,
    textAlign: 'center',
  },
  comingSoonBadge: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  comingSoonText: {
    color: '#1976d2',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Medicine items
  medicineItem: {
    paddingVertical: 8,
  },
  medicineItemText: {
    fontSize: 14,
    color: '#333',
  },
  medicineItemHint: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
    fontStyle: 'italic',
  },
  clickableMedicineItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },

  // Condition items
  conditionItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  conditionName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  conditionMedicines: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  medicinesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  clickableMedicineButton: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  medicineButtonText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },

  // Tip items
  tipItem: {
    paddingVertical: 8,
  },
  modalTipText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },

  // Language selection modal styles
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  languageOption: {
    width: '45%', // Adjust as needed for grid layout
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedLanguageOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
  },
  languageFlag: {
    fontSize: 24,
    marginBottom: 5,
  },
  languageName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedLanguageName: {
    color: '#1976d2',
  },
}); 