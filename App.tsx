// App.tsx
import React from 'react';
import { Button, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { db } from "./src/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import HomeScreen from "./src/screens/HomeScreen";
import CreateMurmurScreen from "./src/screens/CreateMurmurScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import TimelineScreen from "./src/screens/TimelineScreen";
import MyProfileScreen from "./src/screens/MyProfileScreen";
import UserProfileScreen from "./src/screens/UserProfileScreen";



type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Home: undefined;
  CreateMurmur: undefined;
  Profile: undefined;
  UserProfile: undefined;
};



const Stack = createNativeStackNavigator<RootStackParamList>();



export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: "Sign In" }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: "Sign Up" }} />
        <Stack.Screen name="Home" component={TimelineScreen} options={{ title: 'Timeline' }} />
        <Stack.Screen name="CreateMurmur" component={CreateMurmurScreen} options={{ title: "Create Murmur" }} />
        <Stack.Screen name="Profile" component={MyProfileScreen} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}