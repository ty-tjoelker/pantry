"use client";

import { useMemo, useState } from "react";
import AddItemInput from "./add-item-input";
import PantryRow from "./pantry-row";
import { useToast } from "./toast";
import { addToPantry, adjustPantryQuantity, deleteFromPantry, getPantry } from "@/lib/db/pantry";
import { addGroceryItemByItemId } from "@/lib/db/grocery-list";
import { findOrCreateItem, updateItemDietaryTags } from "@/lib/db/items";
import type { DietaryRestriction } from "@/types/dietary-restriction";
import type { Item } from "@/types/item";
import type { PantryEntryWithItem, PantryLocation } from "@/types/pantry";

const LOCATIONS: { key: PantryLocation; label: string }[] = [
  { key: "pantry", label: "Pantry" },
  { key: "fridge", label: "Fridge" },
  { key: "freezer", label: "Freezer" },
];

export default function PantryList({
  initialItems,
  restrictions,
}: {
  initialItems: PantryEntryWithItem[];
  restrictions: DietaryRestriction[];
}) {
  const [entries, setEntries] = useState(initialItems);
  const showToast = useToast();

  const sections = useMemo(
    () =>
      LOCATIONS.map((loc) => {
        const locationItems = entries.filter((e) => e.location === loc.key);
        const groups = new Map<string, PantryEntryWithItem[]>();
        for (const entry of locationItems) {
          const key = entry.item.category?.trim() || "Other";
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key)!.push(entry);
        }
        const categories = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
        return { ...loc, categories, count: locationItems.length };
      }),
    [entries],
  );

  async function refresh() {
    setEntries(await getPantry());
  }

  async function handleAdjust(entry: PantryEntryWithItem, delta: number) {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entry.id ? { ...e, quantity: Math.max(0, e.quantity + delta) } : e,
      ),
    );
    try {
      await adjustPantryQuantity(entry.id, delta);
    } catch {
      await refresh();
    }
  }

  async function handleToggleDietaryTag(entry: PantryEntryWithItem, tag: string) {
    const active = entry.item.dietary_tags.includes(tag);
    const nextTags = active
      ? entry.item.dietary_tags.filter((t) => t !== tag)
      : [...entry.item.dietary_tags, tag];

    setEntries((prev) =>
      prev.map((e) =>
        e.item_id === entry.item_id ? { ...e, item: { ...e.item, dietary_tags: nextTags } } : e,
      ),
    );
    try {
      await updateItemDietaryTags(entry.item_id, nextTags);
    } catch {
      await refresh();
    }
  }

  async function handleDelete(entry: PantryEntryWithItem) {
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    showToast("Removed from pantry");
    try {
      await deleteFromPantry(entry.id);
    } catch {
      await refresh();
    }
  }

  async function handleAddToGroceryList(entry: PantryEntryWithItem) {
    showToast("Added to list");
    try {
      await addGroceryItemByItemId(entry.item_id, entry.unit, 1);
    } catch {
      // Grocery list re-fetches on its own next visit; nothing local to roll back here.
    }
  }

  async function handleAddByName(name: string) {
    const item = await findOrCreateItem(name);
    await addToPantry(item.id, 1, item.default_unit);
    showToast("Added to pantry");
    await refresh();
  }

  async function handleAddItem(item: Item) {
    await addToPantry(item.id, 1, item.default_unit);
    showToast("Added to pantry");
    await refresh();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-4 pt-4">
        <AddItemInput onAddByName={handleAddByName} onAddItem={handleAddItem} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
        {entries.length === 0 && (
          <p className="mt-12 text-center text-zinc-500 dark:text-zinc-400">Your pantry is empty.</p>
        )}
        {sections.map((section) =>
          section.count === 0 ? null : (
            <div key={section.key} className="mt-4">
              <h2 className="px-4 pb-1 text-sm font-semibold">{section.label}</h2>
              {section.categories.map(([category, items]) => (
                <div key={category} className="mt-2">
                  <h3 className="px-4 pb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {category}
                  </h3>
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {items.map((entry) => (
                      <PantryRow
                        key={entry.id}
                        entry={entry}
                        restrictions={restrictions}
                        onAdjust={(delta) => handleAdjust(entry, delta)}
                        onAddToGroceryList={() => handleAddToGroceryList(entry)}
                        onToggleDietaryTag={(tag) => handleToggleDietaryTag(entry, tag)}
                        onDelete={() => handleDelete(entry)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
