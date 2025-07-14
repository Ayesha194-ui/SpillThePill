import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const sections = [
  { title: 'Use', content: 'Placeholder for use information.' },
  { title: 'Dose', content: 'Placeholder for dose information.' },
  { title: 'Warnings', content: 'Placeholder for warnings.' },
  { title: 'Side Effects', content: 'Placeholder for side effects.' },
];

const ResultScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {sections.map((section) => (
        <View key={section.title} style={styles.card}>
          <Text style={styles.title}>{section.title}</Text>
          <Text>{section.content}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
});

export default ResultScreen; 