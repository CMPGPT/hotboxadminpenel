import type { FirebaseApp, FirebaseOptions } from "firebase/app";
import { getApp, getApps, initializeApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import type { Database } from "firebase/database";
import { getDatabase } from "firebase/database";
import type { FirebaseStorage } from "firebase/storage";
import { getStorage } from "firebase/storage";
import type { Analytics } from "firebase/analytics";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import type { Messaging } from "firebase/messaging";
import { getMessaging, getToken, isSupported as isMessagingSupported, onMessage } from "firebase/messaging";
import type { Firestore } from "firebase/firestore";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const isBrowser = typeof window !== "undefined";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let cachedApp: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (cachedApp) return cachedApp;
  cachedApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return cachedApp;
}

export function getFirebaseAuth(): Auth {
  const auth = getAuth(getFirebaseApp());
  if (isBrowser) {
    // Persist auth state across tabs and reloads on the client.
    setPersistence(auth, browserLocalPersistence).catch(() => {
      // No-op: persistence can fail in private mode; callers should handle auth flows accordingly.
    });
  }
  return auth;
}

export function getRealtimeDatabase(): Database {
  // databaseURL is provided via config but not required here
  return getDatabase(getFirebaseApp());
}

export function getCloudStorage(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}

export function getFirestoreDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (!isBrowser) return null;
  if (!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) return null;
  const supported = await isAnalyticsSupported().catch(() => false);
  if (!supported) return null;
  return getAnalytics(getFirebaseApp());
}

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (!isBrowser) return null;
  const supported = await isMessagingSupported().catch(() => false);
  if (!supported) return null;
  return getMessaging(getFirebaseApp());
}

export async function requestFcmToken(options?: { serviceWorkerPath?: string }): Promise<string | null> {
  if (!isBrowser) return null;
  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;
  if (!("serviceWorker" in navigator)) return null;

  const registration = await navigator.serviceWorker.register(options?.serviceWorkerPath ?? "/firebase-messaging-sw.js", { scope: "/" });
  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    return token ?? null;
  } catch (_e) {
    return null;
  }
}

export function listenToFcmMessages(handler: (payload: import("firebase/messaging").MessagePayload) => void) {
  if (!isBrowser) return () => {};
  getFirebaseMessaging()
    .then((messaging) => {
      if (!messaging) return () => {};
      return onMessage(messaging, handler);
    })
    .catch(() => {});
}

export async function isEmailAdmin(email: string): Promise<boolean> {
  const db = getFirestoreDb();
  const ref = doc(db, "admins", email.toLowerCase());
  const snap = await getDoc(ref);
  const data = snap.exists() ? (snap.data() as { admin?: boolean }) : null;
  return Boolean(data?.admin);
}


