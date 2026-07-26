"use client";

import Link from "next/link";
import { useState } from "react";
import { getSuggestedRecipes } from "@/lib/db/suggestions";
import type { ScoredRecipe } from "@/lib/suggest-recipes";

export default function SurpriseMe() {
  const [suggestions, setSuggestions] = useState<ScoredRecipe[] | null>(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleSurpriseMe() {
    setLoading(true);
    try {
      const scored = await getSuggestedRecipes();
      setSuggestions(scored);
      setIndex(0);
    } finally {
      setLoading(false);
    }
  }

  function showAnother() {
    if (!suggestions || suggestions.length === 0) return;
    setIndex((i) => (i + 1) % suggestions.length);
  }

  if (!suggestions) {
    return (
      <div className="px-4 pb-2">
        <button
          type="button"
          onClick={handleSurpriseMe}
          disabled={loading}
          className="w-full rounded-xl border border-dashed border-emerald-600 py-2.5 text-sm font-medium text-emerald-600 disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Surprise me"}
        </button>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="px-4 pb-2">
        <p className="rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          Nothing to suggest yet — add a few recipes first.
        </p>
      </div>
    );
  }

  const { recipe, note } = suggestions[index];

  return (
    <div className="px-4 pb-2">
      <div className="rounded-xl border border-emerald-600 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">Suggested</p>
        <Link href={`/recipes/${recipe.id}`} className="mt-1 block text-sm font-medium">
          {recipe.title}
        </Link>
        {note && <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{note}</p>}
        <div className="mt-2 flex gap-3 text-xs">
          <button type="button" onClick={showAnother} className="font-medium text-emerald-600">
            Show another
          </button>
          <button
            type="button"
            onClick={() => setSuggestions(null)}
            className="text-zinc-500 dark:text-zinc-400"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
