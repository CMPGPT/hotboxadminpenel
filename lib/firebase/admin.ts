import { cert, getApps, initializeApp, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

type ServiceAccountEnv = {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
};

function getServiceAccountFromEnv(): ServiceAccountEnv | null {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey && privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }
  if (!projectId || !clientEmail || !privateKey) return null;
  return { projectId, clientEmail, privateKey };
}

export function getAdminApp() {
  if (getApps().length) return getApp();
  const svc = getServiceAccountFromEnv();
  if (!svc) throw new Error("Missing Firebase Admin service account envs (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)");
  return initializeApp({
    credential: cert({ projectId: svc.projectId, clientEmail: svc.clientEmail, privateKey: svc.privateKey }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export const adminAuth = () => getAuth(getAdminApp());
export const adminDb = () => getFirestore(getAdminApp());
export const adminStorage = () => getStorage(getAdminApp());
export const adminBucket = () => getStorage(getAdminApp()).bucket();


