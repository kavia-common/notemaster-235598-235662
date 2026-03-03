"use client";

import React, { useEffect, useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { TagBar } from "@/components/TagBar";
import { NoteCard } from "@/components/NoteCard";
import { NoteEditorModal } from "@/components/NoteEditorModal";
import type { Note } from "@/lib/notesApi";
import {
  createNote,
  deleteNote,
  listNotes,
  listTags,
  searchNotes,
  updateNote,
} from "@/lib/notesApi";
import { ApiError } from "@/lib/apiClient";

type LoadState = "idle" | "loading" | "ready" | "error";

function errorToMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return err.bodyText
      ? `${err.message}\n\n${err.bodyText}`
      : err.message;
  }
  if (err instanceof Error) return err.message;
  return "Unknown error";
}

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string | undefined>(undefined);

  const [q, setQ] = useState("");
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Note | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const apiBaseOk = Boolean(process.env.NEXT_PUBLIC_API_BASE);

  const subtitle = useMemo(() => {
    const parts: string[] = [];
    parts.push("notes / tags / search");
    if (activeTag) parts.push(`#${activeTag}`);
    if (q.trim()) parts.push(`q="${q.trim()}"`);
    return parts.join(" • ");
  }, [activeTag, q]);

  async function refreshAll(opts?: { keepError?: boolean }) {
    setState("loading");
    if (!opts?.keepError) setError(null);

    try {
      const [tagsPayload, notesPayload] = await Promise.all([
        listTags(),
        listNotes({ tag: activeTag, q: q.trim() || undefined }),
      ]);

      setTags(tagsPayload.map((t) => t.name).filter(Boolean));
      setNotes(notesPayload);
      setState("ready");
    } catch (e) {
      setError(errorToMessage(e));
      setState("error");
    }
  }

  useEffect(() => {
    // Initial load
    refreshAll().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Refetch when tag changes (but not on first mount while idle)
    if (state === "idle") return;
    refreshAll().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag]);

  async function handleSearch() {
    const trimmed = q.trim();
    if (!trimmed) {
      refreshAll().catch(() => {});
      return;
    }
    setState("loading");
    setError(null);
    try {
      const payload = await searchNotes(trimmed);
      setNotes(payload);
      setState("ready");
    } catch (e) {
      setError(errorToMessage(e));
      setState("error");
    }
  }

  function openCreate() {
    setModalMode("create");
    setEditing(undefined);
    setSaveError(null);
    setModalOpen(true);
  }

  function openEdit(note: Note) {
    setModalMode("edit");
    setEditing(note);
    setSaveError(null);
    setModalOpen(true);
  }

  async function handleDelete(note: Note) {
    const ok = confirm(`Delete "${note.title}"?`);
    if (!ok) return;

    setError(null);
    try {
      await deleteNote(note.id);
      await refreshAll({ keepError: true });
    } catch (e) {
      setError(errorToMessage(e));
      setState("error");
    }
  }

  async function handleSubmit(data: { title: string; content: string; tags: string[] }) {
    setSaving(true);
    setSaveError(null);
    try {
      if (modalMode === "create") {
        await createNote(data);
      } else if (modalMode === "edit" && editing) {
        await updateNote(editing.id, data);
      }
      setModalOpen(false);
      await refreshAll({ keepError: true });
    } catch (e) {
      setSaveError(errorToMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="appShell">
      <div className="container py-6 flex flex-col gap-4">
        <TopNav
          title="NOTEMASTER // RETRO"
          subtitle={subtitle}
          right={
            <>
              <button type="button" className="btn btnPrimary" onClick={openCreate}>
                + New note
              </button>
            </>
          }
        />

        {!apiBaseOk ? (
          <section className="card" aria-label="Configuration warning">
            <div className="cardBody">
              <div className="errorBox" role="alert">
                Missing <code>NEXT_PUBLIC_API_BASE</code>. The frontend can’t reach the backend API.
              </div>
            </div>
          </section>
        ) : null}

        <section className="card" aria-label="Search and filters">
          <div className="cardBody">
            <div className="row">
              <div className="flex-1">
                <div className="label">Search</div>
                <input
                  className="input"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder='Try: "meeting", "todo", "retro"'
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                    if (e.key === "Escape") setQ("");
                  }}
                />
                <div className="noteMeta">
                  Tip: hit <span className="kbd">Enter</span> to search,{" "}
                  <span className="kbd">Esc</span> to clear.
                </div>
              </div>
              <div className="w-full sm:w-[220px]">
                <div className="label">Actions</div>
                <div className="flex gap-2">
                  <button type="button" className="btn btnPrimary" onClick={handleSearch}>
                    Search
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setQ("");
                      refreshAll().catch(() => {});
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <TagBar
                tags={tags}
                activeTag={activeTag}
                onSelectTag={(t) => setActiveTag(t)}
              />
            </div>
          </div>
        </section>

        {error ? (
          <section className="card" aria-label="Error message">
            <div className="cardBody">
              <div className="errorBox" role="alert">
                {error}
              </div>
            </div>
          </section>
        ) : null}

        <section className="card" aria-label="Notes list">
          <div className="cardHeader">
            <div>
              <div className="h1">NOTES</div>
              <div className="h2">
                {state === "loading"
                  ? "Loading…"
                  : `${notes.length} note${notes.length === 1 ? "" : "s"} loaded`}
              </div>
            </div>
            <button type="button" className="btn" onClick={() => refreshAll().catch(() => {})}>
              Refresh
            </button>
          </div>

          <div className="cardBody">
            {notes.length === 0 && state !== "loading" ? (
              <div className="successBox" role="status">
                No notes yet. Create one with <span className="kbd">+ New note</span>.
              </div>
            ) : null}

            <div className="noteGrid mt-3">
              {notes.map((n) => (
                <NoteCard
                  key={String(n.id)}
                  note={n}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      <NoteEditorModal
        open={modalOpen}
        mode={modalMode}
        note={editing}
        busy={saving}
        error={saveError}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
