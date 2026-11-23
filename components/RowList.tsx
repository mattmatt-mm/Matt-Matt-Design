import Link from "next/link";

export type Row = {
  title: string;
  href?: string;
  group: string;
};

function Title({ row, cursor }: { row: Row; cursor?: string }) {
  const external = row.href?.startsWith("http");

  if (!row.href) return <>{row.title}</>;

  const className = "press-shrink inline-block no-underline hover:opacity-60";

  if (external) {
    return (
      <a
        href={row.href}
        className={className}
        data-cursor={cursor && "View website"}
        rel="noopener noreferrer"
        target="_blank"
      >
        {row.title}
      </a>
    );
  }

  return (
    <Link href={row.href} className={className} data-cursor={cursor}>
      {row.title}
    </Link>
  );
}

export function RowList({
  rows,
  cursor,
}: {
  rows: Row[];
  /** Label for the view cursor over linked titles, e.g. "View project".
   * Titles that leave the site read "View website" instead. */
  cursor?: string;
}) {
  const groups = [...Map.groupBy(rows, (row) => row.group)].sort(
    ([a], [b]) => (Number(b) || 0) - (Number(a) || 0),
  );

  return (
    <dl className="flex flex-col gap-2">
      {groups.map(([group, projects]) => (
        <div
          key={group}
          className="grid grid-cols-[32px_minmax(0,1fr)] gap-2"
        >
          <dt className="text-muted-readable tabular-nums">{group || "Work"}</dt>
          <dd>
            <ul className="flex flex-col gap-1">
              {projects.map((project) => (
                <li key={project.title}>
                  <Title row={project} cursor={cursor} />
                </li>
              ))}
            </ul>
          </dd>
        </div>
      ))}
    </dl>
  );
}
