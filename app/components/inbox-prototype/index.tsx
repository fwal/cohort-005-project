// PROTOTYPE — throwaway. Answers "How does the in-app inbox look and behave?"
// (https://github.com/fwal/cohort-005-project/issues/6).
//
// Three variants of the inbox, mounted in the real app layout, switchable via
// ?variant=A|B|C and the floating bar (← / → keys):
//   A  Popover off a bell in the sidebar header — mimics Knock's prebuilt
//      <NotificationFeedPopover>: badge counts unseen, hover to archive.
//   B  "Inbox" sidebar item + full inbox page with a detail pane — custom UI on
//      Knock's useNotifications hooks: badge counts unread, Inbox/Archive tabs.
//   C  Bell in a top bar + right drawer split into "Needs you" / "Updates" —
//      no archive at all, dot instead of a count, toast on live arrival.
//
// Data is stubbed from the v1 catalogue and lives in memory; nothing talks to Knock.
// Every variant shows a ~700ms loading state first, because Knock only fetches
// the feed in the browser after hydration (spike #7, surprise 1).
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import {
  Archive,
  ArchiveRestore,
  Bell,
  CheckCheck,
  Inbox,
  Mail,
  MailOpen,
  X,
} from "lucide-react";
import { cn } from "~/lib/utils";
import {
  PrototypeSwitcher,
  usePrototypeVariant,
  type PrototypeVariant,
} from "~/components/prototype-switcher";
import {
  isToday,
  simulatedFor,
  stubFeedFor,
  timeAgo,
  type InboxRole,
  type StubNotification,
} from "./data";

const VARIANTS: PrototypeVariant[] = [
  { key: "A", name: "Knock popover, sidebar bell" },
  { key: "B", name: "Inbox page + detail pane" },
  { key: "C", name: "Top-bar drawer, no archive" },
];

// ─── shared in-memory state ─────────────────────────────────────────────────

interface InboxState {
  items: StubNotification[];
  loaded: boolean;
  variant: string;
  markAllSeen: () => void;
  markRead: (id: string, read?: boolean) => void;
  markAllRead: () => void;
  archive: (id: string, archived?: boolean) => void;
  simulate: () => StubNotification;
  open: (n: StubNotification) => void;
}

const Ctx = createContext<InboxState | null>(null);
const useInbox = () => useContext(Ctx)!;

export function InboxPrototypeProvider({
  role,
  isTeamAdmin,
  children,
}: {
  role: InboxRole | null;
  isTeamAdmin: boolean;
  children: React.ReactNode;
}) {
  const [items, setItems] = useState(() => stubFeedFor(role, isTeamAdmin));
  const [loaded, setLoaded] = useState(false);
  const simCount = useRef(0);
  const variant = usePrototypeVariant(VARIANTS).key;
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 700);
    return () => clearTimeout(t);
  }, []);

  const patch = (fn: (n: StubNotification) => Partial<StubNotification>, id?: string) =>
    setItems((xs) => xs.map((n) => (id === undefined || n.id === id ? { ...n, ...fn(n) } : n)));

  const markRead = useCallback((id: string, read = true) => patch(() => ({ read, seen: true }), id), []);
  const value: InboxState = {
    items,
    loaded,
    variant,
    markAllSeen: () => patch(() => ({ seen: true })),
    markRead,
    markAllRead: () => patch(() => ({ read: true, seen: true })),
    archive: (id, archived = true) => patch(() => ({ archived, read: true, seen: true }), id),
    simulate: () => {
      const n = simulatedFor(role, isTeamAdmin, simCount.current++);
      setItems((xs) => [n, ...xs]);
      return n;
    },
    open: (n) => {
      markRead(n.id);
      // Keep ?variant= so the prototype survives the navigation.
      const [path, hash] = n.link.split("#");
      navigate(`${path}?variant=${variant}${hash ? `#${hash}` : ""}`);
    },
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <PrototypeSwitcher variants={VARIANTS}>
        <button
          className="rounded-full bg-fuchsia-600 px-2 py-0.5 text-xs font-medium hover:bg-fuchsia-500"
          title="Push a new Notification into the feed, as if Knock delivered it live"
          onClick={() => {
            const n = value.simulate();
            if (variant === "C") {
              toast(<Summary text={n.summary} />, {
                action: { label: "View", onClick: () => value.open(n) },
              });
            }
          }}
        >
          + simulate Notification
        </button>
      </PrototypeSwitcher>
    </Ctx.Provider>
  );
}

// ─── slots the app layout mounts ────────────────────────────────────────────

export function InboxSidebarHeaderSlot() {
  const { variant } = useInbox();
  return variant === "A" ? <VariantABell /> : null;
}

export function InboxSidebarNavSlot() {
  const { variant } = useInbox();
  return variant === "B" ? <VariantBNavItem /> : null;
}

export function InboxMainSlot({ children }: { children: React.ReactNode }) {
  const { variant } = useInbox();
  if (variant === "B") return <VariantBMain>{children}</VariantBMain>;
  if (variant === "C") return <VariantCMain>{children}</VariantCMain>;
  return <>{children}</>;
}

