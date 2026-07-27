import { supabase } from "./client";
import { getRestrictions } from "./dietary-restrictions";
import { guessCategory, guessDietaryTags } from "../item-heuristics";
import type { Item } from "@/types/item";

export async function searchItems(query: string): Promise<Item[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .ilike("name", `%${trimmed}%`)
    .order("name", { ascending: true })
    .limit(8);

  if (error) throw new Error(error.message);
  return data as Item[];
}

export async function getStapleItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("is_staple", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data as Item[];
}

export async function findOrCreateItem(name: string): Promise<Item> {
  const trimmed = name.trim();

  const { data: existing, error: findError } = await supabase
    .from("items")
    .select("*")
    .ilike("name", trimmed)
    .maybeSingle();

  if (findError) throw new Error(findError.message);
  if (existing) return existing as Item;

  const restrictions = await getRestrictions();
  const { data: created, error: createError } = await supabase
    .from("items")
    .insert({
      name: trimmed,
      category: guessCategory(trimmed),
      dietary_tags: guessDietaryTags(trimmed, restrictions),
    })
    .select()
    .single();

  if (createError) throw new Error(createError.message);
  return created as Item;
}

export async function updateItemDietaryTags(itemId: string, tags: string[]): Promise<void> {
  const { error } = await supabase.from("items").update({ dietary_tags: tags }).eq("id", itemId);
  if (error) throw new Error(error.message);
}

export async function updateItemCategory(itemId: string, category: string | null): Promise<void> {
  const { error } = await supabase.from("items").update({ category }).eq("id", itemId);
  if (error) throw new Error(error.message);
}

/** Every distinct category currently in use, so the category editor can suggest existing
 * ones — typing anything else just creates a new category, since it's a plain text column. */
export async function getDistinctCategories(): Promise<string[]> {
  const { data, error } = await supabase.from("items").select("category").not("category", "is", null);
  if (error) throw new Error(error.message);
  const set = new Set(
    (data as { category: string }[]).map((row) => row.category.trim()).filter(Boolean),
  );
  return [...set].sort((a, b) => a.localeCompare(b));
}
