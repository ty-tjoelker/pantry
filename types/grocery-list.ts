import type { Item } from "./item";

export type GrocerySource = "manual" | "meal_plan" | "staple";

export interface GroceryListEntry {
  id: string;
  item_id: string;
  quantity: number;
  unit: string | null;
  note: string | null;
  source: GrocerySource;
  checked: boolean;
  added_at: string;
  checked_at: string | null;
}

export interface GroceryListEntryWithItem extends GroceryListEntry {
  item: Item;
}
