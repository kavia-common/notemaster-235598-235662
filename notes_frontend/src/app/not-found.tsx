import React from "react";

export default function NotFound() {
  return (
    <main className="appShell">
      <div className="container py-10">
        <section className="card" role="alert" aria-live="assertive">
          <div className="cardHeader">
            <div>
              <div className="h1">404 // PAGE NOT FOUND</div>
              <div className="h2">The route you requested does not exist.</div>
            </div>
          </div>
          <div className="cardBody">
            <p className="text-sm text-[color:var(--muted)]">
              Use the navigation to return to the main console.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
