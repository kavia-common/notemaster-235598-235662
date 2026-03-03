import React, { useEffect, useMemo, useState } from "react";
import type { Note } from "@/lib/notesApi";

type NoteEditorModalProps = {
  open: boolean;
  mode: "create" | "edit";
  note?: Note;
  busy?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; tags: string[] }) => void;
};

/**
 * PUBLIC_INTERFACE
 * Modal dialog for creating/editing a note.
 */
export function NoteEditorModal({
  open,
  mode,
  note,
  busy,
  error,
  onClose,
  onSubmit,
}: NoteEditorModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsCsv, setTagsCsv] = useState("");

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && note) {
      setTitle(note.title ?? "");
      setContent(note.content ?? "");
      setTagsCsv((note.tags ?? []).join(", "));
    } else {
      setTitle("");
      setContent("");
      setTagsCsv("");
    }
  }, [open, mode, note]);

  const tags = useMemo(() => {
    const raw = tagsCsv
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => t.replace(/^#/, ""));
    return Array.from(new Set(raw));
  }, [tagsCsv]);

  if (!open) return null;

  const titleOk = title.trim().length >= 1;
  const contentOk = content.trim().length >= 1;
  const canSubmit = titleOk && contentOk && !busy;

  return (
    <div
      className="backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "create" ? "Create note" : "Edit note"}
      onMouseDown={(e) => {
        // Close on backdrop click only.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal card">
        <div className="cardHeader">
          <div>
            <div className="h1">{mode === "create" ? "NEW NOTE" : "EDIT NOTE"}</div>
            <div className="h2">
              Use commas for tags. Press <span className="kbd">Esc</span> to close.
            </div>
          </div>
          <button type="button" className="btn btnGhost" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="cardBody">
          {error ? <div className="errorBox" role="alert">{error}</div> : null}
          <div className="row mt-3">
            <div className="flex-1">
              <div className="label">Title</div>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. SHIFT+TAB memories"
                aria-invalid={!titleOk}
              />
            </div>
            <div className="flex-1">
              <div className="label">Tags</div>
              <input
                className="input"
                value={tagsCsv}
                onChange={(e) => setTagsCsv(e.target.value)}
                placeholder="retro, todo, ideas"
              />
              <div className="noteMeta" aria-label="Parsed tags">
                {tags.length ? tags.map((t) => <span key={t} className="chip">#{t}</span>) : <span>—</span>}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="label">Content</div>
            <textarea
              className="textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your note…"
              aria-invalid={!contentOk}
            />
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button type="button" className="btn btnGhost" onClick={onClose} disabled={!!busy}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btnPrimary"
              onClick={() => onSubmit({ title: title.trim(), content: content.trim(), tags })}
              disabled={!canSubmit}
            >
              {busy ? "Saving…" : mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
