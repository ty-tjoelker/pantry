import { supabase } from "./client";
import { findOrCreateItem } from "./items";
import { addToPantry } from "./pantry";
import type { GroceryListEntryWithItem } from "@/types/grocery-list";

export async function getGroceryList(): Promise<GroceryListEntryWithItem[]> {
  const { data, error } = await supabase
    .from("grocery_list")
    .select("*, item:items(*)")
    .order("added_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data as unknown as GroceryListEntryWithItem[];
}

export async function addGroceryItemByName(
  name: string,
): Promise<GroceryListEntryWithItem> {
  const item = await findOrCreateItem(name);
  return addGroceryItemByItemId(item.id, item.default_unit);
}

export async function addGroceryItemByItemId(
  itemId: string,
  unit: string | null = null,
): Promise<GroceryListEntryWithItem> {
  const { data: existing, error: findError } = await supabase
    .from("grocery_list")
    .select("*, item:items(*)")
    .eq("item_id", itemId)
    .eq("checked", false)
    .maybeSingle();

  if (findError) throw new Error(findError.message);
  if (existing) return existing as unknown as GroceryListEntryWithItem;

  const { data, error } = await supabase
    .from("grocery_list")
    .insert({ item_id: itemId, unit })
    .select("*, item:items(*)")
    .single();

  if (error) throw new Error(error.message);
  return data as unknown as GroceryListEntryWithItem;
}

export async function setGroceryItemChecked(id: string, checked: boolean) {
  const { error } = await supabase
    .from("grocery_list")
    .update({ checked, checked_at: checked ? new Date().toISOString() : null })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteGroceryItem(id: string) {
  const { error } = await supabase.from("grocery_list").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function clearChecked(moveToPantry: boolean) {
  const { data: checkedItems, error: fetchError } = await supabase
    .from("grocery_list")
    .select("*, item:items(*)")
    .eq("checked", true);

  if (fetchError) throw new Error(fetchError.message);
  const rows = checkedItems as unknown as GroceryListEntryWithItem[];

  if (moveToPantry) {
    for (const row of rows) {
      await addToPantry(row.item_id, row.quantity, row.unit);
    }
  }

  const { error: deleteError } = await supabase
    .from("grocery_list")
    .delete()
    .eq("checked", true);

  if (deleteError) throw new Error(deleteError.message);
}
