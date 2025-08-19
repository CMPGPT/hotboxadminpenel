export const runtime = "nodejs";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { ensureIdempotency, HttpError, json, requireAdmin } from "@/lib/server/adminAuth";

const ALLOWED_RESTRICTIONS = ["ALL", "CHAT", "LOUNGES"] as const;

type Restriction = (typeof ALLOWED_RESTRICTIONS)[number];

type SuspendBody = {
  reason?: string;
  restrictions?: Restriction[];
  loungeIds?: string[];
  channel?: string;
};

function validatePayload(body: SuspendBody) {
  const reason = (body.reason ?? "").trim();
  if (!reason || reason.length < 3) throw new HttpError(400, "reason is required (min 3 chars)");

  const raw = Array.isArray(body.restrictions) ? body.restrictions : (["ALL"] as Restriction[]);
  const invalid = raw.filter((r) => !ALLOWED_RESTRICTIONS.includes(r));
  if (invalid.length) throw new HttpError(400, `Invalid restrictions: ${invalid.join(",")}`);

  let restrictions: Restriction[] = Array.from(new Set(raw));
  let loungeIds: string[] = Array.isArray(body.loungeIds) ? body.loungeIds.filter(Boolean) : [];
  const channel = typeof body.channel === "string" ? body.channel.trim() : "";

  if (restrictions.includes("ALL")) {
    restrictions = ["ALL"];
    loungeIds = [];
  }
  if (restrictions.includes("LOUNGES") && loungeIds.length === 0) {
    throw new HttpError(400, "loungeIds required when restrictions include LOUNGES");
  }

  return { reason, restrictions, loungeIds, channel } as const;
}

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
    
    // Debug logging to understand actor email issue
    console.log('DEBUG: Actor info from JWT token:', {
      uid: actor.uid,
      email: actor.email,
      tokenEmail: actor.token.email,
      tokenSub: actor.token.sub
    });
    
    const { uid } = await ctx.params;
    if (!uid || typeof uid !== "string") throw new HttpError(400, "Path param :uid is required");

    await ensureIdempotency(request, `user.suspend:${uid}`);

    const body = (await request.json().catch(() => ({}))) as SuspendBody;
    const { reason, restrictions, loungeIds, channel } = validatePayload(body);

    const userRef = adminDb().collection("users").doc(uid);
    await userRef.set(
      {
        suspension: {
          active: true,
          reason,
          restrictions,
          loungeIds,
          channel,
        },
      },
      { merge: true }
    );

    const userRecord = await adminAuth().getUser(uid).catch(() => null);
    const response = {
      uid,
      email: userRecord?.email ?? null,
      disabled: Boolean(userRecord?.disabled),
      suspension: { active: true, reason, restrictions, loungeIds, channel },
    };

    await writeAudit(actor, uid, "suspend", { reason, restrictions, loungeIds, channel });

    return json(response, 200);
  } catch (e: any) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    const message = typeof e?.message === "string" ? e.message : "Internal Server Error";
    return json({ error: message }, 500);
  }
}
