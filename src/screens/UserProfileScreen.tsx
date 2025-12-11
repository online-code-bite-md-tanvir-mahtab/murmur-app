// src/screens/UserProfileScreen.tsx

import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  SafeAreaView, 
  Image, 
  TouchableOpacity, 
  StatusBar 
} from "react-native";
import { auth, db } from "../firebase";
import { Ionicons } from "@expo/vector-icons";

import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import {
  getUserProfile,
  isFollowing,
  followUser,
  unfollowUser,
  countFollowers,
  countFollowing,
} from "../services/userService";

import { getLikeCount } from "../services/likeService";

// Navigation Types
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/types";

// Type definitions for props
type UserProfileRouteProp = RouteProp<RootStackParamList, "UserProfile">;
type UserProfileNavProp = StackNavigationProp<
  RootStackParamList,
  "UserProfile"
>;

type Props = {
  route: UserProfileRouteProp;
  navigation: UserProfileNavProp;
};

export default function UserProfileScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const currentUserId = auth.currentUser?.uid;

  const [user, setUser] = useState<any>(null);
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [followStatus, setFollowStatus] = useState<boolean>(false);

  const isMe = currentUserId === userId;

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);

    // Get user details
    const profile = await getUserProfile(userId);
    setUser(profile);

    // Followers and following
    const f1 = await countFollowers(userId);
    const f2 = await countFollowing(userId);
    setFollowers(f1);
    setFollowing(f2);

    // Only check follow status if it's not your own profile
    if (!isMe) {
      const status = await isFollowing(userId);
      setFollowStatus(status);
    }

    // Load user's posts
    const q = query(
      collection(db, "murmurs"),
      where("authorId", "==", userId)
    );

    const snap = await getDocs(q);
    const list = [];

    for (const d of snap.docs) {
      list.push({
        id: d.id,
        ...d.data(),
        likeCount: await getLikeCount(d.id),
      });
    }

    setPosts(list);
    setLoading(false);
  }

  async function handleFollow() {
    await followUser(userId);
    setFollowStatus(true);
    setFollowers((prev) => prev + 1);
  }

  async function handleUnfollow() {
    await unfollowUser(userId);
    setFollowStatus(false);
    setFollowers((prev) => prev - 1);
  }

  // --- UI Components ---

  const renderHeader = () => {
    const displayName = user?.fullName || "User";
    
    return (
      <View style={styles.profileHeader}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={{ 
              uri: user?.photoURL || `https://ui-avatars.com/api/?name=${displayName}&background=random` 
            }}
            style={styles.avatar}
          />
        </View>

        {/* Name & Email */}
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {/* Follow/Unfollow Button */}
        {!isMe && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              followStatus ? styles.followingButton : styles.followButton
            ]}
            onPress={followStatus ? handleUnfollow : handleFollow}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.actionButtonText,
              followStatus ? styles.followingButtonText : styles.followButtonText
            ]}>
              {followStatus ? "Unfollow" : "Follow"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderPostItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.cardText}>{item.text}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.likeContainer}>
          <Ionicons name="heart" size={16} color="#E11D48" />
          <Text style={styles.likeText}>{item.likeCount}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPostItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No murmurs yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  centerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  backButton: {
    padding: 4,
  },
  listContent: {
    paddingBottom: 40,
  },
  // Profile Header Styles
  profileHeader: {
    backgroundColor: "#fff",
    paddingVertical: 24,
    alignItems: "center",
    marginBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statBox: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E5E7EB",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4F46E5",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  // Button Styles
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 140,
    alignItems: "center",
  },
  followButton: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  followingButton: {
    backgroundColor: "#fff",
    borderColor: "#D1D5DB",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  followButtonText: {
    color: "#fff",
  },
  followingButtonText: {
    color: "#374151",
  },
  // Card Styles
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardText: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 12,
    lineHeight: 24,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  likeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF1F2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  likeText: {
    marginLeft: 6,
    color: "#E11D48",
    fontWeight: "600",
    fontSize: 13,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
});