// ─── shared bits ────────────────────────────────────────────────────────────

function Summary({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split("**").map((part, i) =>
        i % 2 ? (
          <strong key={i} className="font-semibold text-foreground">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

function Initials({ name }: { name: string }) {
  const initials =
    name === "Cadence"
      ? "C"
      : name
          .split(" ")
          .map((p) => p[0])
          .slice(0, 2)
          .join("");
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        name === "Cadence"
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground"
      )}
    >
      {initials}
    </div>
  );
}

function LoadingRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex animate-pulse gap-3">
          <div className="size-8 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-5/6 rounded bg-muted" />
            <div className="h-3 w-1/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOutside();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [active, onOutside, ref]);
}

// ─── Variant A: Knock-stock popover ─────────────────────────────────────────

function VariantABell() {
  const inbox = useInbox();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  const unseen = inbox.items.filter((n) => !n.seen && !n.archived).length;
  const visible = inbox.items.filter(
    (n) =>
      !n.archived &&
      (filter === "all" || (filter === "unread" ? !n.read : n.read))
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o);
          inbox.markAllSeen(); // Knock marks the feed seen when the popover opens
        }}
        className="relative rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        title="Notifications"
      >
        <Bell className="size-5" />
        {inbox.loaded && unseen > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">
            {unseen}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-full top-0 z-50 ml-3 w-96 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Notifications</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="rounded border bg-background px-1 py-0.5 text-xs"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
            <button
              onClick={inbox.markAllRead}
              className="text-xs text-primary hover:underline"
            >
              Mark all as read
            </button>
          </div>
          <div className="max-h-[28rem] overflow-y-auto">
            {!inbox.loaded ? (
              <LoadingRows />
            ) : visible.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              visible.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    inbox.open(n);
                    setOpen(false);
                  }}
                  className="group relative flex cursor-pointer gap-3 border-b px-4 py-3 last:border-0 hover:bg-muted/50"
                >
                  {!n.read && (
                    <span className="absolute left-1.5 top-5 size-1.5 rounded-full bg-blue-500" />
                  )}
                  <Initials name={n.actor} />
                  <div className="min-w-0 flex-1 text-sm">
                    <Summary
                      text={n.summary}
                      className="text-muted-foreground"
                    />
                    <div className="mt-1 text-xs text-muted-foreground/70">
                      {timeAgo(n.minutesAgo)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      inbox.archive(n.id);
                    }}
                    title="Archive"
                    className="invisible self-start rounded p-1 text-muted-foreground hover:bg-muted group-hover:visible"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="border-t px-4 py-2 text-center text-[10px] uppercase tracking-wide text-muted-foreground/60">
            Powered by Knock
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Variant B: Inbox page with detail pane ─────────────────────────────────

function VariantBNavItem() {
  const inbox = useInbox();
  const [params, setParams] = useSearchParams();
  const unread = inbox.items.filter((n) => !n.read && !n.archived).length;
  const active = params.get("inbox") === "1";
  return (
    <button
      onClick={() => {
        const p = new URLSearchParams(params);
        p.set("inbox", "1");
        setParams(p);
      }}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Inbox className="size-4" />
      Inbox
      {inbox.loaded && unread > 0 && (
        <span className="ml-auto rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
          {unread}
        </span>
      )}
    </button>
  );
}

function VariantBMain({ children }: { children: React.ReactNode }) {
  const [params] = useSearchParams();
  // In production this would be its own /inbox route; a search param keeps the prototype self-contained.
  return params.get("inbox") === "1" ? <VariantBPage /> : <>{children}</>;
}

