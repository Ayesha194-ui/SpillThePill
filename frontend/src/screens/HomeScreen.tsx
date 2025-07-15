import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

const HomeScreen = ({ navigation }: any) => {
  const [medicine, setMedicine] = useState('');
  const [language, setLanguage] = useState('English');

  const handleSearch = () => {
    navigation.navigate('ResultScreen', { medicine, language });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Medicine Name</Text>
      <TextInput
        style={styles.input}
        value={medicine}
        onChangeText={setMedicine}
        placeholder="Enter medicine name"
      />
      <Text style={styles.label}>Language</Text>
      {/* Placeholder for language dropdown/segmented control */}
      <View style={styles.dropdownPlaceholder}>
        <Text>{language}</Text>
      </View>
      <Button title="Search" onPress={handleSearch} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  label: { fontSize: 16, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 16 },
  dropdownPlaceholder: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 16 },
});

export default HomeScreen; 