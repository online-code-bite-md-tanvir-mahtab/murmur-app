// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  RefreshControl,
  StatusBar,
  Alert
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db, auth } from "../firebase";

// Define your navigation types
type Props = NativeStackScreenProps<any, "Home">;

// Define the shape of your data
interface MurmurPost {
  id: string;
  text: string;
  authorName: string;
  createdAt: any; // Firestore Timestamp
}

export default function HomeScreen({ navigation }: Props) {
  const [murmurs, setMurmurs] = useState<MurmurPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch data (simulating a real feed)
  const fetchMurmurs = async () => {
    try {
      // In a real interview, showing you know how to query is better than just 'getAll'
      const q = query(
        collection(db, "murmurs"),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedMurmurs: MurmurPost[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MurmurPost[];

      setMurmurs(fetchedMurmurs);
    } catch (error) {
      console.log("Error fetching murmurs:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMurmurs();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchMurmurs();
  }, []);

  // Render a single post item
  const renderItem = ({ item }: { item: MurmurPost }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarPlaceholder} />
        <View>
          <Text style={styles.authorName}>{item.authorName || "Anonymous"}</Text>
          <Text style={styles.timestamp}>
            {item.createdAt?.seconds 
              ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() 
              : "Just now"}
          </Text>
        </View>
      </View>
      <Text style={styles.postText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Murmur</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
           {/* Profile Avatar (Top Right) */}
          <Image
            source={{ uri: auth.currentUser?.photoURL || "https://ui-avatars.com/api/?name=User" }}
            style={styles.headerAvatar}
          />
        </TouchableOpacity>
      </View>

      {/* The Feed */}
      <FlatList
        data={murmurs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>It's quiet here...</Text>
            <Text style={styles.emptySubText}>Be the first to murmur something.</Text>
          </View>
        }
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreateMurmur")}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6", // Light gray background for contrast
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#4F46E5", // Brand color
    letterSpacing: -0.5,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    // Subtle shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E7FF", // Light indigo
    marginRight: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  timestamp: {
    fontSize: 12,
    color: "#6B7280",
  },
  postText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#374151",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 32,
    color: "#fff",
    marginTop: -4, // Optical adjustment for the plus sign
  },
});