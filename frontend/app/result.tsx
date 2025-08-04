import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ResultScreen from '../src/screens/ResultScreen';

export default function ResultPage() {
  const params = useLocalSearchParams();
  
  return (
    <ResultScreen 
      medicineName={params.medicineName as string}
      model={params.model as string}
      language={params.language as string}
    />
  );
} 