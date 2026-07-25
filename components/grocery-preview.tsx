"use client";

import { useEffect, useState } from "react";
import { getGroceryPreviewForWeek } from "@/lib/db/meal-plan";
import { addMealPlanRowsToGroceryList } from "@/lib/db/grocery-list";
import type { GroceryPreviewRow } from "@/lib/meal-plan-grocery";

export default function GroceryPreview({
  weekStart,
  onClose,
}: {
  weekStart: string;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<GroceryPreviewRow[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getGroceryPreviewForWeek(weekStart).then((result) => {
      if (cancelled) return;
      setRows(result);
      setChecked(new Set(result.map((r) => r.key)));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [weekStart]);

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleAdd() {
    setAdding(true);
    try {
      await addMealPlanRowsToGroceryList(rows.filter((r) => checked.has(r.key)));
      setAdded(true);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex flex-col bg-[var(--background)]">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-base font-semibold">This week&rsquo;s list</h2>
        <button type="button" onClick={onClose} className="text-sm text-zinc-400">
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading && <p className="mt-8 text-center text-zinc-400">Working it out...</p>}

        {!loading && added && (
          <p className="mt-8 text-center text-zinc-400">Added to your grocery list.</p>
        )}

        {!loading && !added && rows.length === 0 && (
          <p className="mt-8 text-center text-zinc-400">
            Nothing needed — plan some recipes, or your pantry already has it covered.
          </p>
        )}

        {!loading && !added && rows.length > 0 && (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((row) => (
              <li key={row.key} className="flex items-center gap-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={checked.has(row.key)}
                  onChange={() => toggle(row.key)}
                  className="h-5 w-5 shrink-0 accent-emerald-600"
                />
                <span className="flex-1">
                  {row.quantity !== null && `${trimQuantity(row.quantity)} `}
                  {row.unit && `${row.unit} `}
                  {row.itemName}
                </span>
                {row.reason === "staple" && (
                  <span className="shrink-0 text-xs text-zinc-400">staple</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!loading && !added && rows.length > 0 && (
        <div className="border-t border-zinc-200 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] dark:border-zinc-800">
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || checked.size === 0}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white active:bg-emerald-700 disabled:opacity-50"
          >
            {adding ? "Adding..." : `Add ${checked.size} checked item${checked.size === 1 ? "" : "s"}`}
          </button>
        </div>
      )}
    </div>
  );
}

function trimQuantity(n: number): string {
  return Number(n.toFixed(2)).toString();
}
