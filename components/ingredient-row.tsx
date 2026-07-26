"use client";

export interface DraftIngredient {
  tempId: string;
  itemId: string | null;
  name: string;
  quantity: number | null;
  unit: string | null;
  note: string | null;
}

export default function IngredientRow({
  ingredient,
  onChange,
  onRemove,
}: {
  ingredient: DraftIngredient;
  onChange: (patch: Partial<DraftIngredient>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <p className="flex-1 text-sm font-medium">{ingredient.name}</p>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm text-zinc-500 dark:text-zinc-400"
          aria-label={`Remove ${ingredient.name}`}
        >
          ✕
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          value={ingredient.quantity ?? ""}
          onChange={(e) =>
            onChange({ quantity: e.target.value === "" ? null : Number(e.target.value) })
          }
          placeholder="qty"
          className="w-16 rounded-lg border border-zinc-300 bg-transparent px-2 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700"
        />
        <input
          value={ingredient.unit ?? ""}
          onChange={(e) => onChange({ unit: e.target.value || null })}
          placeholder="unit"
          className="w-20 rounded-lg border border-zinc-300 bg-transparent px-2 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700"
        />
        <input
          value={ingredient.note ?? ""}
          onChange={(e) => onChange({ note: e.target.value || null })}
          placeholder="note (optional)"
          className="flex-1 rounded-lg border border-zinc-300 bg-transparent px-2 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700"
        />
      </div>
    </div>
  );
}
