export const runtime = "nodejs";
import { adminDb } from "@/lib/firebase/admin";

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
    const now = Date.now();

    // Latest product created
    const products = await db.collection("products").orderBy("createdAt", "desc").limit(1).get().catch(() => null);
    const latestProduct = products && !products.empty ? products.docs[0].data() as any : null;
    const productTime = latestProduct ? toMillis(latestProduct.createdAt) : null;

    // Latest user signup
    const users = await db.collection("users").orderBy("createdAt", "desc").limit(1).get().catch(() => null);
    const latestUser = users && !users.empty ? users.docs[0].data() as any : null;
    const userTime = latestUser ? toMillis(latestUser.createdAt) : null;

    // Latest subscription activation
    const subs = await db.collection("user_subscription_status").orderBy("updatedAt", "desc").limit(1).get().catch(() => null);
    const latestSub = subs && !subs.empty ? subs.docs[0].data() as any : null;
    const subTime = latestSub ? toMillis(latestSub.updatedAt) : null;

    const items: { title: string; timeMs: number; iconColor: string }[] = [];
    if (productTime) items.push({ title: "New product listing created", timeMs: productTime, iconColor: "#10b981" });
    if (userTime) items.push({ title: "New user signed up", timeMs: userTime, iconColor: "#3b82f6" });
    if (subTime) items.push({ title: "Subscription updated", timeMs: subTime, iconColor: "#f59e0b" });

    items.sort((a, b) => b.timeMs - a.timeMs);

    const formatted = items.slice(0, 5).map((it) => ({
      title: it.title,
      time: timeAgo(it.timeMs, now),
      iconColor: it.iconColor,
    }));

    return new Response(JSON.stringify({ items: formatted }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal Server Error";
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

function timeAgo(timeMs: number, nowMs: number): string {
  const diff = Math.max(0, Math.floor((nowMs - timeMs) / 1000));
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}


