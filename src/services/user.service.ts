import supabaseAdmin from "../lib/supabase.js";
import { ProfileRow } from "../types/index.js";

export async function getProfileByEmail(email: string): Promise<ProfileRow | null> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (error) return null;
  return data as unknown as ProfileRow;
}

export async function getProfileById(id: string): Promise<ProfileRow | null> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[UserService] getProfileById error:", error);
    return null;
  }
  return data as unknown as ProfileRow;
}

export async function getAllUsers(): Promise<ProfileRow[]> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[UserService] getAllUsers error:", error);
    return [];
  }
  return (data as unknown as ProfileRow[]) || [];
}

export async function updateProfile(id: string, updates: Partial<ProfileRow>): Promise<ProfileRow | null> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[UserService] updateProfile error:", error);
    return null;
  }
  return data as unknown as ProfileRow;
}

export async function updateUserRole(id: string, role: "USER" | "ADMIN"): Promise<ProfileRow | null> {
  return updateProfile(id, { role } as Partial<ProfileRow>);
}
