// src/screens/CreateMurmurScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Keyboard,
} from "react-native";
import { db, auth } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// Define strict types for navigation (adjust 'RootStackParamList' based on your project)
type Props = NativeStackScreenProps<any, "CreateMurmur">;

const MAX_CHARS = 280;

export default function CreateMurmurScreen({ navigation }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [charsLeft, setCharsLeft] = useState(MAX_CHARS);

  // Update character count
  useEffect(() => {
    setCharsLeft(MAX_CHARS - text.length);
  }, [text]);

  async function handlePost() {
    if (!text.trim()) return;

    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to post.");
      return;
    }

    try {
      setLoading(true);
      Keyboard.dismiss();

      await addDoc(collection(db, "murmurs"), {
        text: text.trim(),
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || "Anonymous", // Good practice to store denormalized data
        createdAt: serverTimestamp(),
        likeCount: 0,
      });

      setText("");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Post Failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  const isPostDisabled = !text.trim() || loading || charsLeft < 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.postButton, isPostDisabled && styles.postButtonDisabled]}
            onPress={handlePost}
            disabled={isPostDisabled}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.postButtonText}>Murmur</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View style={styles.inputContainer}>
          <View style={styles.avatarContainer}>
             {/* Placeholder for user avatar - interviewers love seeing attention to profile logic */}
            <Image 
              source={{ uri: auth.currentUser?.photoURL || "https://ui-avatars.com/api/?name=User" }} 
              style={styles.avatar} 
            />
          </View>
          
          <TextInput
            style={styles.input}
            multiline
            autoFocus
            placeholder="What's happening?"
            placeholderTextColor="#999"
            value={text}
            onChangeText={setText}
            maxLength={MAX_CHARS}
          />
        </View>

        {/* Footer / Tools */}
        <View style={styles.footer}>
          <Text style={[styles.charCount, charsLeft < 20 && styles.charCountWarning]}>
            {charsLeft}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  cancelText: {
    fontSize: 16,
    color: "#333",
  },
  postButton: {
    backgroundColor: "#4F46E5", // Modern Indigo color
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  postButtonDisabled: {
    backgroundColor: "#A5A6F6", // Lighter shade for disabled state
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    marginTop: 20,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e1e1e1",
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: "#1f2937",
    textAlignVertical: "top",
    // Height is handled by flex: 1 so it takes remaining space
  },
  footer: {
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#eee",
    alignItems: "flex-end",
  },
  charCount: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: '500'
  },
  charCountWarning: {
    color: "#EF4444", // Red warning when running low
  },
});