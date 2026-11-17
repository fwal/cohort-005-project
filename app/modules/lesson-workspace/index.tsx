import type { ReactNode } from "react";
import { useFetcher } from "react-router";
import { LockKeyhole, MessageSquare, NotebookPen } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { formatRelativeTime } from "~/lib/utils";

type Note = { body: string; updatedAt: string } | null;

export function LessonWorkspace({
  note,
  currentUserId,
  children,
}: {
  note: Note;
  currentUserId: number | null;
  children: ReactNode;
}) {
  return (
    <Tabs
      defaultValue="discussion"
      className="mb-8 rounded-xl border bg-card text-card-foreground shadow-sm"
    >
      <TabsList aria-label="Lesson workspace" className="m-4 mb-0 max-w-full">
        <TabsTrigger value="discussion">
          <MessageSquare />
          Discussion
        </TabsTrigger>
        {currentUserId && (
          <TabsTrigger value="notes">
            <NotebookPen />
            Your notes
          </TabsTrigger>
        )}
      </TabsList>
      <TabsContent
        value="discussion"
        forceMount
        className="data-[state=inactive]:hidden [&>div]:mb-0 [&>div]:border-0 [&>div]:shadow-none"
      >
        {children}
      </TabsContent>
      {currentUserId && (
        <TabsContent
          value="notes"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          <NoteEditor note={note} />
        </TabsContent>
      )}
    </Tabs>
  );
}

function NoteEditor({ note }: { note: Note }) {
  const fetcher = useFetcher<{ ok: boolean; error?: string }>();
  const isSaving = fetcher.state !== "idle";
  const error = fetcher.data?.error;
  return (
    <section
      aria-labelledby="lesson-note-heading"
      className="space-y-4 p-6 pt-4"
    >
      <NoteHeading />
      <fetcher.Form method="post" className="space-y-3">
        <input type="hidden" name="intent" value="save-note" />
        <label htmlFor="lesson-note-body" className="sr-only">
          Your lesson notes
        </label>
        <Textarea
          id="lesson-note-body"
          name="body"
          rows={6}
          defaultValue={note?.body ?? ""}
          placeholder="What do you want to remember from this lesson?"
          aria-describedby="note-privacy"
          className="min-h-40 resize-y bg-background leading-relaxed"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="sm" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save note"}
          </Button>
          {error && (
            <span role="alert" className="text-sm text-red-600">
              {error}
            </span>
          )}
          {!error && note && (
            <span
              suppressHydrationWarning
              className="text-xs text-muted-foreground"
            >
              Last edited {formatRelativeTime(note.updatedAt)}
            </span>
          )}
        </div>
      </fetcher.Form>
    </section>
  );
}

function NoteHeading() {
  return (
    <div>
      <h2 id="lesson-note-heading" className="text-lg font-semibold">
        Your lesson notes
      </h2>
      <p
        id="note-privacy"
        className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <LockKeyhole className="size-3.5" />
        Private to you. Capture ideas to come back to later.
      </p>
    </div>
  );
}
