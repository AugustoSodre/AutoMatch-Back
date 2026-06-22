import { Request, Response, NextFunction } from "express";
import supabaseAdmin, { createAuthClient } from "../lib/supabase.js";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

function decodeJwtPayload(
  token: string,
): { sub?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8"),
    );
    if (payload.exp && Date.now() >= payload.exp * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token não fornecido" });
    return;
  }

  const token = header.slice(7);

  // Strategy 1: Use admin client with service role key (local dev)
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (!error && user) {
      req.userId = user.id;

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      req.userRole = (profile as { role: string } | null)?.role || "USER";
      next();
      return;
    }
  } catch (e) {
    console.warn("[Auth] Service-role auth failed, falling back to JWT decode:", e);
  }

  // Strategy 2: Decode JWT locally (Vercel without SUPABASE_SERVICE_KEY)
  const payload = decodeJwtPayload(token);
  if (!payload?.sub) {
    res.status(401).json({ error: "Token inválido ou expirado" });
    return;
  }

  req.userId = payload.sub;
  req.userRole = "USER";

  try {
    const authClient = createAuthClient(token);
    const { data: profile } = await authClient
      .from("profiles")
      .select("role")
      .eq("id", payload.sub)
      .single();
    req.userRole = (profile as { role: string } | null)?.role || "USER";
  } catch (err) {
    console.error("[Auth] Error fetching profile with anon client:", err);
  }

  next();
}

export async function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  await requireAuth(req, res, () => {
    if (req.userRole !== "ADMIN") {
      res.status(403).json({ error: "Acesso restrito a administradores" });
      return;
    }
    next();
  });
}
