// src/services/followService.ts
import { db, auth } from "../firebase";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";

export async function isFollowing(targetUserId: string) {
  const currentUserId = auth.currentUser?.uid;
  if (!currentUserId) return false;

  const ref = doc(db, "follows", `${currentUserId}_${targetUserId}`);
  const snap = await getDoc(ref);

  return snap.exists();
}

export async function followUser(targetUserId: string) {
  const currentUserId = auth.currentUser?.uid;
  if (!currentUserId) return;

  await setDoc(doc(db, "follows", `${currentUserId}_${targetUserId}`), {
    follower: currentUserId,
    followed: targetUserId,
  });
}

export async function unfollowUser(targetUserId: string) {
  const currentUserId = auth.currentUser?.uid;
  if (!currentUserId) return;

  await deleteDoc(doc(db, "follows", `${currentUserId}_${targetUserId}`));
}
