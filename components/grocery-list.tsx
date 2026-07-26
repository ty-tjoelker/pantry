"use client";

import { useMemo, useState } from "react";
import AddItemInput from "./add-item-input";
import GroceryRow from "./grocery-row";
import {
  addGroceryItemByItemId,
  addGroceryItemByName,
  clearChecked,
  deleteGroceryItem,
  getGroceryList,
  setGroceryItemChecked,
} from "@/lib/db/grocery-list";
import type { GroceryListEntryWithItem } from "@/types/grocery-list";
import type { Item } from "@/types/item";

function optimisticEntry(
  tempId: string,
  name: string,
  item?: Item,
): GroceryListEntryWithItem {
  const now = new Date().toISOString();
  return {
    id: tempId,
    item_id: item?.id ?? tempId,
    quantity: 1,
    unit: item?.default_unit ?? null,
    note: null,
    source: "manual",
    checked: false,
    added_at: now,
    checked_at: null,
    item: item ?? { id: tempId, name, default_unit: null, category: null, is_staple: false, created_at: now },
  };
}

function replaceTemp(
  prev: GroceryListEntryWithItem[],
  tempId: string,
  real: GroceryListEntryWithItem,
) {
  const withoutTemp = prev.filter((e) => e.id !== tempId);
  if (withoutTemp.some((e) => e.id === real.id)) return withoutTemp;
  return [...withoutTemp, real];
}

export default function GroceryList({
  initialItems,
}: {
  initialItems: GroceryListEntryWithItem[];
}) {
  const [entries, setEntries] = useState(initialItems);
  const [gotItOpen, setGotItOpen] = useState(false);

  const unchecked = entries.filter((e) => !e.checked);
  const checked = entries.filter((e) => e.checked);

  const grouped = useMemo(() => {
    const groups = new Map<string, GroceryListEntryWithItem[]>();
    for (const entry of unchecked) {
      const key = entry.item.category?.trim() || "Other";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(entry);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [unchecked]);

  async function refresh() {
    setEntries(await getGroceryList());
  }

  async function handleAddByName(name: string) {
    const tempId = `temp-${crypto.randomUUID()}`;
    setEntries((prev) => [...prev, optimisticEntry(tempId, name)]);
    try {
      const real = await addGroceryItemByName(name);
      setEntries((prev) => replaceTemp(prev, tempId, real));
    } catch {
      await refresh();
    }
  }

  async function handleAddItem(item: Item) {
    const tempId = `temp-${crypto.randomUUID()}`;
    setEntries((prev) => [...prev, optimisticEntry(tempId, item.name, item)]);
    try {
      const real = await addGroceryItemByItemId(item.id, item.default_unit);
      setEntries((prev) => replaceTemp(prev, tempId, real));
    } catch {
      await refresh();
    }
  }

  async function handleToggle(entry: GroceryListEntryWithItem) {
    const nextChecked = !entry.checked;
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entry.id
          ? { ...e, checked: nextChecked, checked_at: nextChecked ? new Date().toISOString() : null }
          : e,
      ),
    );
    try {
      await setGroceryItemChecked(entry.id, nextChecked);
    } catch {
      await refresh();
    }
  }

  async function handleDelete(entry: GroceryListEntryWithItem) {
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    try {
      await deleteGroceryItem(entry.id);
    } catch {
      await refresh();
    }
  }

  async function handleClear(moveToPantry: boolean) {
    setEntries((prev) => prev.filter((e) => !e.checked));
    setGotItOpen(false);
    try {
      await clearChecked(moveToPantry);
    } catch {
      await refresh();
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 pt-4">
        <AddItemInput onAddByName={handleAddByName} onAddItem={handleAddItem} />
      </div>
      <div className="flex-1 overflow-y-auto pb-6">
        {grouped.length === 0 && checked.length === 0 && (
          <p className="mt-12 text-center text-zinc-500 dark:text-zinc-400">Your list is empty.</p>
        )}
        {grouped.map(([category, items]) => (
          <div key={category} className="mt-4">
            <h2 className="px-4 pb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {category}
            </h2>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {items.map((entry) => (
                <GroceryRow
                  key={entry.id}
                  entry={entry}
                  onToggle={() => handleToggle(entry)}
                  onDelete={() => handleDelete(entry)}
                />
              ))}
            </div>
          </div>
        ))}
        {checked.length > 0 && (
          <div className="mt-6 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setGotItOpen((v) => !v)}
              aria-expanded={gotItOpen}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-zinc-500"
            >
              <span>Got it ({checked.length})</span>
              <span>{gotItOpen ? "−" : "+"}</span>
            </button>
            {gotItOpen && (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {checked.map((entry) => (
                  <GroceryRow
                    key={entry.id}
                    entry={entry}
                    onToggle={() => handleToggle(entry)}
                    onDelete={() => handleDelete(entry)}
                  />
                ))}
              </div>
            )}
            <div className="flex gap-2 px-4 py-3">
              <button
                type="button"
                onClick={() => handleClear(true)}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white active:bg-emerald-700"
              >
                Move to pantry
              </button>
              <button
                type="button"
                onClick={() => handleClear(false)}
                className="flex-1 rounded-xl border border-zinc-300 py-2.5 text-sm font-medium text-zinc-600 active:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:active:bg-zinc-800"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
