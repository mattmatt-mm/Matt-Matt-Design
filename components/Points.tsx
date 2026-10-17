import { PointFigure, type PointFigureName } from "./PointFigure";

/**
 * A row of short points — a process, principles, insights, lessons:
 * {% points %}{% point title="Think in systems" text="…" /%}{% /points %}.
 * The title is the foreground colour and its one line muted beneath it, in
 * equal columns like Stats. Styles are `.points` in globals.css.
 */
export function Points({ children }: { children: React.ReactNode }) {
  return <ul className="points">{children}</ul>;
}

export function Point({
  title,
  text,
  figure,
}: {
  title: string;
  text?: string;
  figure?: PointFigureName;
}) {
  return (
    <li>
      {figure ? <PointFigure name={figure} /> : null}
      <p>{title}</p>
      {text ? <p className="text-muted">{text}</p> : null}
    </li>
  );
}
