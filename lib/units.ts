type Dimension = "volume" | "weight";

// Factor to convert 1 of the unit into the dimension's base (ml for volume, g for weight).
const UNIT_TO_BASE: Record<string, { dimension: Dimension; factor: number }> = {
  tsp: { dimension: "volume", factor: 4.92892 },
  teaspoon: { dimension: "volume", factor: 4.92892 },
  tbsp: { dimension: "volume", factor: 14.7868 },
  tablespoon: { dimension: "volume", factor: 14.7868 },
  cup: { dimension: "volume", factor: 236.588 },
  "fl oz": { dimension: "volume", factor: 29.5735 },
  pint: { dimension: "volume", factor: 473.176 },
  quart: { dimension: "volume", factor: 946.353 },
  gallon: { dimension: "volume", factor: 3785.41 },
  ml: { dimension: "volume", factor: 1 },
  l: { dimension: "volume", factor: 1000 },
  g: { dimension: "weight", factor: 1 },
  kg: { dimension: "weight", factor: 1000 },
  oz: { dimension: "weight", factor: 28.3495 },
  lb: { dimension: "weight", factor: 453.592 },
};

function normalizeUnit(unit: string): string {
  return unit.trim().toLowerCase().replace(/\.$/, "").replace(/s$/, "");
}

/** Converts a quantity between two units. Returns null if either unit is unknown or the units aren't the same dimension. */
export function convert(quantity: number, fromUnit: string, toUnit: string): number | null {
  const from = UNIT_TO_BASE[normalizeUnit(fromUnit)];
  const to = UNIT_TO_BASE[normalizeUnit(toUnit)];
  if (!from || !to || from.dimension !== to.dimension) return null;
  return (quantity * from.factor) / to.factor;
}

export function unitsAreConvertible(a: string, b: string): boolean {
  const from = UNIT_TO_BASE[normalizeUnit(a)];
  const to = UNIT_TO_BASE[normalizeUnit(b)];
  return !!from && !!to && from.dimension === to.dimension;
}
