import Link from "next/link";
import type { Recipe } from "@/types/recipe";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const totalMinutes = (recipe.prep_minutes ?? 0) + (recipe.cook_minutes ?? 0);

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="block rounded-xl border border-zinc-200 p-4 active:bg-zinc-50 dark:border-zinc-800 dark:active:bg-zinc-900"
    >
      <p className="font-medium">{recipe.title}</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
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
    </Link>
  );
}
