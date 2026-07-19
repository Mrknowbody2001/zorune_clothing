"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type CategoryOption = {
  id: string;
  name: string;
};

type CategorySearchSelectProps = {
  disabled?: boolean;
  error?: string;
  label?: string;
  onChange: (value: string) => void;
  options: CategoryOption[];
  placeholder?: string;
  value: string;
};

export default function CategorySearchSelect({
  disabled = false,
  error,
  label = "Main Category",
  onChange,
  options,
  placeholder = "Search and choose a main category",
  value,
}: CategorySearchSelectProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.id === value) ?? null;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(selectedOption?.name ?? "");
  const inputValue = open ? query : (selectedOption?.name ?? query);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return options;
    }

    return options
      .filter((option) => option.name.toLowerCase().includes(normalized))
      .sort((first, second) => {
        const firstStarts = first.name.toLowerCase().startsWith(normalized);
        const secondStarts = second.name.toLowerCase().startsWith(normalized);

        if (firstStarts && !secondStarts) return -1;
        if (!firstStarts && secondStarts) return 1;

        return first.name.localeCompare(second.name);
      });
  }, [options, query]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700">{label}</label>
      <div ref={containerRef} className="relative">
        <div
          className={cn(
            "flex min-h-10 items-center rounded-md border bg-white px-3",
            error ? "border-red-300" : "border-zinc-200",
            disabled ? "bg-zinc-100" : "focus-within:ring-2 focus-within:ring-zinc-400"
          )}
        >
          <Search className="mr-2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={inputValue}
            disabled={disabled}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);

              const nextValue = event.target.value.trim();
              if (!nextValue) {
                onChange("");
              }
            }}
            onFocus={() => {
              setOpen(true);
              setQuery(selectedOption?.name ?? query);
            }}
            placeholder={placeholder}
            className="h-10 w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
          />
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            disabled={disabled}
            className="text-zinc-400"
            aria-label="Toggle category options"
          >
            <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
          </button>
        </div>

        {open && !disabled && (
          <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-xl">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option.id === value;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onChange(option.id);
                      setQuery(option.name);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition",
                      isSelected
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                    )}
                  >
                    <span>{option.name}</span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-3 text-sm text-zinc-500">
                No main categories match your search yet.
              </div>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
