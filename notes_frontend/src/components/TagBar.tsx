import React from "react";

type TagBarProps = {
  tags: string[];
  activeTag?: string;
  onSelectTag: (tag?: string) => void;
};

/**
 * PUBLIC_INTERFACE
 * Horizontal tag filter bar.
 */
export function TagBar({ tags, activeTag, onSelectTag }: TagBarProps) {
  const uniq = Array.from(new Set(tags)).sort((a, b) => a.localeCompare(b));

  return (
    <section className="card" aria-label="Tag filters">
      <div className="cardBody">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`chip ${!activeTag ? "chipActive" : ""}`}
            onClick={() => onSelectTag(undefined)}
          >
            All tags
          </button>
          {uniq.map((t) => (
            <button
              key={t}
              type="button"
              className={`chip ${activeTag === t ? "chipActive" : ""}`}
              onClick={() => onSelectTag(t)}
            >
              #{t}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
