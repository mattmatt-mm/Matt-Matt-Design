/**
 * A row of figures inside a case study or post:
 * {% stats %}{% stat value="US$48K" label="revenue in three months" /%}{% /stats %}.
 * The figure is the foreground colour and its label muted beneath it — the
 * site's 16/21 type throughout, so the hierarchy comes from colour and
 * position, never size. Styles are `.stats` in globals.css.
 */
export function Stats({ children }: { children: React.ReactNode }) {
  return <dl className="stats">{children}</dl>;
}

export function Stat({ value, label }: { value: string; label?: string }) {
  return (
    <div>
      <dt>{value}</dt>
      {label ? <dd className="text-muted">{label}</dd> : null}
    </div>
  );
}
