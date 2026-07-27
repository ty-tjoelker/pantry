"use client";

import { useState } from "react";
import SwipeToDelete from "./swipe-to-delete";
import type { DietaryRestriction } from "@/types/dietary-restriction";
import type { PantryEntryWithItem } from "@/types/pantry";

function isExpiringSoon(expiresOn: string | null): boolean {
  if (!expiresOn) return false;
  const days = (new Date(expiresOn).getTime() - Date.now()) / 86_400_000;
  return days <= 5;
}

export default function PantryRow({
  entry,
  restrictions,
  onAdjust,
  onAddToGroceryList,
  onToggleDietaryTag,
  onChangeCategory,
  onDelete,
}: {
  entry: PantryEntryWithItem;
  restrictions: DietaryRestriction[];
  onAdjust: (delta: number) => void;
  onAddToGroceryList: () => void;
  onToggleDietaryTag: (tag: string) => void;
  onChangeCategory: (category: string | null) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const expiring = isExpiringSoon(entry.expires_on);
  const activeTags = new Set(entry.item.dietary_tags);

  function commitCategory(value: string) {
    const trimmed = value.trim();
    if (trimmed !== (entry.item.category ?? "")) onChangeCategory(trimmed || null);
  }

  return (
    <SwipeToDelete onDelete={onDelete}>
      <div className={`px-4 py-3 ${expiring ? "bg-amber-50 dark:bg-amber-950/30" : ""}`}>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <p className={expiring ? "text-amber-700 dark:text-amber-400" : ""}>{entry.item.name}</p>
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                aria-label={`Edit category and dietary tags for ${entry.item.name}`}
                aria-expanded={editing}
                className="text-zinc-400 dark:text-zinc-500"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.379-8.379-2.828-2.828z" />
                </svg>
              </button>
            </div>
            {entry.expires_on && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Expires {new Date(entry.expires_on).toLocaleDateString()}
              </p>
            )}
            {!editing && activeTags.size > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {[...activeTags].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] capitalize text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    {tag.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
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

        {editing && (
          <div className="mt-2 space-y-2">
            <div>
              <label className="text-xs text-zinc-500 dark:text-zinc-400">Category</label>
              <input
                list="pantry-category-options"
                defaultValue={entry.item.category ?? ""}
                onBlur={(e) => commitCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                placeholder="e.g. Produce"
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700"
              />
            </div>
            {restrictions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {restrictions.map((r) => {
                  const active = activeTags.has(r.tag);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onToggleDietaryTag(r.tag)}
                      aria-pressed={active}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                        active
                          ? "bg-emerald-600 text-white"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {r.tag.replace(/_/g, " ")}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </SwipeToDelete>
  );
}
