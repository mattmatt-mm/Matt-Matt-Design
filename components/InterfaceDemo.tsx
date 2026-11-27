"use client";

import {
  ArchiveIcon,
  ArrowCounterClockwiseIcon,
  BellIcon,
  CaretDownIcon,
  CheckIcon,
  ChatCircleIcon,
  FileTextIcon,
  HeartIcon,
  PushPinIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react";
import { useEffect, useId, useState, type ComponentProps } from "react";
import { INTERFACE_DEMOS, type InterfaceDemoKind } from "@/lib/interface-demos";
import { SelectMenu } from "./SelectMenu";
import { SiteSquircle } from "./SiteSquircle";
import styles from "./InterfaceDemo.module.css";

type Variant = { alternate: boolean };

function Button({
  children,
  className,
  primary,
  ...props
}: ComponentProps<"button"> & { primary?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={[styles.button, className].filter(Boolean).join(" ")}
      data-primary={primary || undefined}
    >
      <SiteSquircle asChild cornerRadius={8}>
        <span className={styles.buttonSurface} aria-hidden="true" />
      </SiteSquircle>
      <span className={styles.buttonLabel}>{children}</span>
    </button>
  );
}

function Save({ alternate, secondary = false }: Variant & { secondary?: boolean }) {
  const [saves, setSaves] = useState(0);

  return (
    <div className={styles.centered}>
      <Button
        primary
        className={secondary ? undefined : styles.squash}
        onClick={() => setSaves((count) => count + 1)}
      >
        {saves ? "Save again" : "Save draft"}
      </Button>
      <div className={styles.status} role="status">
        <span className={styles.statusText}>{saves > 0 && "Draft saved"}</span>
        {secondary && saves > 0 && (
          <span key={saves} className={styles.confirmation} aria-hidden="true">
            <CheckIcon size={alternate ? 16 : 32} weight="bold" />
          </span>
        )}
      </div>
    </div>
  );
}

function Archive({ alternate }: Variant) {
  const [state, setState] = useState<"inbox" | "archived" | "restored">("inbox");
  const hintId = useId();
  const label = state === "archived" ? "Restore" : state === "restored" ? "Restored" : "Archive";
  const Icon = state === "archived" ? ArrowCounterClockwiseIcon : state === "restored" ? CheckIcon : ArchiveIcon;

  useEffect(() => {
    if (state !== "restored") return;
    const timer = window.setTimeout(() => setState("inbox"), 1200);
    return () => window.clearTimeout(timer);
  }, [state]);

  return (
    <SiteSquircle cornerRadius={8} className={styles.workspace}>
      <DocumentLabel name="Project brief" detail="PDF document" />
      <div className={styles.archiveAction} data-state={state}>
        <Button
          aria-describedby={alternate && state === "inbox" ? hintId : undefined}
          aria-disabled={state === "restored" || undefined}
          onClick={() => {
            if (state === "restored") return;
            setState(state === "archived" ? "restored" : "archived");
          }}
        >
          <Icon aria-hidden="true" size={16} />
          {label}
        </Button>
        <span className="sr-only" role="status">
          {state === "archived" ? "Brief archived." : state === "restored" ? "Brief restored." : ""}
        </span>
        {alternate && (
          <span className={styles.archiveHint} id={hintId} hidden={state !== "inbox"}>
            Moves to Archive
          </span>
        )}
      </div>
    </SiteSquircle>
  );
}

function DocumentLabel({ name, detail }: { name: string; detail?: string }) {
  return (
    <div className={styles.document}>
      <SiteSquircle asChild cornerRadius={8}>
        <span className={styles.documentIcon} aria-hidden="true">
          <FileTextIcon size={20} />
        </span>
      </SiteSquircle>
      <div className={styles.documentName}>
        <span>{name}</span>
        {detail && <small>{detail}</small>}
      </div>
    </div>
  );
}

const INBOX = [
  { title: "Review the brief", time: "10:42", unread: true },
  { title: "Share the agenda", time: "09:15", unread: false },
  { title: "Book a room", time: "09:02", unread: true },
];

function InboxRows({ unreadOnly = false }: { unreadOnly?: boolean }) {
  return (
    <div className={styles.inboxRows} style={{ minBlockSize: `calc(${INBOX.length} * var(--demo-row-size))` }}>
      {INBOX.filter((message) => !unreadOnly || message.unread).map((message) => (
        <div className={styles.row} data-unread={message.unread || undefined} key={message.title}>
          <span className={styles.dot} data-unread={message.unread} aria-hidden="true" />
          <span className={styles.rowName}>{message.title}</span>
          <span className="sr-only">{message.unread ? ", unread" : ", read"}</span>
          <small>{message.time}</small>
        </div>
      ))}
    </div>
  );
}

function Staging() {
  const [open, setOpen] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const panelId = useId();

  return (
    <SiteSquircle cornerRadius={8} className={styles.workspace} data-open={open}>
      <div className={styles.toolbar}>
        <strong>Inbox</strong>
        <Button aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
          <SlidersHorizontalIcon aria-hidden="true" size={16} />
          Filters
        </Button>
      </div>
      <InboxRows unreadOnly={unreadOnly} />
      <div id={panelId} inert={!open} className={styles.filters}>
        <SiteSquircle asChild cornerRadius={8}>
          <label className={styles.filterLabel}>
            <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
            Unread only
          </label>
        </SiteSquircle>
      </div>
    </SiteSquircle>
  );
}

const ALERTS = [
  { title: "Comment added", Icon: ChatCircleIcon },
  { title: "Proof approved", Icon: CheckIcon },
  { title: "Draft shared", Icon: FileTextIcon },
];

function Notifications() {
  const [open, setOpen] = useState(false);
  const listId = useId();

  return (
    <SiteSquircle cornerRadius={8} className={styles.workspace}>
      <div className={styles.toolbar}>
        <strong><BellIcon aria-hidden="true" size={16} /> Alerts</strong>
        <Button aria-expanded={open} aria-controls={listId} onClick={() => setOpen(!open)}>
          {open ? "Hide alerts" : "Show alerts"}
        </Button>
      </div>
      <div id={listId} inert={!open} className={styles.notifications}>
        {ALERTS.map(({ title, Icon }) => (
          <div className={styles.row} key={title}>
            <Icon aria-hidden="true" size={16} />
            <span className={styles.rowName}>{title}</span>
          </div>
        ))}
      </div>
    </SiteSquircle>
  );
}

function Details() {
  const [open, setOpen] = useState(false);
  const detailsId = useId();

  return (
    <SiteSquircle cornerRadius={8} className={styles.workspace}>
      <div className={styles.toolbar}>
        <DocumentLabel name="Brief.pdf" />
        <Button aria-expanded={open} aria-controls={detailsId} onClick={() => setOpen(!open)}>
          Details
          <CaretDownIcon aria-hidden="true" size={16} />
        </Button>
      </div>
      <dl id={detailsId} inert={!open} className={styles.details}>
        <div><dt>Kind</dt><dd>PDF document</dd></div>
        <div><dt>Size</dt><dd>248 KB</dd></div>
      </dl>
    </SiteSquircle>
  );
}

type SortOrder = "name" | "recent";

const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "recent", label: "Recent" },
] as const;

