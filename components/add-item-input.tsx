"use client";

import { useEffect, useRef, useState } from "react";
import { searchItems } from "@/lib/db/items";
import type { Item } from "@/types/item";

export default function AddItemInput({
  onAddByName,
  onAddItem,
  showAddButton = false,
}: {
  onAddByName: (name: string) => void;
  onAddItem: (item: Item) => void;
  showAddButton?: boolean;
}) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<Item[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const trimmed = value.trim();
      setSuggestions(trimmed ? await searchItems(trimmed) : []);
    }, 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAddByName(trimmed);
    setValue("");
    setSuggestions([]);
  }

  function pickSuggestion(item: Item) {
    onAddItem(item);
    setValue("");
    setSuggestions([]);
  }

  return (
    <div className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex gap-2"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          enterKeyHint="done"
          placeholder="Add an item..."
          className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-transparent px-4 py-3 text-base outline-none focus:border-emerald-600 dark:border-zinc-700"
        />
        {showAddButton && (
          <button
            type="submit"
            aria-label="Add ingredient"
            className="flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-2xl leading-none text-white active:bg-emerald-700"
          >
            +
          </button>
        )}
      </form>
      {suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-zinc-300 bg-[var(--background)] shadow-lg dark:border-zinc-700">
          {suggestions.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => pickSuggestion(item)}
                className="block w-full px-4 py-2.5 text-left active:bg-zinc-100 dark:active:bg-zinc-800"
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
