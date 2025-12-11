import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";

export async function toggleLike(murmurId: string) {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const likeRef = doc(db, "murmurs", murmurId, "likes", userId);
  const likeSnap = await getDoc(likeRef);

  if (likeSnap.exists()) {
    // UNLIKE
    await deleteDoc(likeRef);
  } else {
    // LIKE
    await setDoc(likeRef, {
      userId,
      likedAt: Date.now()
    });
  }
}



export async function getLikeCount(murmurId: string) {
  const q = collection(db, "murmurs", murmurId, "likes");
  const snap = await getDocs(q);
  return snap.size;
}

