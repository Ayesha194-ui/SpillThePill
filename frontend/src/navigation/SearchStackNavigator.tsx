import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import ResultScreen from '../screens/ResultScreen';

const Stack = createNativeStackNavigator();

const SearchStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Search' }} />
    <Stack.Screen name="ResultScreen" component={ResultScreen} options={{ title: 'Results' }} />
  </Stack.Navigator>
);

export default SearchStackNavigator; 