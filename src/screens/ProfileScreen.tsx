import React from 'react';
import { Button, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18 }}>My Profile (placeholder)</Text>
      <Text>We'll load user info from Firebase in a later lesson.</Text>
    </View>
  );
}