import type { DietaryRestriction } from "@/types/dietary-restriction";

// Order matters: earlier categories win when a name matches more than one (e.g. "frozen
// sweet potato fries" should be Frozen, not Produce, because "frozen" is checked first).
const CATEGORY_KEYWORDS: [string, string[]][] = [
  [
    "Frozen",
    ["frozen", "ice cream", "popsicle", "frozen yogurt"],
  ],
  [
    "Canned Goods",
    ["canned", "can of", "crushed tomatoes", "tomato paste", "tomato sauce", "soup"],
  ],
  [
    "Bakery",
    ["bread", "bagel", "bun", "tortilla", "roll", "baguette", "muffin", "croissant", "pita"],
  ],
  [
    "Beverages",
    [
      "juice", "soda", "sparkling water", "coffee", "iced tea", "green tea",
      "black tea", "herbal tea", "tea bag", "wine", "beer", "kombucha",
    ],
  ],
  [
    "Snacks",
    ["chips", "cracker", "pretzel", "cookie", "candy", "popcorn", "granola bar", "larabar", "protein bar"],
  ],
  [
    "Dairy & Eggs",
    [
      "milk", "cheese", "feta", "mozzarella", "cheddar", "parmesan", "cream cheese",
      "butter", "cream", "yogurt", "egg", "sour cream", "half and half", "buttermilk",
    ],
  ],
  [
    "Meat & Seafood",
    [
      "chicken", "beef", "pork", "turkey", "lamb", "bacon", "sausage", "steak",
      "fish", "salmon", "shrimp", "prawn", "tuna", "tilapia", "crab", "lobster", "ham",
    ],
  ],
  [
    "Produce",
    [
      "apple", "banana", "lettuce", "spinach", "tomato", "onion", "shallot", "leek",
      "scallion", "green onion", "garlic", "ginger", "potato", "carrot", "bell pepper",
      "cucumber", "broccoli", "cauliflower", "cabbage", "brussels sprout", "asparagus",
      "green bean", "zucchini", "squash", "eggplant", "corn", "radish", "beet",
      "artichoke", "avocado", "lemon", "lime", "orange", "grapefruit", "tangerine",
      "berry", "berries", "strawberry", "blueberry", "raspberry", "blackberry",
      "cranberry", "grape", "peach", "plum", "pear", "mango", "pineapple", "watermelon",
      "melon", "cherry", "cherries", "apricot", "kiwi", "fig", "pomegranate", "nectarine",
      "cilantro", "parsley", "basil", "kale", "celery", "mushroom", "arugula", "chive",
    ],
  ],
  [
    "Pantry",
    [
      "flour", "sugar", "rice", "pasta", "spaghetti", "penne", "linguine",
      "macaroni", "fettuccine", "ravioli", "lasagna", "ziti", "noodle", "oil",
      "vinegar", "cinnamon", "salt", "black pepper", "peppercorn", "pepper flakes",
      "cereal", "oats", "bean", "lentil", "stock", "broth", "sauce", "peanut butter",
      "honey", "nuts", "paprika", "cumin", "oregano", "thyme", "rosemary", "dill",
      "mint", "tarragon", "bay leaf", "chili powder", "garlic powder", "onion powder",
      "spice", "mayonnaise", "mustard", "ketchup", "sriracha", "hot sauce",
      "chili paste", "salsa", "relish", "barbecue sauce", "worcestershire",
      "jam", "jelly", "syrup", "cornstarch", "baking soda", "baking powder", "yeast",
    ],
  ],
];

/**
 * Matches on word boundaries so short keywords (e.g. "tea", "egg") don't false-positive
 * inside unrelated words (e.g. "beefsteak", "eggplant") — but still allows a plain "s"/"es"
 * plural suffix, so "tomato" matches "tomatoes" and "onion" matches "onions".
 */
function matchesKeyword(lower: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}(?:es|s)?\\b`).test(lower);
}

export function guessCategory(name: string): string | null {
  const lower = name.toLowerCase();
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((keyword) => matchesKeyword(lower, keyword))) return category;
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
    if (keywords.some((keyword) => matchesKeyword(lower, keyword))) tags.push(tag);
  }
  return tags;
}
