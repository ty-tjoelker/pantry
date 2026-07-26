import { supabase } from "./client";
import type { DietaryRestriction } from "@/types/dietary-restriction";

export async function getRestrictions(): Promise<DietaryRestriction[]> {
  const { data, error } = await supabase
    .from("dietary_restrictions")
    .select("*")
    .order("tag", { ascending: true });

  if (error) throw new Error(error.message);
  return data as DietaryRestriction[];
}

export async function addRestriction(
  tag: string,
  mode: DietaryRestriction["mode"],
): Promise<DietaryRestriction> {
  const normalized = tag.trim().toLowerCase().replace(/\s+/g, "_");
  const { data, error } = await supabase
    .from("dietary_restrictions")
    .insert({ tag: normalized, mode })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DietaryRestriction;
}

export async function deleteRestriction(id: string): Promise<void> {
  const { error } = await supabase.from("dietary_restrictions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
