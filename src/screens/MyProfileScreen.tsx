// src/screens/MyProfileScreen.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { auth, db } from "../firebase";
import {
    doc,
    deleteDoc,
    collection,
    query,
    where,
    getDocs,
    orderBy,
    getCountFromServer // <--- IMPORT THIS
} from "firebase/firestore";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<any, "Profile">;

interface MurmurPost {
    id: string;
    text: string;
    createdAt: any;
}

export default function MyProfileScreen({ navigation }: Props) {
    const user = auth.currentUser;

    const [murmurs, setMurmurs] = useState<MurmurPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // New State for Stats
    const [stats, setStats] = useState({
        followers: 0,
        following: 0,
        postCount: 0
    });

    // 1. Fetch User Stats (Parallel Execution)
    async function loadStats() {
        if (!user) return;

        try {
            // Reference the 'follows' collection
            const followsRef = collection(db, "follows");

            // Query A: How many people follow ME? (My ID is in 'followingId')
            const followersQuery = query(followsRef, where("followingId", "==", user.uid));

            // Query B: How many people do I follow? (My ID is in 'followerId')
            const followingQuery = query(followsRef, where("followerId", "==", user.uid));

            // Execute counts in parallel for performance
            const [followersSnap, followingSnap] = await Promise.all([
                getCountFromServer(followersQuery),
                getCountFromServer(followingQuery)
            ]);

            setStats(prev => ({
                ...prev,
                followers: followersSnap.data().count,
                following: followingSnap.data().count
            }));

        } catch (error) {
            console.log("Error fetching stats:", error);
        }
    }

    // 2. Fetch Posts
    async function loadMyMurmurs() {
        if (!user) return;
        try {
            const q = query(
                collection(db, "murmurs"),
                where("authorId", "==", user.uid)
                // orderBy("createdAt", "desc") <--- Comment this out temporarily
            );

            const snapshot = await getDocs(q);
            const items = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            })) as MurmurPost[];

            setMurmurs(items);

            // Update post count locally
            setStats(prev => ({ ...prev, postCount: items.length }));

        } catch (error) {
            console.log("Error loading profile:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    // Master load function
    const loadAllData = async () => {
        setRefreshing(true);
        await Promise.all([loadMyMurmurs(), loadStats()]);
        setRefreshing(false);
    }

    useEffect(() => {
        loadAllData();
    }, []);

    const handleDelete = (id: string) => {
        Alert.alert("Delete Murmur", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        setMurmurs((prev) => prev.filter((item) => item.id !== id));
                        setStats(prev => ({ ...prev, postCount: prev.postCount - 1 })); // Update count instantly
                        await deleteDoc(doc(db, "murmurs", id));
                    } catch (error) {
                        Alert.alert("Error", "Could not delete post.");
                        loadMyMurmurs();
                    }
                },
            },
        ]
        );
    };

    const handleLogout = async () => {
        await auth.signOut();
        navigation.reset({ index: 0, routes: [{ name: "SignIn" }] });
    };

    const renderItem = ({ item }: { item: MurmurPost }) => (
        <View style={styles.card}>
            <Text style={styles.cardText}>{item.text}</Text>
            <View style={styles.cardFooter}>
                <Text style={styles.timestamp}>
                    {item.createdAt?.seconds
                        ? new Date(item.createdAt.seconds * 1000).toLocaleDateString()
                        : "Just now"}
                </Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: user?.photoURL || "https://ui-avatars.com/api/?name=User" }}
                    style={styles.avatar}
                />
            </View>
            <Text style={styles.name}>{user?.displayName || "User"}</Text>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{stats.postCount}</Text>
                    <Text style={styles.statLabel}>Murmurs</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{stats.following}</Text>
                    <Text style={styles.statLabel}>Following</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{stats.followers}</Text>
                    <Text style={styles.statLabel}>Followers</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navBar}>
                <Text style={styles.navTitle}>Profile</Text>
                <TouchableOpacity onPress={handleLogout}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator style={styles.centerLoading} size="large" color="#4F46E5" />
            ) : (
                <FlatList
                    data={murmurs}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListHeaderComponent={renderHeader}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={loadAllData} tintColor="#4F46E5" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No murmurs yet.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F3F4F6" },
    navBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, backgroundColor: "#fff" },
    navTitle: { fontSize: 18, fontWeight: "700" },
    logoutText: { color: "#EF4444", fontWeight: "600" },
    centerLoading: { flex: 1, justifyContent: "center", alignItems: "center" },
    profileHeader: { backgroundColor: "#fff", padding: 20, alignItems: "center", marginBottom: 12 },
    avatarContainer: { marginBottom: 10 },
    avatar: { width: 90, height: 90, borderRadius: 45 },
    name: { fontSize: 20, fontWeight: "800", marginBottom: 20 },
    statsContainer: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
    statBox: { alignItems: "center" },
    statNumber: { fontSize: 18, fontWeight: "700", color: "#4F46E5" },
    statLabel: { fontSize: 12, color: "#6B7280" },
    card: { backgroundColor: "#fff", margin: 16, marginTop: 0, padding: 16, borderRadius: 12 },
    cardText: { fontSize: 16, marginBottom: 10 },
    cardFooter: { flexDirection: "row", justifyContent: "space-between", paddingTop: 10, borderTopWidth: 1, borderColor: "#eee" },
    timestamp: { color: "#999", fontSize: 12 },
    deleteText: { color: "red", fontSize: 14, fontWeight: "600" },
    emptyState: { alignItems: "center", marginTop: 40 },
    emptyText: { color: "#999" }
});