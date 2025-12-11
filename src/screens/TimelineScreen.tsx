// src/screens/TimelineScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, ActivityIndicator } from "react-native";
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

export default function TimelineScreen({ navigation }: any) {
  const [murmurs, setMurmurs] = useState<any[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // -------------------------------
  // FETCH LIKE COUNT
  // -------------------------------
  async function getLikeCount(murmurId: string) {
    const likesSnap = await getDocs(
      collection(db, "murmurs", murmurId, "likes")
    );
    return likesSnap.size;
  }

  // -------------------------------
  // LOAD FIRST 10 MURMURS
  // -------------------------------
  async function loadInitial() {
    try {
      setLoading(true);

      const q = query(
        collection(db, "murmurs"),
        orderBy("createdAt", "desc"),
        limit(10)
      );

      const snapshot = await getDocs(q);

      const data = [];
      for (const d of snapshot.docs) {
        const murmurData = d.data();
        const likeCount = await getLikeCount(d.id);

        data.push({
          id: d.id,
          ...murmurData,
          likeCount,
        });
      }

      setMurmurs(data);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------
  // PAGINATION
  // -------------------------------
  async function loadMore() {
    if (!lastDoc || loadingMore) return;

    setLoadingMore(true);

    const q = query(
      collection(db, "murmurs"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(10)
    );

    const snapshot = await getDocs(q);

    const data = [];
    for (const d of snapshot.docs) {
      const murmurData = d.data();
      const likeCount = await getLikeCount(d.id);

      data.push({
        id: d.id,
        ...murmurData,
        likeCount,
      });
    }

    setMurmurs((prev) => [...prev, ...data]);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);

    setLoadingMore(false);
  }

  useEffect(() => {
    loadInitial();
  }, []);

  // -------------------------------
  // LOADING SCREEN
  // -------------------------------
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // -------------------------------
  // RENDER EACH MURMUR
  // -------------------------------
  function renderItem({ item }: any) {
    const isMyPost = item.authorId === auth.currentUser?.uid;

    async function handleLike() {
      await toggleLike(item.id);
      await loadInitial(); // refresh with updated count
    }

    async function handleDelete() {
      await deleteDoc(doc(db, "murmurs", item.id));
      await loadInitial();
    }

    return (
      <View
        style={{
          padding: 16,
          borderBottomWidth: 1,
          borderColor: "#ddd",
        }}
      >
        <Text style={{ fontSize: 16 }}>{item.text}</Text>

        <Text
          style={{ color: "blue", marginTop: 4 }}
          onPress={() =>
            navigation.navigate("UserProfile", { userId: item.authorId })
          }
        >
          Posted by: {item.authorId}
        </Text>

        <Text style={{ marginTop: 8 }}>Likes: {item.likeCount}</Text>

        <Button title="Like / Unlike" onPress={handleLike} />

        {isMyPost && (
          <View style={{ marginTop: 10 }}>
            <Button title="Delete" color="red" onPress={handleDelete} />
          </View>
        )}
      </View>
    );
  }

  // -------------------------------
  // MAIN SCREEN UI
  // -------------------------------
  return (
    <View style={{ flex: 1 }}>
      <Button
        title="My Profile"
        onPress={() => navigation.navigate("Profile")}
      />

      <FlatList
        data={murmurs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ marginVertical: 20 }} />
          ) : null
        }
      />

      <Button
        title="Create Murmur"
        onPress={() => navigation.navigate("CreateMurmur")}
      />
    </View>
  );
}
