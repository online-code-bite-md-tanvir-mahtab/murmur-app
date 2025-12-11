import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";

// Get user profile info
export async function getUserProfile(userId: string) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      return userSnap.data(); // Returns { displayName, email, photoURL, ... }
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

// Follow user
export async function followUser(targetUserId: string) {
  const userId = auth.currentUser?.uid;
  if (!userId || userId === targetUserId) return;

  const followRef = doc(db, "follows", `${userId}_${targetUserId}`);
  await setDoc(followRef, {
    followerId: userId,
    followingId: targetUserId,
    createdAt: Date.now(),
  });
}

// Unfollow user
export async function unfollowUser(targetUserId: string) {
  const userId = auth.currentUser?.uid;
  if (!userId || userId === targetUserId) return;

  const followRef = doc(db, "follows", `${userId}_${targetUserId}`);
  await deleteDoc(followRef);
}

// Check follow status
export async function isFollowing(targetUserId: string) {
  const userId = auth.currentUser?.uid;
  const followRef = doc(db, "follows", `${userId}_${targetUserId}`);
  const snap = await getDoc(followRef);
  return snap.exists();
}

// Count followers
export async function countFollowers(userId: string) {
  const q = collection(db, "follows");
  const all = await getDocs(q);

  return all.docs.filter((d) => d.data().followingId === userId).length;
}

// Count following
export async function countFollowing(userId: string) {
  const q = collection(db, "follows");
  const all = await getDocs(q);

  return all.docs.filter((d) => d.data().followerId === userId).length;
}

