import { Router } from "express";
import { z } from "zod";
import supabaseAdmin, { supabaseAnon } from "../lib/supabase.js";
import { AppError } from "../middleware/error.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  surname: z.string().optional().default(""),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

const updateProfileSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  surname: z.string().optional().default(""),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional(),
});

const updateAvatarSchema = z.object({
  avatarUrl: z.string().min(1, "Imagem inválida"),
});

function formatUser(user: { id: string; email?: string }, profile: { first_name: string; surname: string; role: string; avatar_url: string }) {
  return {
    id: user.id,
    firstName: profile.first_name,
    surname: profile.surname,
    email: user.email || "",
    role: profile.role,
    avatarUrl: profile.avatar_url,
  };
}

router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        firstName: data.firstName,
        surname: data.surname,
      },
    });

    if (createError) {
      if (createError.message.includes("already registered") || createError.message.includes("already exists")) {
        throw new AppError(409, "Email já cadastrado");
      }
      throw new AppError(400, createError.message);
    }

    if (!authData.user) {
      throw new AppError(500, "Erro ao criar usuário");
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    const userData = formatUser(
      authData.user,
      profile || { first_name: data.firstName, surname: data.surname || "", role: "USER", avatar_url: "" }
    );

    const { data: sessionData } = await supabaseAnon.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    res.status(201).json({
      token: sessionData?.session?.access_token || "",
      user: userData,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const { data: authData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError || !authData.session) {
      throw new AppError(401, "Email ou senha inválidos");
    }

    const user = authData.session.user;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const userData = formatUser(
      user,
      profile || { first_name: "", surname: "", role: "USER", avatar_url: "" }
    );

    res.json({
      token: authData.session.access_token,
      user: userData,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    next(err);
  }
});

router.put("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    if (!req.userId) {
      throw new AppError(401, "Token inválido ou expirado");
    }

    const { data: existingUsers } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", data.email)
      .neq("id", req.userId)
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      throw new AppError(409, "Email já cadastrado");
    }

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        first_name: data.firstName,
        surname: data.surname,
      })
      .eq("id", req.userId);

    if (updateError) {
      throw new AppError(500, "Erro ao atualizar perfil");
    }

    if (data.email) {
      const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(
        req.userId,
        { email: data.email }
      );
      if (emailError) {
        console.error("[Auth] Error updating email:", emailError);
      }
    }

    if (data.password) {
      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
        req.userId,
        { password: data.password }
      );
      if (passwordError) {
        console.error("[Auth] Error updating password:", passwordError);
      }
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", req.userId)
      .single();

    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(req.userId);

    const userData = formatUser(
      user || { id: req.userId, email: data.email },
      profile || { first_name: data.firstName, surname: data.surname || "", role: "USER", avatar_url: "" }
    );

    res.json({ user: userData });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    next(err);
  }
});

router.put("/me/avatar", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const data = updateAvatarSchema.parse(req.body);

    if (!req.userId) {
      throw new AppError(401, "Token inválido ou expirado");
    }

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ avatar_url: data.avatarUrl })
      .eq("id", req.userId);

    if (updateError) {
      throw new AppError(500, "Erro ao atualizar avatar");
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", req.userId)
      .single();

    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(req.userId);

    const userData = formatUser(
      user || { id: req.userId },
      profile || { first_name: "", surname: "", role: "USER", avatar_url: data.avatarUrl }
    );

    res.json({ user: userData });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    next(err);
  }
});

export default router;