function VariantBPage() {
  const inbox = useInbox();
  const [tab, setTab] = useState<"inbox" | "archive">("inbox");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const list = inbox.items.filter((n) => (tab === "inbox" ? !n.archived : n.archived));
  const selected = inbox.items.find((n) => n.id === selectedId) ?? null;
  const groups = [
    { label: "Today", items: list.filter((n) => isToday(n.minutesAgo)) },
    { label: "Earlier", items: list.filter((n) => !isToday(n.minutesAgo)) },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="flex h-full">
      <div className="flex w-[26rem] shrink-0 flex-col border-r">
        <div className="border-b px-5 pb-0 pt-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Inbox</h1>
            <button
              onClick={inbox.markAllRead}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="size-4" /> Mark all read
            </button>
          </div>
          <div className="mt-3 flex gap-4 text-sm">
            {(["inbox", "archive"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setSelectedId(null);
                }}
                className={cn(
                  "-mb-px border-b-2 pb-2 capitalize",
                  tab === t
                    ? "border-primary font-medium"
                    : "border-transparent text-muted-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {!inbox.loaded ? (
            <LoadingRows rows={5} />
          ) : groups.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              {tab === "inbox" ? "You're all caught up." : "Nothing archived."}
            </div>
          ) : (
            groups.map((g) => (
              <div key={g.label}>
                <div className="sticky top-0 bg-background/95 px-5 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur">
                  {g.label}
                </div>
                {g.items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setSelectedId(n.id);
                      inbox.markRead(n.id);
                    }}
                    className={cn(
                      "flex w-full gap-3 border-l-2 px-5 py-3 text-left text-sm",
                      selectedId === n.id
                        ? "border-primary bg-muted"
                        : "border-transparent hover:bg-muted/50",
                      !n.read && "bg-primary/5"
                    )}
                  >
                    <Initials name={n.actor} />
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-2">
                        <Summary
                          text={n.summary}
                          className={n.read ? "text-muted-foreground" : "text-foreground"}
                        />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {timeAgo(n.minutesAgo)}
                      </div>
                    </div>
                    {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10">
        {!selected ? (
          <div className="flex h-full flex-col items-center justify-center text-sm text-muted-foreground">
            <Mail className="mb-3 size-10 opacity-30" />
            Select a Notification to read it.
          </div>
        ) : (
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <Initials name={selected.actor} />
              <div className="text-sm">
                <div className="font-medium">{selected.actor}</div>
                <div className="text-muted-foreground">{timeAgo(selected.minutesAgo)}</div>
              </div>
              <div className="ml-auto flex gap-1">
                <button
                  onClick={() => {
                    inbox.markRead(selected.id, false);
                    setSelectedId(null);
                  }}
                  title="Mark unread"
                  className="rounded p-2 text-muted-foreground hover:bg-muted"
                >
                  <MailOpen className="size-4" />
                </button>
                <button
                  onClick={() => {
                    inbox.archive(selected.id, !selected.archived);
                    setSelectedId(null);
                  }}
                  title={selected.archived ? "Move to inbox" : "Archive"}
                  className="rounded p-2 text-muted-foreground hover:bg-muted"
                >
                  {selected.archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
                </button>
              </div>
            </div>
            <p className="mt-6 text-lg leading-relaxed">
              <Summary text={selected.summary} />
            </p>
            {selected.detail && (
              <div className="mt-4 space-y-3 whitespace-pre-line rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                {selected.detail}
              </div>
            )}
            <button
              onClick={() => inbox.open(selected)}
              className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {selected.linkLabel} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Variant C: top-bar drawer, Needs you / Updates, no archive ─────────────

function VariantCMain({ children }: { children: React.ReactNode }) {
  const inbox = useInbox();
  const [open, setOpen] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);

  const anyUnread = inbox.items.some((n) => !n.read);
  const visible = inbox.items.filter((n) => !unreadOnly || !n.read);
  const needsYou = visible.filter((n) => n.kind === "refund-request-opened" && n.requestStatus === "open");
  const updates = visible.filter((n) => !needsYou.includes(n));

  return (
    <>
      <div className="sticky top-0 z-30 flex h-12 items-center justify-end border-b bg-background/90 px-6 backdrop-blur">
        <button
          onClick={() => setOpen(true)}
          className="relative rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Notifications"
        >
          <Bell className="size-5" />
          {inbox.loaded && anyUnread && (
            <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full border-2 border-background bg-red-500" />
          )}
        </button>
      </div>
      {children}

      {open && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/20" onClick={() => setOpen(false)}>
          <div
            className="flex h-full w-[28rem] flex-col bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-muted">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex items-center justify-between border-b px-5 py-2 text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={(e) => setUnreadOnly(e.target.checked)}
                />
                Unread only
              </label>
              <button onClick={inbox.markAllRead} className="text-xs text-primary hover:underline">
                Mark all read
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {!inbox.loaded ? (
                <LoadingRows rows={4} />
              ) : (
                <>
                  {needsYou.length > 0 && (
                    <CSection title="Needs you" items={needsYou} accent />
                  )}
                  <CSection title="Updates" items={updates} />
                  {visible.length === 0 && (
                    <div className="p-10 text-center text-sm text-muted-foreground">
                      Nothing unread.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CSection({ title, items, accent }: { title: string; items: StubNotification[]; accent?: boolean }) {
  const inbox = useInbox();
  if (items.length === 0) return null;
  return (
    <div>
      <div
        className={cn(
          "px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider",
          accent ? "text-amber-600" : "text-muted-foreground"
        )}
      >
        {title} · {items.length}
      </div>
      {items.map((n) => (
        <button
          key={n.id}
          onClick={() => inbox.open(n)}
          className={cn(
            "mx-3 mb-2 block w-[calc(100%-1.5rem)] rounded-lg border p-3 text-left text-sm transition-colors hover:border-primary/50",
            accent && "border-amber-300 bg-amber-50 dark:bg-amber-950/20",
            n.read && !accent && "opacity-60"
          )}
        >
          <div className="flex items-start gap-2">
            {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-red-500" />}
            <div className="min-w-0 flex-1">
              <Summary text={n.summary} className="text-muted-foreground" />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{timeAgo(n.minutesAgo)}</span>
                {n.kind === "refund-request-opened" && n.requestStatus !== "open" ? (
                  <span className="rounded bg-muted px-1.5 py-0.5">
                    {n.requestStatus === "approved" ? "Approved" : "Declined"} by {n.requestDecidedBy}
                  </span>
                ) : (
                  <span className="font-medium text-primary">{n.linkLabel} →</span>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
