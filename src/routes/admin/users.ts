import { Router } from "express";
import { z } from "zod";
import * as userService from "../../services/user.service.js";
import { requireAdmin, AuthRequest } from "../../middleware/auth.js";
import { AppError } from "../../middleware/error.js";
import { getAuthClientFromRequest } from "../../lib/supabase.js";

const router = Router();

router.get("/", requireAdmin, async (_req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    const mapped = users.map(u => ({
      id: u.id,
      firstName: u.first_name,
      surname: u.surname,
      email: u.email,
      role: u.role,
      avatarUrl: u.avatar_url,
      createdAt: u.created_at,
    }));
    res.json(mapped);
  } catch (err) {
    next(err);
  }
});

const roleSchema = z.object({
  role: z.enum(["USER", "ADMIN"], { message: "Role deve ser USER ou ADMIN" }),
});

router.put("/:id/role", requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { role } = roleSchema.parse(req.body);

    const targetId = String(req.params.id);

    if (targetId === req.userId) {
      throw new AppError(400, "Você não pode alterar sua própria role");
    }

    const profile = await userService.getProfileById(targetId);
    if (!profile) {
      throw new AppError(404, "Usuário não encontrado");
    }

    const authClient = getAuthClientFromRequest(req);
    const updated = await userService.updateUserRole(targetId, role, authClient || undefined);
    if (!updated) {
      throw new AppError(500, "Erro ao atualizar role");
    }

    res.json({
      id: updated.id,
      firstName: updated.first_name,
      surname: updated.surname,
      email: updated.email,
      role: updated.role,
      avatarUrl: updated.avatar_url,
      createdAt: updated.created_at,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    next(err);
  }
});

export default router;
