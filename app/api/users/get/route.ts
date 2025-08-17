export const runtime = "nodejs";
import { adminDb, adminAuth } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let uid = searchParams.get("uid");
    const email = searchParams.get("email");
    const db = adminDb();

    let docRefId: string | null = null;
    let data: Record<string, unknown> | null = null;

    if (!uid && email) {
      try {
        const rec = await adminAuth().getUserByEmail(email);
        uid = rec.uid;
      } catch {}
    }

    if (uid) {
      const snap = await db.collection("users").doc(uid).get();
      if (snap.exists) {
        docRefId = snap.id;
        data = snap.data() as Record<string, unknown>;
      }
    }

    if (!data && email) {
      const emailLower = email.toLowerCase();
      // Try doc id as email first
      const snapById = await db.collection("users").doc(emailLower).get();
      if (snapById.exists) {
        docRefId = snapById.id;
        data = snapById.data() as Record<string, unknown>;
      } else {
        // Query by email field(s); prefer most recently updated/created document
        const candidates: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>[] = [] as any;

        const byEmail = await db
          .collection("users")
          .where("email", "==", emailLower)
          .get();
        candidates.push(byEmail);

        // Some schemas store lowercased email in a separate field
        const byEmailLower = await db
          .collection("users")
          .where("emailLower", "==", emailLower)
          .get();
        candidates.push(byEmailLower);

        let chosen: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData> | null = null;
        for (const snap of candidates) {
          for (const doc of snap.docs) {
            if (!chosen) {
              chosen = doc;
              continue;
            }
            const cur = doc.data() as Record<string, any>;
            const best = chosen.data() as Record<string, any>;
            const curUpdated = (cur.updatedAt?.toMillis?.() ?? (cur.updatedAt?._seconds ?? 0) * 1000) || (cur.createdAt?.toMillis?.() ?? (cur.createdAt?._seconds ?? 0) * 1000) || 0;
            const bestUpdated = (best.updatedAt?.toMillis?.() ?? (best.updatedAt?._seconds ?? 0) * 1000) || (best.createdAt?.toMillis?.() ?? (best.createdAt?._seconds ?? 0) * 1000) || 0;
            if (curUpdated > bestUpdated) chosen = doc;
          }
        }

        if (chosen) {
          docRefId = chosen.id;
          data = chosen.data() as Record<string, unknown>;
        }
      }
    }

    if (!data) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Attach auth metadata when uid resolved
    let authMeta: Record<string, unknown> | null = null;
    if (uid) {
      try {
        const rec = await adminAuth().getUser(uid);
        authMeta = {
          uid: rec.uid,
          email: rec.email ?? null,
          displayName: rec.displayName ?? null,
          disabled: rec.disabled === true,
          creationTime: rec.metadata?.creationTime ?? null,
          lastSignInTime: rec.metadata?.lastSignInTime ?? null,
          providerIds: Array.isArray(rec.providerData) ? rec.providerData.map((p) => p.providerId).filter(Boolean) : [],
        };
      } catch {}
    }

    return new Response(
      JSON.stringify({ id: docRefId, data, auth: authMeta }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


