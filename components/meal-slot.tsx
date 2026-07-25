"use client";

import { useState } from "react";
import MealSlotEditor from "./meal-slot-editor";
import type { MealPlanEntryWithRecipe } from "@/types/meal-plan";
import type { Recipe } from "@/types/recipe";

export default function MealSlot({
  entry,
  onPickRecipe,
  onSaveNote,
  onClear,
}: {
  entry: MealPlanEntryWithRecipe | undefined;
  onPickRecipe: (recipe: Recipe) => void;
  onSaveNote: (note: string) => void;
  onClear: () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <MealSlotEditor
        initialNote={entry?.note ?? ""}
        onPickRecipe={onPickRecipe}
        onSaveNote={onSaveNote}
        onClear={onClear}
        onClose={() => setEditing(false)}
      />
    );
  }

  const label = entry?.recipe?.title ?? entry?.note ?? null;

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`w-full rounded-xl border px-2.5 py-2 text-left text-sm ${
        label
          ? "border-zinc-300 dark:border-zinc-700"
          : "border-dashed border-zinc-300 text-zinc-400 dark:border-zinc-700"
      }`}
    >
      {label ?? "+ Add"}
    </button>
  );
}
