"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import RecipeCard from "./recipe-card";
import type { Recipe } from "@/types/recipe";

export default function RecipeList({ recipes }: { recipes: Recipe[] }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tags = useMemo(
    () => [...new Set(recipes.flatMap((r) => r.tags))].sort(),
    [recipes],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes.filter((r) => {
      const matchesQuery = !q || r.title.toLowerCase().includes(q);
      const matchesTag = !activeTag || r.tags.includes(activeTag);
      return matchesQuery && matchesTag;
    });
  }, [recipes, query, activeTag]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2 px-4 pt-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recipes..."
          className="flex-1 rounded-xl border border-zinc-300 bg-transparent px-4 py-3 text-base outline-none focus:border-emerald-600 dark:border-zinc-700"
        />
        <Link
          href="/recipes/new"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-xl text-white active:bg-emerald-700"
          aria-label="Add recipe"
        >
          +
        </Link>
      </div>

      {tags.length > 0 && (
        <div className="mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            aria-pressed={activeTag === null}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
              activeTag === null
                ? "bg-emerald-600 text-white"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              aria-pressed={activeTag === tag}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                activeTag === tag
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {filtered.length === 0 && (
          <p className="mt-8 text-center text-zinc-500 dark:text-zinc-400">
            {recipes.length === 0 ? "No recipes yet." : "Nothing matches."}
          </p>
        )}
        {filtered.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
