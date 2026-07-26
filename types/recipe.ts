import type { Item } from "./item";

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  servings: number | null;
  prep_minutes: number | null;
  cook_minutes: number | null;
  instructions: string;
  source_url: string | null;
  tags: string[];
  times_cooked: number;
  last_cooked_on: string | null;
  created_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  item_id: string;
  quantity: number | null;
  unit: string | null;
  note: string | null;
  substitute_note: string | null;
  sort_order: number;
}

export interface RecipeIngredientWithItem extends RecipeIngredient {
  item: Item;
}

export interface RecipeWithIngredients extends Recipe {
  ingredients: RecipeIngredientWithItem[];
}

export interface RecipeIngredientInput {
  item_id: string;
  quantity: number | null;
  unit: string | null;
  note: string | null;
  substitute_note: string | null;
}

export interface RecipeInput {
  title: string;
  description: string | null;
  servings: number | null;
  prep_minutes: number | null;
  cook_minutes: number | null;
  instructions: string;
  source_url: string | null;
  tags: string[];
  ingredients: RecipeIngredientInput[];
}
