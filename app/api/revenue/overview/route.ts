export const runtime = "nodejs";
import { adminDb } from "@/lib/firebase/admin";

type CategoryKey = "wholesaler" | "retailer" | "paid_buyer" | "other";

const CATEGORY_META: Record<CategoryKey, { label: string; color: string }> = {
  wholesaler: { label: "Wholesaler", color: "#FF8400" },
  retailer: { label: "Retailer", color: "#10b981" },
  paid_buyer: { label: "Paid Buyer", color: "#f59e0b" },
  other: { label: "Other", color: "#3b82f6" },
};

function normalizeCategory(productName?: string | null): CategoryKey {
  const p = (productName || "").toLowerCase();
  if (p.includes("wholesale") || p.includes("wholesaler") || p.includes("bulk")) return "wholesaler";
  if (p.includes("retail")) return "retailer";
  if (p.includes("buyer")) return "paid_buyer";
  return "other";
}

export async function GET() {
  try {
    const col = adminDb().collection("user_subscription_status");
    let snap = await col.where("status", "==", "active").get();
    // Fallback: if no docs matched (in case status field missing/variant), read all and filter in code
    if (snap.empty) {
      snap = await col.get();
    }

    const byCategory: Record<CategoryKey, { cents: number; count: number; userIds: Set<string> }> = {
      wholesaler: { cents: 0, count: 0, userIds: new Set() },
      retailer: { cents: 0, count: 0, userIds: new Set() },
      paid_buyer: { cents: 0, count: 0, userIds: new Set() },
      other: { cents: 0, count: 0, userIds: new Set() },
    };

    let totalCents = 0;
    let totalCount = 0;

    snap.forEach((doc) => {
      const d = doc.data() as any;

      const addFrom = (item: any) => {
        const interval: string = String(item?.interval || "month").toLowerCase();
        const status: string | undefined = item?.status ? String(item.status).toLowerCase() : undefined;
        if (status && status !== "active") return;
        const unitAmount: number = Number(item?.unitAmount ?? item?.unit_amount ?? 0);
        if (!unitAmount) return;
        const productName: string | undefined = item?.productName || (typeof item?.productId === "object" ? item?.productId?.name : undefined);
        const monthlyCents = interval === "year" ? Math.round(unitAmount / 12) : unitAmount;
        const key = normalizeCategory(productName);
        byCategory[key].cents += monthlyCents;
        byCategory[key].count += 1;
        const userId: string | undefined = (d?.userId || item?.userId || "") as string;
        if (userId) byCategory[key].userIds.add(userId);
        totalCents += monthlyCents;
        totalCount += 1;
      };

      // Prefer array of activeSubscriptions if present
      if (Array.isArray(d.activeSubscriptions) && d.activeSubscriptions.length > 0) {
        d.activeSubscriptions.forEach(addFrom);
        return;
      }

      // Some docs store a single active subscription inline on root
      if (d.status || d.unitAmount || d.productName) {
        addFrom(d);
      }

      // Fallback: use latest from subscriptionHistory
      if (Array.isArray(d.subscriptionHistory) && d.subscriptionHistory.length > 0) {
        d.subscriptionHistory.forEach(addFrom);
      }
    });

    const breakdown = (Object.keys(byCategory) as CategoryKey[]).map((k) => {
      const meta = CATEGORY_META[k];
      const cents = byCategory[k].cents;
      const percent = totalCents > 0 ? (cents / totalCents) * 100 : 0;
      return {
        key: k,
        label: meta.label,
        amountCents: cents,
        percent,
        color: meta.color,
      };
    });

    // Sort by revenue desc
    breakdown.sort((a, b) => b.amountCents - a.amountCents);

    // Unique paid users across any category
    const paidUserIds = new Set<string>();
    (Object.keys(byCategory) as CategoryKey[]).forEach((k) => {
      byCategory[k].userIds.forEach((id) => paidUserIds.add(id));
    });

    // Total users for basic-vs-paid split
    let totalUsers = 0;
    try {
      const agg = await (adminDb().collection("users") as any).count().get();
      totalUsers = agg.data().count || 0;
    } catch {
      const us = await adminDb().collection("users").select("__name__").get();
      totalUsers = us.size;
    }

    const response = {
      totalMonthlyRevenueCents: totalCents,
      activeSubscriptions: totalCount,
      arpuCents: totalCount > 0 ? Math.round(totalCents / totalCount) : 0,
      breakdown,
      segments: {
        wholesalers: byCategory.wholesaler.userIds.size,
        retailers: byCategory.retailer.userIds.size,
        paidBuyers: byCategory.paid_buyer.userIds.size,
        others: byCategory.other.userIds.size,
        paidUsers: paidUserIds.size,
        basicUsers: Math.max(totalUsers - paidUserIds.size, 0),
      },
    };

    return new Response(JSON.stringify(response), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}


