export const runtime = "nodejs";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { ensureIdempotency, HttpError, json, requireAdmin } from "@/lib/server/adminAuth";

async function writeAudit(actor: { uid: string; email: string | null | undefined }, targetUid: string, action: string, payload: unknown) {
  await adminDb().collection("adminAuditLogs").add({
    actorUid: actor.uid,
    actorEmail: actor.email ?? null,
    targetUid,
    action,
    payload,
    timestamp: Date.now(),
  });
}

export async function POST(request: Request, ctx: { params: Promise<{ uid: string }> }) {
  try {
    const actor = await requireAdmin(request);
    const { uid } = await ctx.params;
    if (!uid || typeof uid !== "string") throw new HttpError(400, "Path param :uid is required");

    await ensureIdempotency(request, `user.unsuspend:${uid}`);

    const userRef = adminDb().collection("users").doc(uid);
    await userRef.set(
      {
        suspension: {
          active: false,
          reason: "",
          restrictions: [],
          loungeIds: [],
          channel: "",
        },
      },
      { merge: true }
    );

    const userRecord = await adminAuth().getUser(uid).catch(() => null);
    const response = {
      uid,
      email: userRecord?.email ?? null,
      disabled: Boolean(userRecord?.disabled),
      suspension: { active: false, reason: "", restrictions: [], loungeIds: [], channel: "" },
    };

    await writeAudit(actor, uid, "unsuspend", {});

    return json(response, 200);
  } catch (e: any) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    const message = typeof e?.message === "string" ? e.message : "Internal Server Error";
    return json({ error: message }, 500);
  }
}
