"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AddItemInput from "./add-item-input";
import IngredientRow, { type DraftIngredient } from "./ingredient-row";
import { findOrCreateItem } from "@/lib/db/items";
import { createRecipe, updateRecipe } from "@/lib/db/recipes";
import type { RecipeInput } from "@/types/recipe";
import type { Item } from "@/types/item";

export interface RecipeDraft {
  title: string;
  description: string;
  servings: string;
  prepMinutes: string;
  cookMinutes: string;
  instructions: string;
  sourceUrl: string;
  tags: string;
  ingredients: DraftIngredient[];
}

export const emptyDraft: RecipeDraft = {
  title: "",
  description: "",
  servings: "",
  prepMinutes: "",
  cookMinutes: "",
  instructions: "",
  sourceUrl: "",
  tags: "",
  ingredients: [],
};

export default function RecipeForm({
  recipeId,
  initial,
}: {
  recipeId?: string;
  initial: RecipeDraft;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(fields: Partial<RecipeDraft>) {
    setDraft((prev) => ({ ...prev, ...fields }));
  }

  function addIngredientByName(name: string) {
    patch({
      ingredients: [
        ...draft.ingredients,
        { tempId: crypto.randomUUID(), itemId: null, name, quantity: 1, unit: null, note: null },
      ],
    });
  }

  function addIngredientByItem(item: Item) {
    patch({
      ingredients: [
        ...draft.ingredients,
        {
          tempId: crypto.randomUUID(),
          itemId: item.id,
          name: item.name,
          quantity: 1,
          unit: item.default_unit,
          note: null,
        },
      ],
    });
  }

  function updateIngredient(tempId: string, fields: Partial<DraftIngredient>) {
    patch({
      ingredients: draft.ingredients.map((i) => (i.tempId === tempId ? { ...i, ...fields } : i)),
    });
  }

  function removeIngredient(tempId: string) {
    patch({ ingredients: draft.ingredients.filter((i) => i.tempId !== tempId) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) {
      setError("Give it a title.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const ingredients = await Promise.all(
        draft.ingredients.map(async (i) => ({
          item_id: i.itemId ?? (await findOrCreateItem(i.name)).id,
          quantity: i.quantity,
          unit: i.unit,
          note: i.note,
        })),
      );

      const input: RecipeInput = {
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        servings: draft.servings ? Number(draft.servings) : null,
        prep_minutes: draft.prepMinutes ? Number(draft.prepMinutes) : null,
        cook_minutes: draft.cookMinutes ? Number(draft.cookMinutes) : null,
        instructions: draft.instructions.trim(),
        source_url: draft.sourceUrl.trim() || null,
        tags: draft.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        ingredients,
      };

      const id = recipeId ?? (await createRecipe(input));
      if (recipeId) await updateRecipe(recipeId, input);
      router.push(`/recipes/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
      <input
        value={draft.title}
        onChange={(e) => patch({ title: e.target.value })}
        placeholder="Recipe title"
        className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-3 text-base font-medium outline-none focus:border-emerald-600 dark:border-zinc-700"
      />
      <textarea
        value={draft.description}
        onChange={(e) => patch({ description: e.target.value })}
        placeholder="Short description (optional)"
        rows={2}
        className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700"
      />

      <div className="flex gap-2">
        <input
          type="number"
          inputMode="numeric"
          value={draft.servings}
          onChange={(e) => patch({ servings: e.target.value })}
          placeholder="Servings"
          className="w-1/3 rounded-xl border border-zinc-300 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700"
        />
        <input
          type="number"
          inputMode="numeric"
          value={draft.prepMinutes}
          onChange={(e) => patch({ prepMinutes: e.target.value })}
          placeholder="Prep min"
          className="w-1/3 rounded-xl border border-zinc-300 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700"
        />
        <input
          type="number"
          inputMode="numeric"
          value={draft.cookMinutes}
          onChange={(e) => patch({ cookMinutes: e.target.value })}
          placeholder="Cook min"
          className="w-1/3 rounded-xl border border-zinc-300 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700"
        />
      </div>

      <input
        value={draft.tags}
        onChange={(e) => patch({ tags: e.target.value })}
        placeholder="Tags, comma separated"
        className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700"
      />

      <div>
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-zinc-400">
          Ingredients
        </h2>
        <div className="space-y-2">
          {draft.ingredients.map((ingredient) => (
            <IngredientRow
              key={ingredient.tempId}
              ingredient={ingredient}
              onChange={(fields) => updateIngredient(ingredient.tempId, fields)}
              onRemove={() => removeIngredient(ingredient.tempId)}
            />
          ))}
        </div>
        <div className="mt-2">
          <AddItemInput onAddByName={addIngredientByName} onAddItem={addIngredientByItem} />
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-zinc-400">
          Instructions
        </h2>
        <textarea
          value={draft.instructions}
          onChange={(e) => patch({ instructions: e.target.value })}
          placeholder="Step by step..."
          rows={8}
          className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700"
        />
      </div>

      <input
        value={draft.sourceUrl}
        onChange={(e) => patch({ sourceUrl: e.target.value })}
        placeholder="Source URL (optional)"
        className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white active:bg-emerald-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : recipeId ? "Save changes" : "Save recipe"}
      </button>
    </form>
  );
}