const FILES = [
  { name: "Brief.pdf", modified: "Aug 17", day: 17 },
  { name: "Notes.txt", modified: "Aug 22", day: 22 },
  { name: "Proof.pdf", modified: "Aug 20", day: 20 },
];

function SortFiles({ compact = false }: { compact?: boolean }) {
  const [sort, setSort] = useState<SortOrder>("name");
  const files = FILES.toSorted((a, b) =>
    sort === "name" ? a.name.localeCompare(b.name) : b.day - a.day,
  );
  const menu = (
    <SelectMenu label="Sort files" options={SORT_OPTIONS} value={sort} onChange={setSort} placement={compact ? "above" : "below"} />
  );

  if (compact) {
    return (
      <div className={styles.timingControl}>
        {menu}
        <div className={styles.timingResult} role="status" aria-label="First file">
          <FileTextIcon aria-hidden="true" size={16} />
          {files[0].name}
        </div>
      </div>
    );
  }

  return (
    <SiteSquircle cornerRadius={8} className={styles.workspace}>
      <div className={styles.toolbar}>
        <strong>Files</strong>
        <div className={styles.sortMenu}>{menu}</div>
      </div>
      <div className={styles.inboxRows}>
        {files.map(({ name, modified }) => (
          <div className={styles.row} key={name}>
            <FileTextIcon aria-hidden="true" size={16} />
            <span className={styles.rowName}>{name}</span>
            <small>{modified}</small>
          </div>
        ))}
      </div>
      <span className="sr-only" role="status">
        {sort === "name" ? "Sorted by name" : "Most recent files first"}
      </span>
    </SiteSquircle>
  );
}

