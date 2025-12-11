// src/screens/PostDetailScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { addReply, getReplies } from "../services/replyService";
import { auth } from "../firebase";

// Types
interface Author {
  uid: string;
  fullName: string;
  photoURL?: string;
}

interface Reply {
  id: string;
  text: string;
  authorId: string;
  createdAt: any;
  author: Author;
}

type Props = NativeStackScreenProps<any, "PostDetail">;

export default function PostDetailScreen({ route, navigation }: Props) {
  // The "Lazy" fix
const { murmurItem } = route.params as any;

  const [replies, setReplies] = useState<Reply[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadReplies();
  }, []);

  const loadReplies = async () => {
    try {
      const data = await getReplies(murmurItem.id);
      setReplies(data as Reply[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!inputText.trim()) return;
    setSending(true);
    try {
      await addReply(murmurItem.id, inputText.trim());
      setInputText("");
      await loadReplies(); // Refresh list
    } catch (error) {
      console.error("Failed to reply", error);
    } finally {
      setSending(false);
    }
  };

  // Helper to safely format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Just now";
    // Handle Firestore Timestamp vs serialized object
    const seconds = timestamp.seconds || timestamp._seconds; 
    if (seconds) return new Date(seconds * 1000).toLocaleDateString();
    return "Just now";
  };

  const HeaderComponent = () => (
    <View style={styles.originalPostContainer}>
      <View style={styles.userInfoHeader}>
        <Image
          source={{ uri: murmurItem.author.photoURL || `https://ui-avatars.com/api/?name=${murmurItem.author.fullName}` }}
          style={styles.avatarBig}
        />
        <View>
          <Text style={styles.authorNameBig}>{murmurItem.author.fullName}</Text>
          <Text style={styles.timestamp}>{formatDate(murmurItem.createdAt)}</Text>
        </View>
      </View>
      <Text style={styles.postTextBig}>{murmurItem.text}</Text>
      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Replies</Text>
    </View>
  );

  const renderReply = ({ item }: { item: Reply }) => (
    <View style={styles.replyCard}>
      <Image
        source={{ uri: item.author.photoURL || `https://ui-avatars.com/api/?name=${item.author.fullName}` }}
        style={styles.avatarSmall}
      />
      <View style={styles.replyContent}>
        <View style={styles.replyHeader}>
          <Text style={styles.replyAuthor}>{item.author.fullName}</Text>
          <Text style={styles.replyTime}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text style={styles.replyText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thread</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <FlatList
        data={replies}
        renderItem={renderReply}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={HeaderComponent}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>Be the first to reply...</Text> : <ActivityIndicator style={{ marginTop: 20 }} color="#4F46E5" />
        }
      />

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // Adjustment for headers
        style={styles.inputWrapper}
      >
        <View style={styles.inputContainer}>
          <Image 
            source={{ uri: auth.currentUser?.photoURL || "https://ui-avatars.com/api/?name=User" }}
            style={styles.inputAvatar} 
          />
          <TextInput
            style={styles.textInput}
            placeholder="Tweet your reply"
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            disabled={!inputText.trim() || sending} 
            onPress={handleSendReply}
            style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]}
          >
            {sending ? (
                <ActivityIndicator color="#FFF" size="small" />
            ) : (
                <Text style={styles.sendButtonText}>Reply</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  headerBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6", backgroundColor: "#fff" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  backBtn: { padding: 4 },

  // Original Post
  originalPostContainer: { padding: 16 },
  userInfoHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatarBig: { width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: "#eee" },
  authorNameBig: { fontWeight: "800", fontSize: 16, color: "#111827" },
  timestamp: { color: "#6B7280", fontSize: 13 },
  postTextBig: { fontSize: 18, lineHeight: 26, color: "#111827", marginBottom: 16 },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#6B7280", marginBottom: 10 },

  // Replies
  replyCard: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, marginRight: 12, backgroundColor: "#eee" },
  replyContent: { flex: 1 },
  replyHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  replyAuthor: { fontWeight: "700", fontSize: 14, color: "#111827" },
  replyTime: { fontSize: 12, color: "#9CA3AF" },
  replyText: { fontSize: 15, color: "#374151", lineHeight: 20 },
  emptyText: { textAlign: "center", color: "#9CA3AF", marginTop: 20 },

  // Input
  inputWrapper: { borderTopWidth: 1, borderTopColor: "#E5E7EB", backgroundColor: '#fff' },
  inputContainer: { flexDirection: "row", alignItems: "center", padding: 12, paddingBottom: Platform.OS === 'ios' ? 24 : 12 },
  inputAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10, backgroundColor: "#eee" },
  textInput: { flex: 1, maxHeight: 100, fontSize: 16, color: "#111827", paddingVertical: 8 },
  sendButton: { backgroundColor: "#4F46E5", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginLeft: 10 },
  sendButtonText: { color: "#FFF", fontWeight: "600", fontSize: 14 },
});