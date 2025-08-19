export const runtime = "nodejs";
import { cookies } from "next/headers";
import type { DecodedIdToken } from "firebase-admin/auth";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export type Actor = {
  uid: string;
  email: string | null | undefined;
  token: DecodedIdToken;
};

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  const altHeader = request.headers.get("x-firebase-id-token");
  if (altHeader) return altHeader;
  try {
    const jar = cookies();
    const session = jar.get("__session")?.value;
    if (session) return session;
  } catch (_) {}
  return null;
}

async function isEmailAdmin(email?: string | null): Promise<boolean> {
  if (!email) return false;
  const ref = adminDb().collection("admins").doc(email.toLowerCase());
  const snap = await ref.get();
  return snap.exists && Boolean((snap.data() as { admin?: boolean } | undefined)?.admin);
}

export async function requireAdmin(request: Request): Promise<Actor> {
  const tokenStr = extractBearerToken(request);
  if (!tokenStr) throw new HttpError(401, "Missing Bearer token");
  let decoded: DecodedIdToken;
  try {
    decoded = await adminAuth().verifyIdToken(tokenStr, true);
  } catch (_) {
    throw new HttpError(401, "Invalid or expired token");
  }

  const claimIsAdmin =
    decoded.role === "admin" ||
    (decoded as any).admin === true ||
    (Array.isArray((decoded as any).roles) && (decoded as any).roles.includes("admin"));

  const listedAsAdmin = await isEmailAdmin(decoded.email ?? null);
  if (!claimIsAdmin && !listedAsAdmin) {
    throw new HttpError(403, "Admin access required");
  }

  return { uid: decoded.uid, email: decoded.email ?? null, token: decoded };
}

// Simple idempotency guard using Firestore doc creation semantics
export async function ensureIdempotency(request: Request, namespace: string, keyField = "x-idempotency-key") {
  const key = request.headers.get(keyField);
  if (!key) return null;
  const id = `${namespace}:${key}`;
  const ref = adminDb().collection("adminIdempotency").doc(id);
  try {
    await ref.create({ id, namespace, createdAt: Date.now() });
    return { id } as const;
  } catch (e: any) {
    // Firestore ALREADY_EXISTS code is 6; message contains 'already exists'
    if (e?.code === 6 || (typeof e?.message === "string" && e.message.toLowerCase().includes("already exists"))) {
      throw new HttpError(409, "Idempotency key already used");
    }
    throw e;
  }
}
