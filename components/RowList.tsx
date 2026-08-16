import Link from "next/link";

export type Row = {
  /** Muted left-column label. Only the first row of a group carries one. */
  label?: string;
  title: string;
  href?: string;
  /** Rows sharing a group are separated by an inset rule, not a full one. */
  group: string;
  lang?: "en" | "zh";
};

function Title({ row }: { row: Row }) {
  const external = row.href?.startsWith("http");

  if (!row.href) return <>{row.title}</>;

  if (external) {
    return (
      <a
        href={row.href}
        className="no-underline hover:opacity-60"
        rel="noopener noreferrer"
        target="_blank"
      >
        {row.title}
      </a>
    );
  }

  return (
    <Link href={row.href} className="no-underline hover:opacity-60">
      {row.title}
    </Link>
  );
}

export function RowList({ rows }: { rows: Row[] }) {
  return (
    <ul>
      {rows.map((row, i) => {
        const next = rows[i + 1];
        const startsNewGroup = next ? next.group !== row.group : false;

        return (
          <li key={`${row.group}-${row.title}`}>
            {/* Two columns at every width — label left, title right. The label
                is out of flow so a two-line label ("26 / Spring") overhangs the
                rule rather than growing the row, as in the export. */}
            <div className="relative py-3">
              {row.label ? (
                <span className="text-muted absolute top-3 left-0 w-25 whitespace-pre-line">
                  {row.label}
                </span>
              ) : null}
              <div
                className="ml-25"
                lang={row.lang === "zh" ? "zh-Hant" : undefined}
              >
                <Title row={row} />
              </div>
            </div>

            {next ? (
              <div
                className={`bg-line h-px ${startsNewGroup ? "" : "ml-25"}`}
                aria-hidden="true"
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
