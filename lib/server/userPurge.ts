export const runtime = "nodejs";
import { adminAuth, adminBucket, adminDb } from "@/lib/firebase/admin";

/**
 * Minimal, configurable purge routine.
 * TODO: Extend PURGE_TARGETS as new user-owned surfaces are added.
 */
const PURGE_TARGETS: Array<
  | { type: "collectionGroup"; name: string; field: string }
> = [
  { type: "collectionGroup", name: "messages", field: "userId" },
  { type: "collectionGroup", name: "memberships", field: "userId" },
  { type: "collectionGroup", name: "uploads", field: "userId" },
  { type: "collectionGroup", name: "notifications", field: "userId" },
  { type: "collectionGroup", name: "chats", field: "ownerId" },
];

async function deleteCollectionGroupByField(name: string, field: string, uid: string) {
  const db = adminDb();
  const cg = db.collectionGroup(name).where(field, "==", uid);
  const pageSize = 300;
  let deleted = 0;
  while (true) {
    const snap = await cg.limit(pageSize).get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    deleted += snap.size;
    if (snap.size < pageSize) break;
  }
  return deleted;
}

async function deleteUserStorage(uid: string) {
  // Assuming user uploads are stored under this prefix.
  const prefix = `userUploads/${uid}/`;
  const bucket = adminBucket();
  try {
    // This will delete files; to also remove empty folders, GCS doesn't need explicit folder deletion.
    await bucket.deleteFiles({ prefix, force: true });
  } catch (_) {
    // ignore errors to keep idempotency
  }
}

export async function purgeUserData(uid: string) {
  const results: Record<string, number> = {};
  // Purge Firestore surfaces
  for (const t of PURGE_TARGETS) {
    if (t.type === "collectionGroup") {
      try {
        const n = await deleteCollectionGroupByField(t.name, t.field, uid);
        results[`cg:${t.name}`] = n;
      } catch (_) {
        results[`cg:${t.name}`] = -1; // indicate failure but continue
      }
    }
  }

  // Delete primary user doc
  try {
    await adminDb().collection("users").doc(uid).delete();
  } catch (_) {}

  // Delete storage namespace
  await deleteUserStorage(uid);

  // Try to delete Auth user last (ok if already deleted)
  try {
    await adminAuth().deleteUser(uid);
  } catch (e: any) {
    // Ignore user-not-found and proceed
  }

  return results;
}
