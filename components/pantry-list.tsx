"use client";

import { useMemo, useState } from "react";
import PantryRow from "./pantry-row";
import { adjustPantryQuantity, getPantry } from "@/lib/db/pantry";
import { addGroceryItemByItemId } from "@/lib/db/grocery-list";
import type { PantryEntryWithItem, PantryLocation } from "@/types/pantry";

const LOCATIONS: { key: PantryLocation; label: string }[] = [
  { key: "pantry", label: "Pantry" },
  { key: "fridge", label: "Fridge" },
  { key: "freezer", label: "Freezer" },
];

export default function PantryList({
  initialItems,
}: {
  initialItems: PantryEntryWithItem[];
}) {
  const [entries, setEntries] = useState(initialItems);

  const sections = useMemo(
    () =>
      LOCATIONS.map((loc) => ({
        ...loc,
        items: entries.filter((e) => e.location === loc.key),
      })),
    [entries],
  );

  async function handleAdjust(entry: PantryEntryWithItem, delta: number) {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entry.id ? { ...e, quantity: Math.max(0, e.quantity + delta) } : e,
      ),
    );
    try {
      await adjustPantryQuantity(entry.id, delta);
    } catch {
      setEntries(await getPantry());
    }
  }

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      {entries.length === 0 && (
        <p className="mt-12 text-center text-zinc-500 dark:text-zinc-400">Your pantry is empty.</p>
      )}
      {sections.map((section) =>
        section.items.length === 0 ? null : (
          <div key={section.key} className="mt-4">
            <h2 className="px-4 pb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {section.label}
            </h2>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {section.items.map((entry) => (
                <PantryRow
                  key={entry.id}
                  entry={entry}
                  onAdjust={(delta) => handleAdjust(entry, delta)}
                  onAddToGroceryList={() =>
                    addGroceryItemByItemId(entry.item_id, entry.unit)
                  }
                />
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
