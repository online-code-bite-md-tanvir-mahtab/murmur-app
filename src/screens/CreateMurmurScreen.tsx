// src/screens/CreateMurmurScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { db, auth } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function CreateMurmurScreen({ navigation }: any) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePost() {
    if (!text.trim()) {
      alert("Please write something.");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "murmurs"), {
        text,
        authorId: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
        likeCount: 0,
      });

      alert("Murmur posted!");
      setText("");
      navigation.goBack();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Write a new Murmur</Text>

      <TextInput
        style={styles.input}
        multiline
        placeholder="What's on your mind?"
        value={text}
        onChangeText={setText}
      />

      <Button title={loading ? "Posting..." : "Post Murmur"} onPress={handlePost} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
  },
  input: {
    height: 120,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    textAlignVertical: "top",
  },
});
