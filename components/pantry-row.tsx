"use client";

import type { PantryEntryWithItem } from "@/types/pantry";

function isExpiringSoon(expiresOn: string | null): boolean {
  if (!expiresOn) return false;
  const days = (new Date(expiresOn).getTime() - Date.now()) / 86_400_000;
  return days <= 5;
}

export default function PantryRow({
  entry,
  onAdjust,
  onAddToGroceryList,
}: {
  entry: PantryEntryWithItem;
  onAdjust: (delta: number) => void;
  onAddToGroceryList: () => void;
}) {
  const expiring = isExpiringSoon(entry.expires_on);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 ${
        expiring ? "bg-amber-50 dark:bg-amber-950/30" : ""
      }`}
    >
      <div className="flex-1">
        <p className={expiring ? "text-amber-700 dark:text-amber-400" : ""}>
          {entry.item.name}
        </p>
        {entry.expires_on && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Expires {new Date(entry.expires_on).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onAdjust(-1)}
          aria-label={`Decrease ${entry.item.name} quantity`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-lg dark:border-zinc-700"
        >
          −
        </button>
        <span className="w-6 text-center tabular-nums">{entry.quantity}</span>
        <button
          type="button"
          onClick={() => onAdjust(1)}
          aria-label={`Increase ${entry.item.name} quantity`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-lg dark:border-zinc-700"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={onAddToGroceryList}
        aria-label={`Add ${entry.item.name} to grocery list`}
        className="text-sm font-medium text-emerald-600"
      >
        + List
      </button>
    </div>
  );
}
