export const runtime = "nodejs";
import { adminDb } from "@/lib/firebase/admin";
import { ensureIdempotency, HttpError, json, requireAdmin } from "@/lib/server/adminAuth";
import { purgeUserData } from "@/lib/server/userPurge";

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

export async function DELETE(request: Request, ctx: { params: Promise<{ uid: string }> }) {
  try {
    const actor = await requireAdmin(request);
    const { uid } = await ctx.params;
    if (!uid || typeof uid !== "string") throw new HttpError(400, "Path param :uid is required");

    await ensureIdempotency(request, `user.delete:${uid}`);

    const results = await purgeUserData(uid);

    await writeAudit(actor, uid, "delete", { results });

    return json({ status: "deleted" }, 200);
  } catch (e: any) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    const message = typeof e?.message === "string" ? e.message : "Internal Server Error";
    return json({ error: message }, 500);
  }
}
