import supabaseAdmin, { SupabaseClient } from "../lib/supabase.js";
import { CarRow, CarFormatted } from "../types/index.js";

function formatCar(row: CarRow): CarFormatted {
  return {
    id: row.id,
    name: row.name,
    year: row.year,
    price: row.price,
    category: row.category,
    specs: {
      engine: row.engine,
      power: row.power,
      consumption: row.consumption,
      weight: row.weight,
    },
    costs: {
      ipva: row.ipva,
      insurance: row.insurance,
      maintenance: row.maintenance,
    },
    features: row.features || [],
    images: {
      main: row.main_image,
      thumbnails: row.thumbnail_images || [],
    },
  };
}

export async function getAllCars(): Promise<CarFormatted[]> {
  const { data, error } = await supabaseAdmin
    .from("cars")
    .select("*")
    .order("name");

  if (error) {
    console.error("[CarService] getAllCars error:", error);
    return [];
  }

  return ((data as unknown as CarRow[]) || []).map(formatCar);
}

export async function getCarById(id: string): Promise<CarFormatted | null> {
  const { data, error } = await supabaseAdmin
    .from("cars")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[CarService] getCarById error:", error);
    return null;
  }

  return formatCar(data as unknown as CarRow);
}

export async function getCarRowById(id: string): Promise<CarRow | null> {
  const { data, error } = await supabaseAdmin
    .from("cars")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as unknown as CarRow;
}

export async function createCar(car: CarFormatted & { id: string }, client?: SupabaseClient): Promise<CarFormatted | null> {
  const db = client || supabaseAdmin;
  const { data, error } = await db
    .from("cars")
    .insert({
      id: car.id,
      name: car.name,
      year: car.year,
      price: car.price,
      category: car.category,
      engine: car.specs.engine,
      power: car.specs.power,
      consumption: car.specs.consumption,
      weight: car.specs.weight,
      ipva: car.costs.ipva,
      insurance: car.costs.insurance,
      maintenance: car.costs.maintenance,
      features: JSON.stringify(car.features),
      main_image: car.images.main,
      thumbnail_images: JSON.stringify(car.images.thumbnails),
    })
    .select()
    .single();

  if (error) {
    console.error("[CarService] createCar error:", error);
    return null;
  }

  return formatCar(data as unknown as CarRow);
}

export async function updateCar(id: string, car: Partial<CarFormatted>, client?: SupabaseClient): Promise<CarFormatted | null> {
  const updateData: Record<string, unknown> = {};

  if (car.name !== undefined) updateData.name = car.name;
  if (car.year !== undefined) updateData.year = car.year;
  if (car.price !== undefined) updateData.price = car.price;
  if (car.category !== undefined) updateData.category = car.category;
  if (car.specs) {
    if (car.specs.engine !== undefined) updateData.engine = car.specs.engine;
    if (car.specs.power !== undefined) updateData.power = car.specs.power;
    if (car.specs.consumption !== undefined) updateData.consumption = car.specs.consumption;
    if (car.specs.weight !== undefined) updateData.weight = car.specs.weight;
  }
  if (car.costs) {
    if (car.costs.ipva !== undefined) updateData.ipva = car.costs.ipva;
    if (car.costs.insurance !== undefined) updateData.insurance = car.costs.insurance;
    if (car.costs.maintenance !== undefined) updateData.maintenance = car.costs.maintenance;
  }
  if (car.features !== undefined) updateData.features = JSON.stringify(car.features);
  if (car.images) {
    if (car.images.main !== undefined) updateData.main_image = car.images.main;
    if (car.images.thumbnails !== undefined) updateData.thumbnail_images = JSON.stringify(car.images.thumbnails);
  }

  const db = client || supabaseAdmin;
  const { data, error } = await db
    .from("cars")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[CarService] updateCar error:", error);
    return null;
  }

  return formatCar(data as unknown as CarRow);
}

export async function deleteCar(id: string, client?: SupabaseClient): Promise<boolean> {
  const db = client || supabaseAdmin;
  const { error } = await db
    .from("cars")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[CarService] deleteCar error:", error);
    return false;
  }

  return true;
}

export async function getAllCarsRaw(): Promise<CarRow[]> {
  const { data, error } = await supabaseAdmin
    .from("cars")
    .select("*")
    .order("name");

  if (error) {
    console.error("[CarService] getAllCarsRaw error:", error);
    return [];
  }

  return (data as unknown as CarRow[]) || [];
}
