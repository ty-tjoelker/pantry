"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  addMissingIngredientsToGroceryList,
  deleteRecipe,
  markCooked,
} from "@/lib/db/recipes";
import type { DietaryRestriction } from "@/types/dietary-restriction";
import type { RecipeWithIngredients } from "@/types/recipe";

export default function RecipeDetail({
  recipe,
  haveItemIds,
  restrictions,
}: {
  recipe: RecipeWithIngredients;
  haveItemIds: string[];
  restrictions: DietaryRestriction[];
}) {
  const router = useRouter();
  const haveSet = new Set(haveItemIds);
  const excludedTags = new Set(
    restrictions.filter((r) => r.mode === "exclude").map((r) => r.tag),
  );
  const [adding, setAdding] = useState(false);
  const [cooking, setCooking] = useState(false);
  const [confirmCook, setConfirmCook] = useState(false);

  const totalMinutes = (recipe.prep_minutes ?? 0) + (recipe.cook_minutes ?? 0);

  async function handleAddMissing() {
    setAdding(true);
    try {
      await addMissingIngredientsToGroceryList(recipe);
    } finally {
      setAdding(false);
    }
  }

  async function handleCookedIt(decrementPantry: boolean) {
    setCooking(true);
    setConfirmCook(false);
    try {
      await markCooked(recipe, decrementPantry);
      router.refresh();
    } finally {
      setCooking(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${recipe.title}"? This can't be undone.`)) return;
    await deleteRecipe(recipe.id);
    router.push("/recipes");
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-4">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-xl font-semibold">{recipe.title}</h1>
        <Link
          href={`/recipes/${recipe.id}/edit`}
          className="shrink-0 text-sm font-medium text-emerald-600"
        >
          Edit
        </Link>
      </div>

      {recipe.description && (
        <p className="mt-1 text-sm text-zinc-500">{recipe.description}</p>
      )}

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        {totalMinutes > 0 && <span>{totalMinutes} min</span>}
        {recipe.servings && <span>{recipe.servings} servings</span>}
        {recipe.times_cooked > 0 && <span>Cooked {recipe.times_cooked}×</span>}
      </div>

      {recipe.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <h2 className="mt-6 text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Ingredients
      </h2>
      <ul className="mt-2 divide-y divide-zinc-200 dark:divide-zinc-800">
        {recipe.ingredients.map((ingredient) => {
          const have = haveSet.has(ingredient.item_id);
          const conflictingTags = ingredient.item.dietary_tags.filter((t) => excludedTags.has(t));
          const hasConflict = conflictingTags.length > 0;
          return (
            <li key={ingredient.id} className="py-2 text-sm">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${have ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"}`} />
                <span className={have ? "text-zinc-500 line-through dark:text-zinc-400" : ""}>
                  {ingredient.quantity && `${ingredient.quantity} `}
                  {ingredient.unit && `${ingredient.unit} `}
                  {ingredient.item.name}
                  {ingredient.note && (
                    <span className="text-zinc-500 dark:text-zinc-400"> ({ingredient.note})</span>
                  )}
                </span>
              </div>
              {hasConflict && (
                <p className="ml-4 mt-0.5 text-xs">
                  {ingredient.substitute_note ? (
                    <span className="text-emerald-600">
                      Swap: {ingredient.substitute_note}
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">
                      Contains {conflictingTags.map((t) => t.replace(/_/g, " ")).join(", ")}
                    </span>
                  )}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={handleAddMissing}
        disabled={adding}
        className="mt-4 w-full rounded-xl border border-zinc-300 py-2.5 text-sm font-medium text-zinc-600 active:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:active:bg-zinc-800"
      >
        {adding ? "Adding..." : "Add missing ingredients to grocery list"}
      </button>

      {recipe.instructions && (
        <>
          <h2 className="mt-6 text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Instructions
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
            {recipe.instructions}
          </p>
        </>
      )}

      <div className="mt-8 space-y-2">
        {confirmCook ? (
          <div className="rounded-xl border border-zinc-300 p-3 dark:border-zinc-700">
            <p className="text-sm">Subtract these ingredients from the pantry too?</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => handleCookedIt(true)}
                disabled={cooking}
                className="flex-1 rounded-xl bg-emerald-600 py-2 text-sm font-medium text-white active:bg-emerald-700 disabled:opacity-50"
              >
                Yes, subtract
              </button>
              <button
                type="button"
                onClick={() => handleCookedIt(false)}
                disabled={cooking}
                className="flex-1 rounded-xl border border-zinc-300 py-2 text-sm font-medium text-zinc-600 active:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:active:bg-zinc-800"
              >
                Just log it
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmCook(true)}
            className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white active:bg-emerald-700"
          >
            Cooked it
          </button>
        )}
        <button
          type="button"
          onClick={handleDelete}
          className="w-full py-2 text-sm text-red-500"
        >
          Delete recipe
        </button>
      </div>
    </div>
  );
}
