import type { Item } from "./item";

export type PantryLocation = "pantry" | "fridge" | "freezer";

export interface PantryEntry {
  id: string;
  item_id: string;
  quantity: number;
  unit: string | null;
  location: PantryLocation;
  expires_on: string | null;
  updated_at: string;
}

export interface PantryEntryWithItem extends PantryEntry {
  item: Item;
}
