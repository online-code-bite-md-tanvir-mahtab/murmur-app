// App.tsx
import React from 'react';
import { Button, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../firebase';

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Welcome to Murmur (Timeline)</Text>
      <Button title="Create Murmur" onPress={() => navigation.navigate('CreateMurmur')} />
      <View style={{ height: 12 }} />
      <Button title="My Profile" onPress={() => navigation.navigate('Profile')} />
      <Button
        title="Test Firebase"
        onPress={async () => {
          try {
            await addDoc(collection(db, "testCollection"), {
              message: "Hello Firebase!",
              createdAt: serverTimestamp(),
            });
            alert("Data saved to Firebase!");
          } catch (error) {
            console.log(error);
            alert("Firebase error, check console.");
          }
        }}
      />

    </View>
  );
}