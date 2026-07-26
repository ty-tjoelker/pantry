import { parseIngredientLine, type ParsedIngredient } from "./parse-recipe";

export interface ParsedRecipeFromUrl {
  title: string;
  description: string;
  servings: number | null;
  prepMinutes: number | null;
  cookMinutes: number | null;
  instructions: string;
  ingredients: ParsedIngredient[];
}

function parseIsoDurationMinutes(duration: unknown): number | null {
  if (typeof duration !== "string") return null;
  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/);
  if (!match) return null;
  const hours = match[1] ? Number(match[1]) : 0;
  const minutes = match[2] ? Number(match[2]) : 0;
  return hours * 60 + minutes || null;
}

function extractYield(recipeYield: unknown): number | null {
  if (typeof recipeYield === "number") return recipeYield;
  if (Array.isArray(recipeYield)) return extractYield(recipeYield[0]);
  if (typeof recipeYield === "string") {
    const match = recipeYield.match(/\d+/);
    return match ? Number(match[0]) : null;
  }
  return null;
}

function extractInstructions(instructions: unknown): string {
  if (typeof instructions === "string") return instructions.trim();
  if (Array.isArray(instructions)) {
    return instructions
      .map((step) => {
        if (typeof step === "string") return step;
        if (step && typeof step === "object") {
          const obj = step as Record<string, unknown>;
          if (typeof obj.text === "string") return obj.text;
          if (Array.isArray(obj.itemListElement)) return extractInstructions(obj.itemListElement);
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

function findRecipeNode(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;
  if (Array.isArray(data)) {
    for (const entry of data) {
      const found = findRecipeNode(entry);
      if (found) return found;
    }
    return null;
  }
  const obj = data as Record<string, unknown>;
  const type = obj["@type"];
  const isRecipe = type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"));
  if (isRecipe) return obj;
  if (Array.isArray(obj["@graph"])) return findRecipeNode(obj["@graph"]);
  return null;
}

/** Finds the first schema.org Recipe node embedded as JSON-LD in a page's HTML. */
export function findRecipeJsonLd(html: string): Record<string, unknown> | null {
  const scriptPattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptPattern.exec(html)) !== null) {
    try {
      const json = JSON.parse(match[1].trim());
      const recipe = findRecipeNode(json);
      if (recipe) return recipe;
    } catch {
      // Malformed JSON-LD block on the page — skip it and keep looking.
    }
  }
  return null;
}

export function mapJsonLdToRecipe(node: Record<string, unknown>): ParsedRecipeFromUrl {
  const ingredientLines = Array.isArray(node.recipeIngredient)
    ? (node.recipeIngredient as unknown[]).filter((line): line is string => typeof line === "string")
    : [];

  return {
    title: typeof node.name === "string" ? node.name : "",
    description: typeof node.description === "string" ? node.description : "",
    servings: extractYield(node.recipeYield),
    prepMinutes: parseIsoDurationMinutes(node.prepTime),
    cookMinutes: parseIsoDurationMinutes(node.cookTime),
    instructions: extractInstructions(node.recipeInstructions),
    ingredients: ingredientLines.map(parseIngredientLine),
  };
}
