import type { DietaryRestriction } from "@/types/dietary-restriction";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Meat & Seafood": [
    "chicken", "beef", "pork", "turkey", "bacon", "sausage", "steak",
    "ground beef", "fish", "salmon", "shrimp", "prawn", "tuna", "tilapia",
    "crab", "lobster", "ham",
  ],
  "Dairy & Eggs": [
    "milk", "cheese", "butter", "cream", "yogurt", "egg", "sour cream",
    "half and half", "buttermilk",
  ],
  "Produce": [
    "apple", "banana", "lettuce", "spinach", "tomato", "onion", "garlic",
    "potato", "carrot", "pepper", "cucumber", "broccoli", "avocado", "lemon",
    "lime", "berry", "berries", "grape", "cilantro", "parsley", "basil",
    "kale", "celery", "mushroom",
  ],
  "Bakery": ["bread", "bagel", "bun", "tortilla", "roll", "baguette", "muffin", "croissant"],
  "Frozen": ["frozen", "ice cream", "popsicle"],
  "Canned Goods": ["canned", "crushed tomatoes", "tomato sauce", "soup"],
  "Beverages": ["juice", "soda", "sparkling water", "coffee", "tea", "wine", "beer"],
  "Snacks": ["chips", "cracker", "pretzel", "cookie", "candy", "popcorn"],
  "Pantry": [
    "flour", "sugar", "rice", "pasta", "noodle", "oil", "vinegar", "spice",
    "cinnamon", "salt", "cereal", "oats", "bean", "lentil", "stock", "broth",
    "sauce", "peanut butter", "honey", "nuts",
  ],
};

export function guessCategory(name: string): string | null {
  const lower = name.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => lower.includes(keyword))) return category;
  }
  return null;
}

const DIETARY_KEYWORDS: Record<string, string[]> = {
  gluten: [
    "flour", "bread", "pasta", "noodle", "wheat", "cracker", "tortilla",
    "bagel", "cookie", "pretzel", "breadcrumb", "cereal", "cake", "bun",
  ],
  dairy: [
    "milk", "cheese", "butter", "cream", "yogurt", "buttermilk",
    "half and half", "ice cream", "sour cream", "whey",
  ],
  peanut: ["peanut"],
  shrimp: ["shrimp", "prawn"],
  chicken: ["chicken"],
  black_beans: ["black bean"],
  pinto_beans: ["pinto bean"],
  cinnamon: ["cinnamon"],
};

/**
 * Only guesses tags that are currently configured as restrictions, so a newly-added
 * restriction (via the settings page) starts working on the next item without a
 * code change — and items never carry a tag nobody's tracking.
 */
export function guessDietaryTags(name: string, restrictions: DietaryRestriction[]): string[] {
  const lower = name.toLowerCase();
  const activeTags = new Set(restrictions.map((r) => r.tag));
  const tags: string[] = [];
  for (const [tag, keywords] of Object.entries(DIETARY_KEYWORDS)) {
    if (!activeTags.has(tag)) continue;
    if (keywords.some((keyword) => lower.includes(keyword))) tags.push(tag);
  }
  return tags;
}
