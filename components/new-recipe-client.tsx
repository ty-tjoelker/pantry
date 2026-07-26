"use client";

import { useState } from "react";
import PasteRecipe from "./paste-recipe";
import RecipeForm, { emptyDraft, type RecipeDraft } from "./recipe-form";
import type { DietaryRestriction } from "@/types/dietary-restriction";

export default function NewRecipeClient({
  restrictions,
}: {
  restrictions: DietaryRestriction[];
}) {
  const [draft, setDraft] = useState<RecipeDraft>(emptyDraft);
  const [version, setVersion] = useState(0);

  function handleParsed(parsed: RecipeDraft) {
    setDraft(parsed);
    setVersion((v) => v + 1);
  }

  return (
    <div className="flex flex-1 flex-col">
      <PasteRecipe onParsed={handleParsed} />
      <RecipeForm key={version} initial={draft} restrictions={restrictions} />
    </div>
  );
}
