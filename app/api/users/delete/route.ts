export const runtime = "nodejs";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { uid } = await request.json();
    if (!uid || typeof uid !== "string") {
      return new Response(JSON.stringify({ error: "uid is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    // Mark suspended in Firestore before deletion to reflect state in downstream analytics
    await adminDb().collection("users").doc(uid).set({ suspended: true, status: "Suspended", suspendedAt: Date.now() }, { merge: true });
    // Delete Auth user and remove user document
    await Promise.all([
      adminAuth().deleteUser(uid),
      adminDb().collection("users").doc(uid).delete().catch(() => {}),
    ]);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal Server Error";
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}


