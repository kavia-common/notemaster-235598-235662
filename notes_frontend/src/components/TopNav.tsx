import React from "react";

type TopNavProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

/**
 * PUBLIC_INTERFACE
 * App top navigation header.
 */
export function TopNav({ title, subtitle, right }: TopNavProps) {
  return (
    <header className="card" role="banner" aria-label="Application header">
      <div className="cardHeader">
        <div>
          <div className="h1">{title}</div>
          {subtitle ? <div className="h2">{subtitle}</div> : null}
        </div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </header>
  );
}
