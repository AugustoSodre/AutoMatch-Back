import { Request, Response, NextFunction } from "express";
import supabaseAdmin from "../lib/supabase.js";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
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

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: "Token inválido ou expirado" });
      return;
    }

    req.userId = user.id;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    req.userRole = (profile as { role: string } | null)?.role || "USER";
    next();
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado" });
  }
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
