export const runtime = "nodejs";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

type CreateUserRequest = {
  email?: string;
  password?: string;
};

function getFirebaseApiKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_FIREBASE_API_KEY environment variable");
  }
  return apiKey;
}

function validateRequestBody(body: CreateUserRequest): { email: string; password: string } {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid JSON body");
  }
  const { email, password } = body;
  if (!email || typeof email !== "string") {
    throw new Error("'email' is required");
  }
  if (!password || typeof password !== "string") {
    throw new Error("'password' is required");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  return { email, password };
}

function isAuthorized(request: Request): boolean {
  const configuredSecret = process.env.ADMIN_API_SECRET;
  if (!configuredSecret) return true; // If no secret configured, allow for development convenience
  const providedSecret = request.headers.get("x-admin-secret");
  return Boolean(providedSecret && providedSecret === configuredSecret);
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = (await request.json()) as CreateUserRequest;
    const { email, password } = validateRequestBody(body);

    try {
      const userRecord = await adminAuth().createUser({ email, password, emailVerified: true, disabled: false });
      await adminDb().collection("admins").doc(email.toLowerCase()).set({
        admin: true,
        email: email.toLowerCase(),
        createdAt: Date.now(),
      }, { merge: true });

      return new Response(
        JSON.stringify({ id: userRecord.uid, email: userRecord.email, admin: true }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message.includes("email-already-exists")) {
        return new Response(JSON.stringify({ error: "Email already exists" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw e;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


