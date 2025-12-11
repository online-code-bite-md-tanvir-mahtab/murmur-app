// src/screens/UserProfileScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList } from "react-native";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import {
  isFollowing,
  followUser,
  unfollowUser,
} from "../services/followService";

export default function UserProfileScreen({ route }: any) {
  const { userId } = route.params;

  const [murmurs, setMurmurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const q = query(
      collection(db, "murmurs"),
      where("authorId", "==", userId)
    );

    const snapshot = await getDocs(q);
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setMurmurs(items);

    const isF = await isFollowing(userId);
    setFollowing(isF);

    setLoading(false);
  }

  async function handleFollow() {
    if (following) {
      await unfollowUser(userId);
      setFollowing(false);
    } else {
      await followUser(userId);
      setFollowing(true);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20 }}>User Profile</Text>
      <Text>User ID: {userId}</Text>

      <Button
        title={following ? "Unfollow" : "Follow"}
        onPress={handleFollow}
      />

      <Text style={{ marginTop: 20, fontWeight: "bold" }}>
        Their Murmurs ({murmurs.length})
      </Text>

      <FlatList
        data={murmurs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              marginTop: 10,
              padding: 12,
              borderWidth: 1,
              borderColor: "#ccc",
            }}
          >
            <Text style={{ fontSize: 16 }}>{item.text}</Text>
          </View>
        )}
      />
    </View>
  );
}
