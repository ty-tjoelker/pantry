"use client";

import { useEffect, useRef, useState } from "react";
import { searchRecipes } from "@/lib/db/recipes";
import type { Recipe } from "@/types/recipe";

export default function MealSlotEditor({
  initialNote,
  onPickRecipe,
  onSaveNote,
  onClear,
  onClose,
}: {
  initialNote: string;
  onPickRecipe: (recipe: Recipe) => void;
  onSaveNote: (note: string) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initialNote);
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const trimmed = value.trim();
      setSuggestions(trimmed ? await searchRecipes(trimmed) : []);
    }, 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  function pick(recipe: Recipe) {
    onPickRecipe(recipe);
    onClose();
  }

  function saveNoteAndClose() {
    const trimmed = value.trim();
    if (trimmed) onSaveNote(trimmed);
    else onClear();
    onClose();
  }

  return (
    <div className="rounded-xl border border-emerald-600 bg-[var(--background)] p-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveNoteAndClose();
        }}
      >
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
          }}
          enterKeyHint="done"
          placeholder="Recipe or note..."
          className="w-full rounded-lg border border-zinc-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700"
        />
      </form>
      {suggestions.length > 0 && (
        <ul className="mt-1 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          {suggestions.map((recipe) => (
            <li key={recipe.id}>
              <button
                type="button"
                onClick={() => pick(recipe)}
                className="block w-full px-2 py-1.5 text-left text-sm active:bg-zinc-100 dark:active:bg-zinc-800"
              >
                {recipe.title}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-1.5 flex gap-3 text-xs">
        <button type="button" onClick={saveNoteAndClose} className="font-medium text-emerald-600">
          Save
        </button>
        <button type="button" onClick={onClear} className="text-zinc-500 dark:text-zinc-400">
          Clear
        </button>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto text-zinc-500 dark:text-zinc-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
