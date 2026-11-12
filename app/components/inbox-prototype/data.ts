// PROTOTYPE — throwaway. Stub Notifications built from the v1 catalogue
// (https://github.com/fwal/cohort-005-project/issues/4). No Knock calls; all in memory.

export type NotificationKind =
  | "refund-approved" // 1
  | "refund-declined" // 2
  | "refund-failed" // 3 (ships once Refund tracking exists)
  | "refund-request-opened" // 4
  | "seat-claimed" // 5
  | "lesson-comment" // 6
  | "comment-reply"; // 7

export interface StubNotification {
  id: string;
  kind: NotificationKind;
  actor: string; // who caused it ("Cadence" for system events)
  /** One-line text as it would sit in a feed row. `**x**` = bold. */
  summary: string;
  /** Longer text a detail view could show (admin note, what is lost, full comment). */
  detail?: string;
  link: string;
  linkLabel: string;
  minutesAgo: number;
  seen: boolean;
  read: boolean;
  archived: boolean;
  /** Only for refund-request-opened: where the request stands now. */
  requestStatus?: "open" | "approved" | "declined";
  requestDecidedBy?: string;
}

type Template = Omit<
  StubNotification,
  "id" | "minutesAgo" | "seen" | "read" | "archived"
>;

const T = {
  approvedIndividual: {
    kind: "refund-approved",
    actor: "Cadence",
    summary:
      "Your Refund Request for **Introduction to TypeScript** was approved. You'll get back **$49.00**.",
    detail:
      "Your Enrollment in Introduction to TypeScript has ended. Your lesson progress is kept if you buy the course again.\n\nNote from Alex Rivera: “Sorry it wasn't the right fit — hope to see you back.”",
    link: "/settings",
    linkLabel: "View purchase",
  },
  approvedTeam: {
    kind: "refund-approved",
    actor: "Cadence",
    summary:
      "Your Refund Request for **Design Systems with Tailwind** (Team Licence) was approved. You'll get back **$180.00**.",
    detail:
      "The 4 Unclaimed Seats on this Team Licence are void and can no longer be claimed. Students who already claimed a Seat keep their Enrollment.",
    link: "/team",
    linkLabel: "View Team Licence",
  },
  declined: {
    kind: "refund-declined",
    actor: "Cadence",
    summary:
      "Your Refund Request for **Building REST APIs with Node.js** was declined.",
    detail:
      "Note from Alex Rivera: “You've completed 80% of the course, which is past our refund window. If something in the course was broken, reply with details and we'll take another look.”\n\nYou can raise a new Refund Request from your purchase.",
    link: "/settings",
    linkLabel: "View purchase",
  },
  failed: {
    kind: "refund-failed",
    actor: "Cadence",
    summary:
      "We couldn't send your refund of **$39.00** for **Practical Data Visualisation**. We're looking into it.",
    link: "/settings",
    linkLabel: "View purchase",
  },
  opened: (buyer: string, course: string, type: string, reason: string) =>
    ({
      kind: "refund-request-opened",
      actor: buyer,
      summary: `**${buyer}** asked for a refund on **${course}** (${type}): “${reason}”`,
      detail: `Full reason from ${buyer}: “${reason} I tried the first two modules and the pace is too slow for me. I'd rather put the money toward something more advanced.”`,
      link: "/admin/refunds",
      linkLabel: "Review request",
    }) satisfies Template,
  seat: (student: string, n: number) =>
    ({
      kind: "seat-claimed",
      actor: student,
      summary: `**${student}** claimed a Seat on **Design Systems with Tailwind**. ${n} of 10 Seats are now claimed.`,
      link: "/team",
      linkLabel: "View Team Licence",
    }) satisfies Template,
  comment: (who: string, lessonId: number, lesson: string, line: string) =>
    ({
      kind: "lesson-comment",
      actor: who,
      summary: `**${who}** commented on **${lesson}**: “${line}”`,
      detail: `“${line} I followed the steps exactly but my editor still shows the error. Is there a setting I'm missing?”`,
      link: `/courses/introduction-to-typescript/lessons/${lessonId}#comment`,
      linkLabel: "Go to comment",
    }) satisfies Template,
  reply: (who: string, lessonId: number, lesson: string, line: string) =>
    ({
      kind: "comment-reply",
      actor: who,
      summary: `**${who}** replied to your comment on **${lesson}**: “${line}”`,
      link: `/courses/introduction-to-typescript/lessons/${lessonId}#comment`,
      linkLabel: "Go to reply",
    }) satisfies Template,
} as const;

