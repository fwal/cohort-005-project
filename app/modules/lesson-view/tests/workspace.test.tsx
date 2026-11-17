import { renderToStaticMarkup } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LessonWorkspace } from "../workspace";

const fetcherState = vi.hoisted(() => ({
  state: "idle",
  data: undefined as { ok: boolean; error?: string } | undefined,
}));

vi.mock("react-router", async (importOriginal) => {
  const original = await importOriginal<typeof import("react-router")>();
  return {
    ...original,
    useFetcher: () => ({ ...original.useFetcher(), ...fetcherState }),
  };
});

beforeEach(() => {
  fetcherState.state = "idle";
  fetcherState.data = undefined;
});

function renderWorkspace(
  currentUserId: number | null,
  note: { body: string; updatedAt: string } | null = null
) {
  const router = createMemoryRouter([
    {
      path: "/",
      element: (
        <LessonWorkspace
          comments={[]}
          currentUserId={currentUserId}
          canModerate={false}
          canPost={currentUserId !== null}
          instructorName="Marcus"
          note={note}
        />
      ),
    },
  ]);
  return renderToStaticMarkup(<RouterProvider router={router} />);
}

describe("Lesson workspace", () => {
  it("groups discussion and private notes in accessible tabs", () => {
    const html = renderWorkspace(1);
    expect(html).toContain('aria-label="Lesson workspace"');
    expect(html).toMatch(/aria-selected="true"[^>]*>.*?Discussion/);
    expect(html).toMatch(/aria-selected="false"[^>]*>.*?Your notes/);
    expect(html).toContain("Questions &amp; Discussion");
    expect(html).toContain("Private to you.");
  });

  it("keeps the editor mounted with an explicit label and the existing save intent", () => {
    const html = renderWorkspace(1);
    expect(html).toContain('for="lesson-note"');
    expect(html).toContain('id="lesson-note"');
    expect(html).toContain('name="body"');
    expect(html).toContain('name="intent" value="save-note"');
    expect(html).toContain('aria-describedby="note-privacy"');
    expect(html).toContain('aria-invalid="false"');
    expect(html).toContain("Save note");
  });

  it("starts a new note empty without an edited timestamp", () => {
    const html = renderWorkspace(1);
    expect(html).toMatch(/<textarea[^>]*id="lesson-note"[^>]*><\/textarea>/);
    expect(html).not.toContain("Last edited");
  });

  it("shows a saved note as text and includes its edited status", () => {
    const html = renderWorkspace(1, {
      body: "<script>private</script>",
      updatedAt: "2026-01-01T00:00:00Z",
    });
    expect(html).toContain("&lt;script&gt;private&lt;/script&gt;");
    expect(html).not.toContain("<script>private</script>");
    expect(html).toContain("Last edited");
  });

  it.each(["submitting", "loading"])(
    "prevents duplicate saves while %s",
    (state) => {
      fetcherState.state = state;
      const html = renderWorkspace(1);
      expect(html).toMatch(
        /<button[^>]*disabled=""[^>]*>Saving\.\.\.<\/button>/
      );
      expect(html).not.toContain("Save note");
    }
  );

  it("announces save errors and connects them to the editor", () => {
    fetcherState.data = {
      ok: false,
      error: "Write something before saving your note.",
    };
    const html = renderWorkspace(1, {
      body: "Saved text",
      updatedAt: "2026-01-01T00:00:00Z",
    });
    expect(html).toContain('aria-describedby="note-privacy note-error"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toMatch(
      /id="note-error" role="alert"[^>]*>Write something before saving your note\.<\/span>/
    );
    expect(html).not.toContain("Last edited");
  });

  it("leaves discussion available without offering notes when signed out", () => {
    const html = renderWorkspace(null);
    expect(html).toContain("Questions &amp; Discussion");
    expect(html).not.toContain('role="tab"');
    expect(html).not.toContain('value="save-note"');
    expect(html).not.toContain("Your lesson notes");
  });
});
