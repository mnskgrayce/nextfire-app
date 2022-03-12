import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Grab these from Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyCfPnD_2ASg17JTEFUju3-75mK4i4ioGJ0",
  authDomain: "nextfire-79b91.firebaseapp.com",
  projectId: "nextfire-79b91",
  storageBucket: "nextfire-79b91.appspot.com",
  messagingSenderId: "826074924331",
  appId: "1:826074924331:web:8678b1bdb22e492f53f16e",
};

// Avoid multiple initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

/**`
 * Gets a users/{uid} document with username
 * @param  {string} username
 */
export async function getUserWithUsername(username) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username), limit(1));
  const userDoc = (await getDocs(q)).docs[0];
  return userDoc;
}

/**`
 * Converts a firestore document to JSON
 * @param  {DocumentSnapshot} doc
 */
export function postToJSON(doc) {
  const data = doc.data();
  return {
    ...data,
    // Gotcha! firestore timestamp NOT serializable to JSON. Must convert to milliseconds
    createdAt: data.createdAt.toMillis(),
    updatedAt: data.updatedAt.toMillis(),
  };
}
