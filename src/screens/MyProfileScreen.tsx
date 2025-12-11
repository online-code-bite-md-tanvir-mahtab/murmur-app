// src/screens/MyProfileScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button } from "react-native";
import { auth, db } from "../firebase";
import { doc, deleteDoc } from "firebase/firestore";

import {
    collection,
    query,
    where,
    getDocs,
} from "firebase/firestore";

export default function MyProfileScreen({ navigation }: any) {
    const userId = auth.currentUser?.uid;

    const [murmurs, setMurmurs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadMyMurmurs() {
        const q = query(
            collection(db, "murmurs"),
            where("authorId", "==", userId)
        );

        const snapshot = await getDocs(q);
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        setMurmurs(items);
        setLoading(false);
    }

    useEffect(() => {
        loadMyMurmurs();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Loading profile...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 20, marginBottom: 10 }}>My Profile</Text>
            <Text>User ID: {userId}</Text>

            <Text style={{ marginTop: 20, fontWeight: "bold" }}>
                My Murmurs ({murmurs.length})
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

                        <View style={{ marginTop: 10 }}>
                            <Button
                                title="Delete"
                                color="red"
                                onPress={async () => {
                                    await deleteDoc(doc(db, "murmurs", item.id));
                                    alert("Deleted!");
                                    loadMyMurmurs();
                                }}
                            />
                        </View>
                    </View>
                )}
            />

            {/* LOGOUT BUTTON */}
            <View style={{ marginTop: 24 }}>
                <Button
                    title="Logout"
                    color="red"
                    onPress={async () => {
                        await auth.signOut();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "SignIn" }],
                        });
                    }}
                />
            </View>
        </View>
    );
}
