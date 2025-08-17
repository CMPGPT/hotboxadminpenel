export const runtime = "nodejs";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const db = adminDb();
    if (id) {
      const snap = await db.collection("user_subscription_status").doc(id).get();
      return new Response(JSON.stringify({ id, exists: snap.exists, data: snap.data() || null }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    const snap = await db.collection("user_subscription_status").limit(5).get();
    const docs = snap.docs.map((d) => ({ id: d.id, data: d.data() }));
    return new Response(JSON.stringify({ count: docs.length, docs }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal Server Error";
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}


