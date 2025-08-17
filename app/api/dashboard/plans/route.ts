export const runtime = "nodejs";
import { adminDb } from "@/lib/firebase/admin";

type PlanItem = { name: string; count: number };

function resolveProductName(item: any): string | null {
  if (!item) return null;
  if (typeof item.productName === "string" && item.productName.trim().length > 0) return item.productName.trim();
  const p = item.productId;
  if (p && typeof p === "object" && typeof p.name === "string") return p.name;
  // Optional: fallback for known product ids → names
  if (typeof p === "string") {
    if (p === "prod_SgAWsvTr6euOqz") return "Bulk Seller Subscription";
    if (p === "prod_SgAViEWvaDgow6") return "Retailer Subscription";
    if (p === "prod_SgASQUYSNfGBK3") return "Buyer Subscription";
  }
  return null;
}

export async function GET() {
  try {
    const col = adminDb().collection("user_subscription_status");
    let snap = await col.get();

    const nameToCount = new Map<string, number>();
    let total = 0;

    snap.forEach((doc) => {
      const d = doc.data() as any;
      const consider = (entry: any) => {
        const status = String(entry?.status || d?.status || "").toLowerCase();
        if (status !== "active") return;
        const name = resolveProductName(entry);
        if (!name) return;
        nameToCount.set(name, (nameToCount.get(name) || 0) + 1);
        total += 1;
      };

      if (Array.isArray(d.activeSubscriptions) && d.activeSubscriptions.length) {
        d.activeSubscriptions.forEach(consider);
        return;
      }
      // Fallbacks
      consider(d);
      if (Array.isArray(d.subscriptionHistory)) d.subscriptionHistory.forEach(consider);
    });

    const items: PlanItem[] = Array.from(nameToCount.entries()).map(([name, count]) => ({ name, count }));
    // Sort by count desc
    items.sort((a, b) => b.count - a.count);

    return new Response(
      JSON.stringify({ total, items }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal Server Error";
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}


