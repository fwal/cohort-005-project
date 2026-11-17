import { useFetcher } from "react-router";
import { LockKeyhole, MessageSquare, NotebookPen } from "lucide-react";
import { CommentThread } from "~/components/comment-thread";
import type { ComponentProps } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { formatRelativeTime } from "~/lib/utils";

type WorkspaceProps = ComponentProps<typeof CommentThread> & {
  note: { body: string; updatedAt: string } | null;
};

export function LessonWorkspace({ note, ...discussion }: WorkspaceProps) {
  if (!discussion.currentUserId) return <CommentThread {...discussion} />;

  return (
    <section aria-label="Lesson workspace" className="mb-8 border-t pt-6">
      <Tabs defaultValue="discussion">
        <TabsList aria-label="Lesson workspace" className="mb-4">
          <TabsTrigger value="discussion">
            <MessageSquare className="size-4" />
            Discussion
          </TabsTrigger>
          <TabsTrigger value="notes">
            <NotebookPen className="size-4" />
            Your notes
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="discussion"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          <CommentThread {...discussion} />
        </TabsContent>
        <TabsContent
          value="notes"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          <NoteEditor note={note} />
        </TabsContent>
      </Tabs>
    </section>
  );
}

function NoteEditor({ note }: Pick<WorkspaceProps, "note">) {
  const fetcher = useFetcher<{ ok: boolean; error?: string }>();
  const isSaving = fetcher.state !== "idle";
  const error = fetcher.data?.error;

  return (
    <div className="rounded-xl border bg-card p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Your lesson notes</h2>
        <p
          id="note-privacy"
          className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <LockKeyhole className="size-3.5" />
          Private to you. Capture ideas to come back to later.
        </p>
      </div>
      <fetcher.Form method="post" className="space-y-4">
        <input type="hidden" name="intent" value="save-note" />
        <label htmlFor="lesson-note" className="sr-only">
          Your lesson notes
        </label>
        <Textarea
          id="lesson-note"
          name="body"
          rows={6}
          defaultValue={note?.body ?? ""}
          placeholder="What would you like to remember from this lesson?"
          aria-describedby={error ? "note-privacy note-error" : "note-privacy"}
          aria-invalid={!!error}
          className="min-h-40 resize-y bg-background leading-relaxed"
        />
        <NoteActions note={note} isSaving={isSaving} error={error} />
      </fetcher.Form>
    </div>
  );
}

function NoteActions({
  note,
  isSaving,
  error,
}: Pick<WorkspaceProps, "note"> & { isSaving: boolean; error?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" size="sm" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save note"}
      </Button>
      {error && (
        <span id="note-error" role="alert" className="text-sm text-destructive">
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
  );
}
