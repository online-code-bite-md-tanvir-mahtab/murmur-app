import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  StatusBar,
} from "react-native";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { toggleLike } from "../services/likeService";
import { getUserProfile } from "../services/userService"; 
import { Ionicons } from "@expo/vector-icons"; 
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<any, "Timeline">;

// Data Types
interface Author {
  uid: string;
  fullName: string; // Component expects 'fullName'
  email: string;
  photoURL?: string;
}

interface Murmur {
  id: string;
  text: string;
  authorId: string;
  createdAt: any;
  likeCount: number;
  author: Author;
}

// --- Sub-Component: Post Card ---
const MurmurCard = ({ item, navigation, onDelete }: { item: Murmur; navigation: any; onDelete: (id: string) => void }) => {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(item.likeCount);
  const isMyPost = item.authorId === auth.currentUser?.uid;

  const handleLike = async () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    setCount((prev) => (newLikedState ? prev + 1 : prev - 1));

    try {
      await toggleLike(item.id);
    } catch (error) {
      setLiked(!newLikedState);
      setCount((prev) => (newLikedState ? prev - 1 : prev + 1));
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(item.id) },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => navigation.navigate("UserProfile", { userId: item.authorId })} // Ensure UserProfile screen exists if used
        >
          <Image
            source={{ uri: item.author.photoURL || `https://ui-avatars.com/api/?name=${item.author.fullName}&background=random` }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.authorName}>{item.author.fullName}</Text>
            <Text style={styles.timestamp}>
              {item.createdAt?.seconds 
                ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() 
                : "Just now"}
            </Text>
          </View>
        </TouchableOpacity>

        {isMyPost && (
          <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.postText}>{item.text}</Text>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={24}
            color={liked ? "#E11D48" : "#6B7280"}
          />
          <Text style={[styles.actionText, liked && styles.activeActionText]}>
            {count}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={22} color="#6B7280" />
            <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Main Screen ---
export default function TimelineScreen({ navigation }: Props) {
  const [murmurs, setMurmurs] = useState<Murmur[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);

  async function getLikeCount(murmurId: string) {
    const likesSnap = await getDocs(collection(db, "murmurs", murmurId, "likes"));
    return likesSnap.size;
  }

  // Process data and FIX NAME MAPPING here
  const processSnapshot = async (snapshot: any) => {
    const promises = snapshot.docs.map(async (d: any) => {
      const data = d.data();
      const [likeCount, userProfile] = await Promise.all([
        getLikeCount(d.id),
        getUserProfile(data.authorId),
      ]);

      return {
        id: d.id,
        ...data,
        likeCount,
        author: {
          uid: data.authorId,
          // CRITICAL FIX: Map 'displayName' from DB to 'fullName' for UI
          fullName: userProfile?.displayName || userProfile?.fullName || "Anonymous",
          email: userProfile?.email || "",
          photoURL: userProfile?.photoURL,
        },
      } as Murmur;
    });

    return Promise.all(promises);
  };

  const loadInitial = async () => {
    try {
      const q = query(collection(db, "murmurs"), orderBy("createdAt", "desc"), limit(10));
      const snapshot = await getDocs(q);
      const data = await processSnapshot(snapshot);

      setMurmurs(data);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);

    const q = query(
      collection(db, "murmurs"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(10)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const data = await processSnapshot(snapshot);
      setMurmurs((prev) => [...prev, ...data]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    }
    setLoadingMore(false);
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadInitial();
  };

  const handlePostDelete = async (id: string) => {
    setMurmurs((prev) => prev.filter(m => m.id !== id));
    await deleteDoc(doc(db, "murmurs", id));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Feed Header */}
      <View style={styles.header}>
        <View>
          <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 2 }}>
            Welcome back,
          </Text>
          <Text style={styles.headerTitle}>
            {auth.currentUser?.displayName || "User"}
          </Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
           <Image 
             source={{ uri: auth.currentUser?.photoURL || "https://ui-avatars.com/api/?name=User" }}
             style={styles.headerAvatar}
           />
        </TouchableOpacity>
      </View>

      <FlatList
        data={murmurs}
        renderItem={({ item }) => (
          <MurmurCard item={item} navigation={navigation} onDelete={handlePostDelete} />
        )}
        keyExtractor={(item) => item.id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator style={{ padding: 20 }} color="#4F46E5" /> : <View style={{ height: 80 }} />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreateMurmur")}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  headerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB' },
  listContent: { paddingVertical: 10 },
  card: { backgroundColor: "#fff", marginHorizontal: 12, marginBottom: 10, borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: "#eee" },
  authorName: { fontWeight: "700", color: "#111827", fontSize: 15 },
  timestamp: { color: "#9CA3AF", fontSize: 12 },
  postText: { fontSize: 15, color: "#374151", lineHeight: 22, marginBottom: 12 },
  actionRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingTop: 12 },
  actionButton: { flexDirection: "row", alignItems: "center", marginRight: 24 },
  actionText: { marginLeft: 6, color: "#6B7280", fontSize: 14, fontWeight: "500" },
  activeActionText: { color: "#E11D48" },
  fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: "#4F46E5", justifyContent: "center", alignItems: "center", shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6 },
});