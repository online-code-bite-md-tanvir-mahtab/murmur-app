// src/services/replyService.ts
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  getDocs, 
  serverTimestamp 
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { getUserProfile } from "./userService";

// Add a reply to a specific Murmur
export async function addReply(murmurId: string, text: string) {
  if (!auth.currentUser) throw new Error("Not logged in");

  // We store replies in a SUB-COLLECTION: murmurs/{id}/replies
  const replyRef = collection(db, "murmurs", murmurId, "replies");

  await addDoc(replyRef, {
    text,
    authorId: auth.currentUser.uid,
    createdAt: serverTimestamp(),
  });
}

// Fetch replies and resolve author profiles
export async function getReplies(murmurId: string) {
  const replyRef = collection(db, "murmurs", murmurId, "replies");
  const q = query(replyRef, orderBy("createdAt", "asc")); // Oldest first (like Twitter)

  const snapshot = await getDocs(q);

  // Map over replies and fetch author details for each
  const promises = snapshot.docs.map(async (doc) => {
    const data = doc.data();
    const userProfile = await getUserProfile(data.authorId);

    return {
      id: doc.id,
      text: data.text,
      authorId: data.authorId,
      createdAt: data.createdAt,
      author: {
        uid: data.authorId,
        fullName: userProfile?.displayName || userProfile?.fullName || "Anonymous",
        photoURL: userProfile?.photoURL
      }
    };
  });

  return Promise.all(promises);
}