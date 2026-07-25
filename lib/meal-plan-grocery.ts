import { convert, unitsAreConvertible } from "./units";
import type { PantryEntryWithItem } from "@/types/pantry";
import type { Item } from "@/types/item";
import type { RecipeWithIngredients } from "@/types/recipe";

export interface GroceryPreviewRow {
  key: string;
  itemId: string;
  itemName: string;
  quantity: number | null;
  unit: string | null;
  reason: "recipe" | "staple";
}

interface Line {
  quantity: number | null;
  unit: string | null;
}

interface CombinedNeed {
  itemId: string;
  itemName: string;
  lines: Line[];
}

/**
 * Combines every ingredient across the week's planned recipes, subtracts what's already
 * in the pantry, and adds missing staples. Pure function — no data fetching — so the
 * result can be shown to the user for review before anything is written.
 */
export function buildGroceryPreview(
  plannedRecipes: RecipeWithIngredients[],
  pantry: PantryEntryWithItem[],
  staples: Item[],
): GroceryPreviewRow[] {
  const needs = new Map<string, CombinedNeed>();

  for (const recipe of plannedRecipes) {
    for (const ingredient of recipe.ingredients) {
      const line: Line = { quantity: ingredient.quantity, unit: ingredient.unit };
      const existing = needs.get(ingredient.item_id);
      if (existing) {
        existing.lines.push(line);
      } else {
        needs.set(ingredient.item_id, {
          itemId: ingredient.item_id,
          itemName: ingredient.item.name,
          lines: [line],
        });
      }
    }
  }

  const pantryByItem = new Map<string, PantryEntryWithItem[]>();
  for (const entry of pantry) {
    if (!pantryByItem.has(entry.item_id)) pantryByItem.set(entry.item_id, []);
    pantryByItem.get(entry.item_id)!.push(entry);
  }

  const rows: GroceryPreviewRow[] = [];

  for (const need of needs.values()) {
    const have = pantryByItem.get(need.itemId) ?? [];
    for (const line of mergeLines(need.lines)) {
      const remaining = subtractPantry(line, have);
      if (remaining.quantity !== null && remaining.quantity <= 0) continue;
      rows.push({
        key: `${need.itemId}-${remaining.unit ?? "none"}`,
        itemId: need.itemId,
        itemName: need.itemName,
        quantity: remaining.quantity,
        unit: remaining.unit,
        reason: "recipe",
      });
    }
  }

  for (const staple of staples) {
    if (needs.has(staple.id)) continue; // already accounted for above, satisfied or not
    const have = pantryByItem.get(staple.id) ?? [];
    const totalHave = have.reduce((sum, p) => sum + p.quantity, 0);
    if (totalHave > 0) continue;
    rows.push({
      key: `${staple.id}-staple`,
      itemId: staple.id,
      itemName: staple.name,
      quantity: 1,
      unit: staple.default_unit,
      reason: "staple",
    });
  }

  return rows;
}

function mergeLines(lines: Line[]): Line[] {
  const merged: Line[] = [];
  for (const line of lines) {
    const target = merged.find((m) => canMerge(m, line));
    if (target) {
      target.quantity = addQuantities(target, line);
    } else {
      merged.push({ ...line });
    }
  }
  return merged;
}

function canMerge(a: Line, b: Line): boolean {
  if (a.unit === b.unit) return true;
  if (a.unit && b.unit) return unitsAreConvertible(a.unit, b.unit);
  return false;
}

function addQuantities(target: Line, line: Line): number | null {
  if (target.quantity === null || line.quantity === null) return null;
  if (target.unit === line.unit) return target.quantity + line.quantity;
  const converted = convert(line.quantity, line.unit!, target.unit!);
  return converted === null ? null : target.quantity + converted;
}

function subtractPantry(need: Line, have: PantryEntryWithItem[]): Line {
  if (have.length === 0) return need;
  if (need.quantity === null) {
    // Can't quantify the need precisely — if the pantry has any at all, assume it's covered.
    return have.some((p) => p.quantity > 0) ? { quantity: 0, unit: need.unit } : need;
  }

  let haveInNeedUnit = 0;
  let sawUnconvertible = false;

  for (const entry of have) {
    if (entry.quantity <= 0) continue;
    if (!need.unit || !entry.unit) {
      if (!need.unit && !entry.unit) haveInNeedUnit += entry.quantity;
      else sawUnconvertible = true;
      continue;
    }
    if (entry.unit === need.unit) {
      haveInNeedUnit += entry.quantity;
      continue;
    }
    const converted = convert(entry.quantity, entry.unit, need.unit);
    if (converted === null) sawUnconvertible = true;
    else haveInNeedUnit += converted;
  }

  // Couldn't reliably compare pantry to what's needed — keep the full need visible.
  if (sawUnconvertible && haveInNeedUnit === 0) return need;

  return { quantity: Math.max(0, need.quantity - haveInNeedUnit), unit: need.unit };
}
