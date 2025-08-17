export const runtime = "nodejs";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { uid, reason } = await request.json();
    if (!uid || typeof uid !== "string") {
      return new Response(JSON.stringify({ error: "uid is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    // Disable Auth sign-in
    await adminAuth().updateUser(uid, { disabled: true });
    // Reflect suspension in primary user document
    await adminDb().collection("users").doc(uid).set({ suspended: true, status: "Suspended", suspendedAt: Date.now() }, { merge: true });
    // Audit trail
    await adminDb().collection("user_blocks").doc(uid).set({ uid, reason: reason || null, blockedAt: Date.now() }, { merge: true });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal Server Error";
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}


