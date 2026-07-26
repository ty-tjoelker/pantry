"use client";

import { useState } from "react";
import { parseRecipeText } from "@/lib/parse-recipe";
import type { RecipeDraft } from "./recipe-form";

export default function PasteRecipe({ onParsed }: { onParsed: (draft: RecipeDraft) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  function handleParse() {
    const parsed = parseRecipeText(text);
    onParsed({
      title: parsed.title,
      description: "",
      servings: parsed.servings?.toString() ?? "",
      prepMinutes: parsed.prepMinutes?.toString() ?? "",
      cookMinutes: parsed.cookMinutes?.toString() ?? "",
      instructions: parsed.instructions,
      sourceUrl: "",
      tags: "",
      ingredients: parsed.ingredients.map((i) => ({
        tempId: crypto.randomUUID(),
        itemId: null,
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        note: i.note,
        substituteNote: null,
        itemDietaryTags: [],
      })),
    });
    setOpen(false);
    setText("");
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-4 mt-4 text-sm font-medium text-emerald-600"
      >
        Paste a recipe from somewhere else
      </button>
    );
  }

  return (
    <div className="mx-4 mt-4 rounded-xl border border-zinc-300 p-3 dark:border-zinc-700">
      <p className="text-sm text-zinc-500">
        Paste the recipe text below. We&apos;ll try to pull out the title, ingredients, and
        steps — you can fix anything it gets wrong before saving.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="Paste recipe text here..."
        className="mt-2 w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700"
      />
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={handleParse}
          disabled={!text.trim()}
          className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white active:bg-emerald-700 disabled:opacity-50"
        >
          Parse it
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm font-medium text-zinc-600 active:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:active:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
