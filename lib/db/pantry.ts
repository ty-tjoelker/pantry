import { supabase } from "./client";
import type { PantryEntryWithItem, PantryLocation } from "@/types/pantry";

export async function getPantry(): Promise<PantryEntryWithItem[]> {
  const { data, error } = await supabase
    .from("pantry")
    .select("*, item:items(*)")
    .order("location", { ascending: true });

  if (error) throw new Error(error.message);
  return data as unknown as PantryEntryWithItem[];
}

export async function addToPantry(
  itemId: string,
  quantity: number,
  unit: string | null,
  location: PantryLocation = "pantry",
) {
  const { data: existing, error: findError } = await supabase
    .from("pantry")
    .select("*")
    .eq("item_id", itemId)
    .eq("location", location)
    .maybeSingle();

  if (findError) throw new Error(findError.message);

  if (existing) {
    const { error } = await supabase
      .from("pantry")
      .update({ quantity: existing.quantity + quantity, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase
    .from("pantry")
    .insert({ item_id: itemId, quantity, unit, location });
  if (error) throw new Error(error.message);
}

export async function adjustPantryQuantity(id: string, delta: number) {
  const { data: existing, error: findError } = await supabase
    .from("pantry")
    .select("quantity")
    .eq("id", id)
    .single();

  if (findError) throw new Error(findError.message);

  const quantity = Math.max(0, existing.quantity + delta);

  const { error } = await supabase
    .from("pantry")
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
