// src/screens/SignInScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function SignInScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace("Home"); 
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Sign In</Text>

      <Text>Email</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Text>Password</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={handleLogin} />

      <View style={{ height: 20 }} />

      <Button title="Create an account" onPress={() => navigation.navigate("SignUp")} />
    </View>
  );
}
