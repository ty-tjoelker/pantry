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