function Pin() {
  const [pinned, setPinned] = useState(false);

  return (
    <div className={styles.pin}>
      <div className={styles.pinDestination}>
        Pinned
        <span className={styles.pinDestinationIcon} data-pinned={pinned}>
          <PushPinIcon aria-hidden="true" size={20} className={styles.pinOutline} />
          {pinned && (
            <span className={styles.landedPin}>
              <PushPinIcon aria-hidden="true" size={20} weight="fill" />
            </span>
          )}
        </span>
      </div>
      <Button className={styles.pinButton} aria-pressed={pinned} onClick={() => setPinned(!pinned)}>
        <PushPinIcon aria-hidden="true" size={20} />
        Pin brief
      </Button>
      {pinned && (
        <span className={styles.flyingPin} aria-hidden="true">
          <PushPinIcon size={20} weight="fill" />
        </span>
      )}
      <span className="sr-only" role="status">{pinned ? "Brief pinned" : ""}</span>
    </div>
  );
}

function Verify() {
  const [result, setResult] = useState<"invalid" | "verified" | null>(null);
  const [attempt, setAttempt] = useState(0);
  const codeId = useId();
  const statusId = useId();

  return (
    <form
      className={styles.codeForm}
      onSubmit={(event) => {
        event.preventDefault();
        const code = new FormData(event.currentTarget).get("code");
        setResult(/^\d{4}$/.test(String(code)) ? "verified" : "invalid");
        setAttempt((count) => count + 1);
      }}
    >
      <label htmlFor={codeId}>Example access code</label>
      <div className={styles.codeControls}>
        <SiteSquircle asChild cornerRadius={8}>
          <input
            id={codeId}
            name="code"
            placeholder="4 digits"
            inputMode="numeric"
            maxLength={4}
            autoComplete="off"
            aria-invalid={result === "invalid"}
            aria-describedby={statusId}
            onChange={() => setResult(null)}
            className={styles.codeInput}
          />
        </SiteSquircle>
        <Button type="submit">Verify</Button>
      </div>
      <div id={statusId} role="status" className={styles.status}>
        <span key={attempt} className={styles.error} data-invalid={result === "invalid"}>
          {result === "invalid" ? "Enter four digits." : result === "verified" ? "Code verified." : ""}
        </span>
      </div>
    </form>
  );
}

function Favorite() {
  const [favorite, setFavorite] = useState(false);

  return (
    <div className={styles.centered}>
      <Button aria-pressed={favorite} onClick={() => setFavorite(!favorite)}>
        <HeartIcon
          aria-hidden="true"
          className={styles.heart}
          size={20}
          weight={favorite ? "fill" : "regular"}
        />
        Favorite
      </Button>
      <span className={styles.status} role="status">{favorite ? "Added to favorites" : ""}</span>
    </div>
  );
}

const EXAMPLES = {
  squash: Save,
  anticipation: Archive,
  staging: Staging,
  poses: Details,
  stagger: Notifications,
  easing: Details,
  arc: Pin,
  secondary: (props: Variant) => <Save {...props} secondary />,
  duration: () => <SortFiles compact />,
  shake: Verify,
  depth: () => <SortFiles />,
  appeal: Favorite,
};

export function InterfaceDemo({ kind }: { kind: InterfaceDemoKind }) {
  const Example = EXAMPLES[kind];
  const labelId = useId();
  const { name, variants } = INTERFACE_DEMOS[kind];

  return (
    <div className={styles.demo} data-demo={kind} role="group" aria-labelledby={labelId}>
      <span id={labelId} className="sr-only">{name} comparison</span>
      <SiteSquircle className={styles.stage}>
        {variants.map((label, index) => (
          <div className={styles.pane} key={label} data-alternate={index === 1} role="group" aria-label={label}>
            <div className={styles.sample}>
              <Example alternate={index === 1} />
            </div>
            <p className={styles.caption}>{label}</p>
          </div>
        ))}
      </SiteSquircle>
    </div>
  );
}
