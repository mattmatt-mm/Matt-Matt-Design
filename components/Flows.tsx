/**
 * The problem drawn as two step lists side by side that meet in one shared
 * outcome — e.g. the six steps of a traditional sensor setup against Incipe's
 * two: {% flows outcome="Integrate, deploy & test" %}
 * {% flow title="Traditional setup" steps="Read datasheets | Wire the sensor" /%}
 * {% /flows %}. Steps are separated by `|`. Drawn with the list rows' own
 * hairlines and type; styles are `.flows` in globals.css.
 */
export function Flows({
  outcome,
  note,
  children,
}: {
  outcome?: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="flows">
      <div className="flows-columns">{children}</div>
      {outcome ? (
        <figcaption className="flows-outcome">
          <p>{outcome}</p>
          {note ? <p className="text-muted">{note}</p> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function Flow({ title, steps }: { title: string; steps: string }) {
  const list = steps
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    <div className="flow">
      <p className="flow-title">
        {title}{" "}
        <span className="text-muted">
          {list.length} {list.length === 1 ? "step" : "steps"}
        </span>
      </p>
      <ol>
        {list.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}
