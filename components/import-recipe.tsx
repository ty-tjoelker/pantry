"use client";

import { useState } from "react";
import { useToast } from "./toast";
import type { ParsedRecipeFromUrl } from "@/lib/parse-recipe-url";
import type { RecipeDraft } from "./recipe-form";

export default function ImportRecipe({ onParsed }: { onParsed: (draft: RecipeDraft) => void }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showToast = useToast();

  async function handleImport() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/import-recipe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      const parsed = data as ParsedRecipeFromUrl;
      onParsed({
        title: parsed.title,
        description: parsed.description,
        servings: parsed.servings?.toString() ?? "",
        prepMinutes: parsed.prepMinutes?.toString() ?? "",
        cookMinutes: parsed.cookMinutes?.toString() ?? "",
        instructions: parsed.instructions,
        sourceUrl: url.trim(),
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
      setUrl("");
      showToast("Recipe imported — review and save");
    } catch {
      setError("Couldn't reach the import service.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-4 mt-4 text-sm font-medium text-emerald-600"
      >
        Import a recipe from a URL
      </button>
    );
  }

  return (
    <div className="mx-4 mt-4 rounded-xl border border-zinc-300 p-3 dark:border-zinc-700">
      <p className="text-sm text-zinc-500">
        Paste a link to a recipe page. This works on sites that embed structured recipe
        data — if it doesn&apos;t find anything, try pasting the recipe text instead.
      </p>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/recipe"
        inputMode="url"
        className="mt-2 w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700"
      />
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={handleImport}
          disabled={!url.trim() || loading}
          className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white active:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Importing..." : "Import"}
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
