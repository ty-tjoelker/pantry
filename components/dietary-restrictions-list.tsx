"use client";

import { useState } from "react";
import { addRestriction, deleteRestriction } from "@/lib/db/dietary-restrictions";
import { useToast } from "./toast";
import type { DietaryRestriction, DietaryRestrictionMode } from "@/types/dietary-restriction";

export default function DietaryRestrictionsList({
  initialRestrictions,
}: {
  initialRestrictions: DietaryRestriction[];
}) {
  const [restrictions, setRestrictions] = useState(initialRestrictions);
  const [tag, setTag] = useState("");
  const [mode, setMode] = useState<DietaryRestrictionMode>("exclude");
  const showToast = useToast();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = tag.trim();
    if (!trimmed) return;
    const created = await addRestriction(trimmed, mode);
    setRestrictions((prev) => [...prev, created].sort((a, b) => a.tag.localeCompare(b.tag)));
    setTag("");
    showToast("Restriction added");
  }

  async function handleDelete(id: string) {
    setRestrictions((prev) => prev.filter((r) => r.id !== id));
    await deleteRestriction(id);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-8 pt-4">
      <h1 className="text-lg font-semibold">Dietary restrictions</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        &quot;Exclude&quot; ingredients are never suggested unless a recipe notes a
        substitute. &quot;Limit&quot; ingredients are still suggested, just ranked lower.
      </p>

      <form onSubmit={handleAdd} className="mt-4 flex gap-2">
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="e.g. tree nuts"
          className="flex-1 rounded-xl border border-zinc-300 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700"
        />
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as DietaryRestrictionMode)}
          className="rounded-xl border border-zinc-300 bg-transparent px-2 py-2.5 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700"
        >
          <option value="exclude">Exclude</option>
          <option value="limit">Limit</option>
        </select>
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white active:bg-emerald-700"
        >
          Add
        </button>
      </form>

      {restrictions.length === 0 ? (
        <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No restrictions configured.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
          {restrictions.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium capitalize">{r.tag.replace(/_/g, " ")}</p>
                <p className="text-xs capitalize text-zinc-500 dark:text-zinc-400">{r.mode}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(r.id)}
                className="text-sm text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
