export const runtime = "nodejs";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

type ListResponse = {
  users: Array<{
    uid: string;
    email: string | null;
    displayName: string | null;
    disabled: boolean;
    creationTime: string | null;
    lastSignInTime: string | null;
    providerIds: string[];
    admin: boolean;
    userType?: string | null;
    sellerType?: string | null;
  }>;
  nextPageToken?: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageToken = searchParams.get("pageToken") ?? undefined;
    const maxResultsParam = searchParams.get("maxResults");
    const maxResults = Math.min(Math.max(Number(maxResultsParam) || 100, 1), 1000);

    const result = await adminAuth().listUsers(maxResults, pageToken);

    const db = adminDb();
    const usersWithAdmin = await Promise.all(
      result.users.map(async (u) => {
        const emailLower = u.email ? u.email.toLowerCase() : null;

        // Admin flag
        let isAdmin = false;
        if (emailLower) {
          const snap = await db.collection("admins").doc(emailLower).get();
          isAdmin = Boolean(snap.exists && (snap.data() as { admin?: boolean })?.admin);
        }

        // Firestore users doc: prefer uid as doc id, else try emailLower, else query by email/emailLower
        let userDoc: FirebaseFirestore.DocumentData | null = null;
        let snap = await db.collection("users").doc(u.uid).get();
        if (snap.exists) {
          userDoc = (snap.data() as FirebaseFirestore.DocumentData) ?? null;
        } else if (emailLower) {
          const byId = await db.collection("users").doc(emailLower).get();
          if (byId.exists) {
            userDoc = (byId.data() as FirebaseFirestore.DocumentData) ?? null;
          } else {
            const candidates: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>[] = [] as any;
            const q1 = await db.collection("users").where("email", "==", emailLower).get();
            candidates.push(q1);
            const q2 = await db.collection("users").where("emailLower", "==", emailLower).get();
            candidates.push(q2);
            let chosen: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData> | null = null;
            for (const qs of candidates) {
              for (const d of qs.docs) {
                if (!chosen) { chosen = d; continue; }
                const cur = d.data() as any;
                const best = chosen.data() as any;
                const curUpdated = (cur.updatedAt?.toMillis?.() ?? (cur.updatedAt?._seconds ?? 0) * 1000) || (cur.createdAt?.toMillis?.() ?? (cur.createdAt?._seconds ?? 0) * 1000) || 0;
                const bestUpdated = (best.updatedAt?.toMillis?.() ?? (best.updatedAt?._seconds ?? 0) * 1000) || (best.createdAt?.toMillis?.() ?? (best.createdAt?._seconds ?? 0) * 1000) || 0;
                if (curUpdated > bestUpdated) chosen = d;
              }
            }
            if (chosen) userDoc = (chosen.data() as FirebaseFirestore.DocumentData) ?? null;
          }
        }

        const userType = (userDoc?.userType as string | undefined) ?? null;
        const sellerType = (userDoc?.sellerType as string | undefined) ?? null;

        return {
          uid: u.uid,
          email: u.email ?? null,
          displayName: u.displayName ?? null,
          disabled: u.disabled === true,
          creationTime: u.metadata?.creationTime ?? null,
          lastSignInTime: u.metadata?.lastSignInTime ?? null,
          providerIds: Array.isArray(u.providerData) ? u.providerData.map((p) => p.providerId).filter(Boolean) : [],
          admin: isAdmin,
          userType,
          sellerType,
        };
      })
    );

    const payload: ListResponse = {
      users: usersWithAdmin,
      nextPageToken: result.pageToken || undefined,
    };

    return new Response(JSON.stringify(payload), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


