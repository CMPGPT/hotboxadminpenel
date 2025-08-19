import { getFirebaseAuth } from "./index";
import { onAuthStateChanged, User } from "firebase/auth";

/**
 * Get the current user's ID token for API authentication
 */
export async function getIdToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      unsubscribe();
      if (user) {
        try {
          const token = await user.getIdToken();
          resolve(token);
        } catch (error) {
          reject(new Error("Failed to get ID token"));
        }
      } else {
        reject(new Error("User not authenticated"));
      }
    });
  });
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      unsubscribe();
      resolve(user);
    });
  });
}

/**
 * Check if the current user is an admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) return false;
    
    const token = await user.getIdTokenResult();
    return token.claims.admin === true || token.claims.role === "admin" || 
           (Array.isArray(token.claims.roles) && token.claims.roles.includes("admin"));
  } catch {
    return false;
  }
}
