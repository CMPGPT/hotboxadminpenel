export const runtime = "nodejs";
import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

function toMillis(ts: any): number | null {
  if (!ts) return null;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (typeof ts._seconds === "number") return ts._seconds * 1000 + (ts._nanoseconds ? Math.floor(ts._nanoseconds / 1e6) : 0);
  if (typeof ts.seconds === "number") return ts.seconds * 1000 + (ts.nanoseconds ? Math.floor(ts.nanoseconds / 1e6) : 0);
  return null;
}

export async function GET() {
  try {
    const db = adminDb();
    const sevenDaysAgo = Timestamp.fromMillis(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Products total
    let totalProducts = 0;
    try {
      const aggSnap = await (db.collection("products") as any).count().get();
      totalProducts = aggSnap.data().count || 0;
    } catch {
      const snap = await db.collection("products").select("__name__").get();
      totalProducts = snap.size;
    }

    // New products in last 7d
    let newProducts7d = 0;
    try {
      const snap = await db.collection("products").where("createdAt", ">=", sevenDaysAgo).get();
      newProducts7d = snap.size;
    } catch {
      // If field missing or incompatible, fallback to 0
    }

    // New users (7d) from users collection
    let newUsers7d = 0;
    try {
      const snap = await db.collection("users").where("createdAt", ">=", sevenDaysAgo).get();
      newUsers7d = snap.size;
    } catch {
      newUsers7d = 0;
    }

    // New subscriptions (7d) from user_subscription_status
    const subsSnap = await db.collection("user_subscription_status").get();
    const thresholdMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let newSubscriptions7d = 0;
    subsSnap.forEach((doc) => {
      const d = doc.data() as any;

      const consider = (item: any) => {
        const start = toMillis(item?.startDate) ?? toMillis(item?.createdAt);
        const status = (item?.status || d?.status || "").toString().toLowerCase();
        if (status && status !== "active") return;
        if (start && start >= thresholdMs) newSubscriptions7d += 1;
      };

      if (Array.isArray(d.subscriptionHistory)) d.subscriptionHistory.forEach(consider);
      if (Array.isArray(d.activeSubscriptions)) d.activeSubscriptions.forEach(consider);
      if (!Array.isArray(d.subscriptionHistory) && !Array.isArray(d.activeSubscriptions)) consider(d);
    });

    return new Response(
      JSON.stringify({ totalProducts, newProducts7d, newUsers7d, newSubscriptions7d }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal Server Error";
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}


