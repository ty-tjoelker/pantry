"use client";

import SwipeToDelete from "./swipe-to-delete";
import { vibrate } from "@/lib/haptics";
import type { GroceryListEntryWithItem } from "@/types/grocery-list";

export default function GroceryRow({
  entry,
  onToggle,
  onDelete,
}: {
  entry: GroceryListEntryWithItem;
  onToggle: () => void;
  onDelete: () => void;
}) {
  function handleToggle() {
    if (!entry.checked) vibrate();
    onToggle();
  }

  return (
    <SwipeToDelete onDelete={onDelete}>
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={entry.checked}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
            entry.checked
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-zinc-300 dark:border-zinc-600"
          }`}
        >
          {entry.checked && (
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" />
            </svg>
          )}
        </span>
        <span className="flex-1">
          <span className={entry.checked ? "text-zinc-500 line-through dark:text-zinc-400" : ""}>
            {entry.item.name}
          </span>
          {(entry.quantity !== 1 || entry.unit) && (
            <span className="ml-2 text-sm text-zinc-500">
              {entry.quantity} {entry.unit ?? ""}
            </span>
          )}
        </span>
      </button>
    </SwipeToDelete>
  );
}
