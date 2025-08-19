export type Suspension = {
  active: boolean;
  reason: string;
  restrictions: Array<"ALL" | "CHAT" | "LOUNGES">;
  loungeIds: string[];
};

export type UserProfile = {
  uid: string;
  email?: string | null;
  suspension?: Partial<Suspension> | null;
};

export function canUserAccess(params: {
  user: UserProfile | null | undefined;
  feature: "ALL" | "CHAT" | "LOUNGES";
  loungeId?: string | null;
}): { allowed: boolean; reason?: string } {
  const { user, feature, loungeId } = params;
  const s: Suspension = {
    active: Boolean(user?.suspension?.active),
    reason: user?.suspension?.reason ?? "",
    restrictions: (user?.suspension?.restrictions as Suspension["restrictions"]) ?? [],
    loungeIds: user?.suspension?.loungeIds ?? [],
  };

  if (!s.active) return { allowed: true };

  // If ALL is present, block everything
  if (s.restrictions.includes("ALL")) {
    return { allowed: false, reason: s.reason || "Suspended" };
  }

  // If feature is CHAT and CHAT is restricted
  if (feature === "CHAT" && s.restrictions.includes("CHAT")) {
    return { allowed: false, reason: s.reason || "Chat access suspended" };
  }

  // If feature is LOUNGES and LOUNGES is restricted
  if (feature === "LOUNGES" && s.restrictions.includes("LOUNGES")) {
    if (!loungeId) return { allowed: false, reason: s.reason || "Lounge access suspended" };
    // If lounge list provided, only those lounges are restricted; otherwise, all lounges restricted
    if (s.loungeIds.length === 0) return { allowed: false, reason: s.reason || "Lounge access suspended" };
    if (s.loungeIds.includes(loungeId)) return { allowed: false, reason: s.reason || "Lounge access suspended" };
  }

  return { allowed: true };
}
