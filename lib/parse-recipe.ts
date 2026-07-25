export interface ParsedIngredient {
  quantity: number | null;
  unit: string | null;
  name: string;
  note: string | null;
}

export interface ParsedRecipe {
  title: string;
  servings: number | null;
  prepMinutes: number | null;
  cookMinutes: number | null;
  ingredients: ParsedIngredient[];
  instructions: string;
}

const INGREDIENTS_HEADER = /^ingredients?:?$/i;
const INSTRUCTIONS_HEADER = /^(instructions?|directions?|steps?|method):?$/i;
const UNITS = [
  "cups?", "tbsp", "tablespoons?", "tsp", "teaspoons?", "oz", "ounces?",
  "lbs?", "pounds?", "g", "grams?", "kg", "ml", "l", "liters?", "litres?",
  "cloves?", "cans?", "pinch(?:es)?", "dash(?:es)?", "slices?", "sticks?",
  "bunch(?:es)?", "packages?", "pkgs?", "quarts?", "pints?",
];
const UNIT_PATTERN = new RegExp(`^(${UNITS.join("|")})\\b\\.?`, "i");

const FRACTIONS: Record<string, number> = { "¼": 0.25, "½": 0.5, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3 };

function parseQuantity(text: string): { quantity: number | null; rest: string } {
  const trimmed = text.trim();

  const mixed = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)\s*(.*)$/);
  if (mixed) {
    return { quantity: Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]), rest: mixed[4] };
  }

  const fraction = trimmed.match(/^(\d+)\/(\d+)\s*(.*)$/);
  if (fraction) return { quantity: Number(fraction[1]) / Number(fraction[2]), rest: fraction[3] };

  const range = trimmed.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)\s*(.*)$/);
  if (range) return { quantity: Number(range[2]), rest: range[3] };

  const decimal = trimmed.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (decimal) return { quantity: Number(decimal[1]), rest: decimal[2] };

  const unicodeFraction = trimmed.match(/^([¼½¾⅓⅔])\s*(.*)$/);
  if (unicodeFraction) return { quantity: FRACTIONS[unicodeFraction[1]], rest: unicodeFraction[2] };

  return { quantity: null, rest: trimmed };
}

export function parseIngredientLine(rawLine: string): ParsedIngredient {
  const line = rawLine.replace(/^[-*•]\s*/, "").trim();
  const { quantity, rest } = parseQuantity(line);

  let remaining = rest.trim();
  let unit: string | null = null;
  const unitMatch = remaining.match(UNIT_PATTERN);
  if (unitMatch) {
    unit = unitMatch[1].toLowerCase().replace(/s$/, "");
    remaining = remaining.slice(unitMatch[0].length).trim();
  }

  let note: string | null = null;
  const parenNote = remaining.match(/\(([^)]+)\)/);
  if (parenNote) {
    note = parenNote[1].trim();
    remaining = remaining.replace(parenNote[0], "").trim();
  }

  const commaSplit = remaining.split(",");
  if (commaSplit.length > 1) {
    remaining = commaSplit[0].trim();
    note = note ? `${note}, ${commaSplit.slice(1).join(",").trim()}` : commaSplit.slice(1).join(",").trim();
  }

  return { quantity, unit, name: remaining.replace(/\.$/, "").trim(), note };
}

function findTimeMinutes(text: string, label: RegExp): number | null {
  const match = text.match(label);
  if (!match) return null;
  const hours = match[1] ? Number(match[1]) : 0;
  const minutes = match[2] ? Number(match[2]) : 0;
  return hours * 60 + minutes || null;
}

export function parseRecipeText(raw: string): ParsedRecipe {
  const lines = raw.split("\n").map((l) => l.trim());
  const nonEmpty = lines.filter(Boolean);

  const servingsMatch = raw.match(/serv(?:es|ings)\s*:?\s*(\d+)/i) ?? raw.match(/yields?\s*:?\s*(\d+)/i);
  const servings = servingsMatch ? Number(servingsMatch[1]) : null;

  const prepMinutes = findTimeMinutes(raw, /prep(?:aration)? time:?\s*(?:(\d+)\s*h(?:ours?)?)?\s*(?:(\d+)\s*m(?:in(?:utes?)?)?)?/i);
  const cookMinutes = findTimeMinutes(raw, /cook(?:ing)? time:?\s*(?:(\d+)\s*h(?:ours?)?)?\s*(?:(\d+)\s*m(?:in(?:utes?)?)?)?/i);

  const ingredientsIdx = nonEmpty.findIndex((l) => INGREDIENTS_HEADER.test(l));
  const instructionsIdx = nonEmpty.findIndex((l) => INSTRUCTIONS_HEADER.test(l));

  let title = "";
  let ingredientLines: string[];
  let instructionLines: string[];

  if (ingredientsIdx !== -1) {
    title = nonEmpty.slice(0, ingredientsIdx).find((l) => !/time|serv|yield/i.test(l)) ?? "";
    const end = instructionsIdx !== -1 ? instructionsIdx : nonEmpty.length;
    ingredientLines = nonEmpty.slice(ingredientsIdx + 1, end);
    instructionLines = instructionsIdx !== -1 ? nonEmpty.slice(instructionsIdx + 1) : [];
  } else {
    title = nonEmpty.find((l) => !/time|serv|yield/i.test(l)) ?? "";
    const looksLikeIngredient = (l: string) => /^[-*•]?\s*(\d|[¼½¾⅓⅔])/.test(l);
    ingredientLines = nonEmpty.filter((l) => l !== title && looksLikeIngredient(l));
    instructionLines = nonEmpty.filter((l) => l !== title && !looksLikeIngredient(l) && !/time|serv|yield/i.test(l));
  }

  const ingredients = ingredientLines
    .filter((l) => l && !INGREDIENTS_HEADER.test(l))
    .map(parseIngredientLine)
    .filter((i) => i.name);

  const instructions = instructionLines
    .filter((l) => l && !INSTRUCTIONS_HEADER.test(l))
    .map((l) => l.replace(/^\d+[.)]\s*/, ""))
    .join("\n");

  return { title: title.trim(), servings, prepMinutes, cookMinutes, ingredients, instructions };
}
