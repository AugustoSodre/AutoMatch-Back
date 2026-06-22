import supabaseAdmin, { SupabaseClient } from "../lib/supabase.js";
import { CarRow, MatchFormatted, SavedMatchRow } from "../types/index.js";

function formatMatch(row: SavedMatchRow & { car: CarRow }): MatchFormatted {
  return {
    id: row.id,
    car: {
      id: row.car.id,
      name: row.car.name,
      year: row.car.year,
      price: row.car.price,
      category: row.car.category,
      specs: {
        engine: row.car.engine,
        power: row.car.power,
        consumption: row.car.consumption,
        weight: row.car.weight,
      },
      costs: {
        ipva: row.car.ipva,
        insurance: row.car.insurance,
        maintenance: row.car.maintenance,
      },
      features: row.car.features || [],
      images: {
        main: row.car.main_image,
        thumbnails: row.car.thumbnail_images || [],
      },
    },
    savedAt: row.saved_at,
    matchPercentage: row.match_percentage,
  };
}

export async function getUserMatches(userId: string, client?: SupabaseClient): Promise<MatchFormatted[]> {
  const db = client || supabaseAdmin;
  const { data, error } = await db
    .from("saved_matches")
    .select("*, car:cars(*)")
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });

  if (error) {
    console.error("[MatchService] getMatches error:", error);
    return [];
  }

  return ((data as unknown as (SavedMatchRow & { car: CarRow })[]) || []).map(formatMatch);
}

export async function upsertMatch(
  userId: string,
  carId: string,
  matchPercentage: number,
  client?: SupabaseClient
): Promise<MatchFormatted | null> {
  const db = client || supabaseAdmin;
  const { data, error } = await db
    .from("saved_matches")
    .upsert(
      {
        user_id: userId,
        car_id: carId,
        match_percentage: matchPercentage,
      },
      {
        onConflict: "user_id, car_id",
        ignoreDuplicates: false,
      }
    )
    .select("*, car:cars(*)")
    .single();

  if (error) {
    console.error("[MatchService] upsertMatch error:", error);
    return null;
  }

  return formatMatch(data as unknown as SavedMatchRow & { car: CarRow });
}

export async function createMatch(
  userId: string,
  carId: string,
  matchPercentage: number,
  client?: SupabaseClient
): Promise<MatchFormatted | null> {
  const db = client || supabaseAdmin;
  const { data, error } = await db
    .from("saved_matches")
    .insert({
      user_id: userId,
      car_id: carId,
      match_percentage: matchPercentage,
    })
    .select("*, car:cars(*)")
    .single();

  if (error) {
    console.error("[MatchService] createMatch error:", error);
    return null;
  }

  return formatMatch(data as unknown as SavedMatchRow & { car: CarRow });
}

export async function getMatchByUserAndCar(
  userId: string,
  carId: string,
  client?: SupabaseClient
): Promise<(SavedMatchRow & { car: CarRow }) | null> {
  const db = client || supabaseAdmin;
  const { data, error } = await db
    .from("saved_matches")
    .select("*, car:cars(*)")
    .eq("user_id", userId)
    .eq("car_id", carId)
    .maybeSingle();

  if (error) return null;
  return data as unknown as (SavedMatchRow & { car: CarRow }) | null;
}

export async function deleteMatch(matchId: string, client?: SupabaseClient): Promise<boolean> {
  const db = client || supabaseAdmin;
  const { error } = await db
    .from("saved_matches")
    .delete()
    .eq("id", matchId);

  if (error) {
    console.error("[MatchService] deleteMatch error:", error);
    return false;
  }

  return true;
}

export async function deleteMatchesByCarId(carId: string, client?: SupabaseClient): Promise<boolean> {
  const db = client || supabaseAdmin;
  const { error } = await db
    .from("saved_matches")
    .delete()
    .eq("car_id", carId);

  if (error) {
    console.error("[MatchService] deleteMatchesByCarId error:", error);
    return false;
  }

  return true;
}