let counter = 0;
function make(
  t: Template,
  minutesAgo: number,
  state: Partial<Pick<StubNotification, "seen" | "read" | "archived">> = {},
  extra: Partial<StubNotification> = {}
): StubNotification {
  return {
    ...t,
    id: `n${++counter}`,
    minutesAgo,
    seen: state.seen ?? false,
    read: state.read ?? false,
    archived: state.archived ?? false,
    ...extra,
  };
}

export type InboxRole = "student" | "instructor" | "admin";

export function stubFeedFor(role: InboxRole | null, isTeamAdmin: boolean) {
  counter = 0;
  const items: StubNotification[] = [];
  if (role === "admin") {
    items.push(
      make(T.opened("Liam Thompson", "Introduction to TypeScript", "Individual Purchase", "Not what I expected."), 4, {}, { requestStatus: "open" }),
      make(T.opened("Bossy McBossface", "Design Systems with Tailwind", "Team Licence", "Half my team left the company."), 52, {}, { requestStatus: "approved", requestDecidedBy: "you" }),
      make(T.opened("Sophia Davis", "Building REST APIs with Node.js", "Individual Purchase", "Bought it by mistake."), 60 * 5, { seen: true }, { requestStatus: "open" }),
      make(T.opened("James Park", "Practical Data Visualisation", "Individual Purchase", "Audio quality is poor."), 60 * 26, { seen: true, read: true }, { requestStatus: "declined", requestDecidedBy: "Another admin" }),
      make(T.reply("Sarah Chen", 3, "Your First TypeScript Program", "Good catch, I've fixed the typo in the video notes."), 60 * 24 * 3, { seen: true, read: true }),
    );
  }
  if (role === "instructor") {
    items.push(
      make(T.comment("Emma Wilson", 4, "Primitive Types", "Why does `let x = 5` infer number and not 5?"), 2),
      make(T.comment("Olivia Martinez", 2, "Installing and Configuring TypeScript", "tsc says it can't find tsconfig.json."), 38),
      make(T.reply("Liam Thompson", 5, "Arrays and Tuples", "That fixed it, thanks!"), 60 * 3, { seen: true }),
      make(T.comment("Ava Nakamura", 6, "Type Aliases and Interfaces", "When should I pick one over the other?"), 60 * 20, { seen: true, read: true }),
      make(T.comment("Noah Blackwood", 1, "What is TypeScript?", "Great intro!"), 60 * 24 * 2, { seen: true, read: true }),
      make(T.comment("James Park", 4, "Primitive Types", "Is `bigint` covered later?"), 60 * 24 * 9, { seen: true, read: true, archived: true }),
    );
  }
  if (role === "student" || role === null) {
    items.push(
      make(T.reply("Sarah Chen", 4, "Primitive Types", "Because `let` can be reassigned, so TypeScript widens the literal."), 7),
      make(T.approvedIndividual, 60 * 2),
      make(T.declined, 60 * 24 + 30, { seen: true }),
      make(T.failed, 60 * 24 * 4, { seen: true, read: true }),
    );
  }
  if (isTeamAdmin) {
    items.push(
      make(T.seat("Isla Fernandes", 6), 15),
      make(T.seat("Ethan Okafor", 5), 60 * 6, { seen: true }),
      make(T.approvedTeam, 60 * 30, { seen: true }),
      make(T.seat("Mia Lindqvist", 4), 60 * 24 * 6, { seen: true, read: true }),
    );
  }
  return items.sort((a, b) => a.minutesAgo - b.minutesAgo);
}

/** A fresh Notification for the "simulate arrival" button. */
export function simulatedFor(role: InboxRole | null, isTeamAdmin: boolean, i: number) {
  const names = ["Zara Haddad", "Felix Andersen", "Nina Kowalski", "Omar Rahman"];
  const name = names[i % names.length];
  let t: Template;
  if (role === "admin") t = T.opened(name, "Introduction to TypeScript", "Individual Purchase", "Changed my mind.");
  else if (role === "instructor") t = T.comment(name, 5, "Arrays and Tuples", "Could you add an example with readonly tuples?");
  else if (isTeamAdmin) t = T.seat(name, 7 + (i % 3));
  else t = T.reply(name, 4, "Primitive Types", "Same question here — thanks for asking!");
  return {
    ...make(t, 0, {}, role === "admin" ? { requestStatus: "open" } : {}),
    id: `sim${i}`,
  };
}

export function timeAgo(minutes: number) {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const h = Math.floor(minutes / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "yesterday" : `${d}d ago`;
}

export function isToday(minutes: number) {
  return minutes < 60 * 12;
}
