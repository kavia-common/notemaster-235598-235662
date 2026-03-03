import React from "react";
import type { Note } from "@/lib/notesApi";

type NoteCardProps = {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
};

/**
 * PUBLIC_INTERFACE
 * Renders a single note in the grid.
 */
export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const tags = note.tags ?? [];

  return (
    <article className="noteCard" aria-label={`Note ${note.title}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="noteTitle">{note.title}</h3>
          <div className="noteMeta">
            {note.updated_at ? (
              <span>updated {new Date(note.updated_at).toLocaleString()}</span>
            ) : note.created_at ? (
              <span>created {new Date(note.created_at).toLocaleString()}</span>
            ) : (
              <span>—</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className="btn btnGhost" onClick={() => onEdit(note)}>
            Edit
          </button>
          <button type="button" className="btn btnDanger" onClick={() => onDelete(note)}>
            Delete
          </button>
        </div>
      </div>

      <div className="hr" />

      <p className="text-sm text-[color:var(--muted)] whitespace-pre-wrap break-words">
        {note.content}
      </p>

      {tags.length ? (
        <div className="noteMeta" aria-label="Note tags">
          {tags.map((t) => (
            <span key={t} className="chip">
              #{t}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
