/**
 * A row of short points — a process, principles, insights, lessons:
 * {% points %}{% point title="Think in systems" text="…" /%}{% /points %}.
 * The title is the foreground colour and its one line muted beneath it, in
 * equal columns like Stats. Styles are `.points` in globals.css.
 */
export function Points({ children }: { children: React.ReactNode }) {
  return <ul className="points">{children}</ul>;
}

export function Point({ title, text }: { title: string; text?: string }) {
  return (
    <li>
      <p>{title}</p>
      {text ? <p className="text-muted">{text}</p> : null}
    </li>
  );
}
