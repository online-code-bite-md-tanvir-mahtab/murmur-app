
# React Native Social Feed App – Technical Test (Venturas Ltd.)

This repository contains my submission for the **Mobile App Engineer (React Native)** technical assessment assigned by **Venturas Ltd.**
The application demonstrates a functional social feed system built using **React Native (Expo)** and **Firebase**.

---

## **Features Implemented**

### **1. Authentication**
- Firebase Email/Password login  
- Logout  
- User profile stored in `/users/{uid}`  
- Auto-redirect on login state change  

---

### **2. Timeline (Home Feed)**
- Shows list of recent murmurs (posts)  
- Pagination (“load more” on scroll)  
- Pull-to-refresh  
- Shows author **name + email**  
- Displays like count  
- Like / Unlike functionality  
- Auto-refresh after like/unlike  
- Clicking author opens User Profile screen  

---

### **3. Create Murmur**
- Create a new post with:
  - text  
  - authorId  
  - createdAt (Firestore timestamp)
- Redirects back to Timeline after posting  

---

### **4. User Profile Screen**
For **any user**, shows:

- Full Name  
- Email  
- Followers count  
- Following count  
- List of that user’s posts with like counts  
- Follow / Unfollow button (if viewing another user)

---

### **5. Logged-In User Profile**
- Displays my profile details  
- Logout button  
- Link to navigate back to timeline  

---

## **Firestore Structure**

```
users/{uid}
  - fullName
  - email
  - createdAt

murmurs/{murmurId}
  - text
  - authorId
  - createdAt

murmurs/{murmurId}/likes/{uid}
  - userId
  - likedAt

follows/{follower_following}
  - followerId
  - followingId
  - createdAt
```

---

## **Tech Stack**

- **React Native (Expo)**
- **TypeScript**
- **Firebase Authentication**
- **Firebase Firestore**
- **React Navigation**

---

## **Project Structure**

```
src/
│
├── screens/
│   ├── TimelineScreen.tsx
│   ├── CreateMurmurScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── UserProfileScreen.tsx
│
├── services/
│   ├── likeService.ts
│   ├── userService.ts
│
├── navigation/
│   ├── AppNavigator.tsx
│   ├── types.ts
│
├── firebase.ts
├── utils.ts (optional)
```

---

## **How to Run**

### **1. Clone repo**
```
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### **2. Install dependencies**
```
npm install
```

### **3. Configure Firebase**
Create or edit:

```
src/firebase.ts
```

Insert your Firebase credentials:

```ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### **4. Run the project**
```
npm start
```

Open using:
- Expo Go (Android/iOS)  
- Web browser  

---

## **Screens**
- Login  
- Timeline  
- Create Murmur  
- My Profile  
- User Profile (other users)  

---

## **Notes**
- No backend server is required; everything is handled with Firebase.  
- All CRUD operations are permission-safe according to Firestore rules.  
- App is fully working and tested on both Android and Web (Expo).  

---

## **Submission**
Submitted as part of the **Mobile App Engineer (React Native)** position at **Venturas Ltd.**
