import { createElement, type FormHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LessonWorkspace } from "~/modules/lesson-workspace";

const state = vi.hoisted(() => ({
  state: "idle",
  data: undefined as { error?: string } | undefined,
}));
vi.mock("react-router", () => ({
  useFetcher: () => ({
    ...state,
    Form: (props: FormHTMLAttributes<HTMLFormElement>) =>
      createElement("form", props),
  }),
}));

function render(
  currentUserId: number | null,
  note: { body: string; updatedAt: string } | null = null
) {
  return renderToStaticMarkup(
    <LessonWorkspace currentUserId={currentUserId} note={note}>
      <div>Discussion content</div>
    </LessonWorkspace>
  );
}

describe("Lesson workspace", () => {
  it("integrates private notes with Discussion and keeps both panels mounted", () => {
    const html = render(12);
    expect(html).toContain('aria-label="Lesson workspace"');
    expect(html).toContain('role="tab"');
    expect(html).toContain('data-state="active"');
    expect(html).toContain("Discussion content");
    expect(html).toContain("Your lesson notes");
    expect(html).toContain(">Your notes</button>");
    expect(html).toContain(
      'placeholder="What do you want to remember from this lesson?"'
    );
    expect(html).toContain('name="intent" value="save-note"');
    expect(html).toContain('for="lesson-note-body"');
    expect(html).toContain('aria-describedby="note-privacy"');
    expect(html).toContain("Private to you.");
    expect(html).toContain("Save note");
    expect(html).toMatch(/<textarea[^>]*><\/textarea>/);
  });

  it("does not offer private notes to a signed-out person", () => {
    const html = render(null);
    expect(html).toContain("Discussion content");
    expect(html).not.toContain("Your notes");
    expect(html).not.toContain("textarea");
  });

  it("restores the saved note as plain text", () => {
    const html = render(12, {
      body: "<script>private draft</script>",
      updatedAt: new Date().toISOString(),
    });
    expect(html).toContain("&lt;script&gt;private draft&lt;/script&gt;");
    expect(html).toContain("Last edited");
    expect(html).not.toContain("<script>");
  });

  it("disables saving while the request is pending", () => {
    state.state = "submitting";
    const html = render(12);
    expect(html).toContain("Saving...");
    expect(html).toContain('disabled=""');
    state.state = "idle";
  });

  it("shows a save error as an alert instead of a saved timestamp", () => {
    state.data = { error: "Your note was not saved." };
    const html = render(12, {
      body: "Saved note",
      updatedAt: new Date().toISOString(),
    });
    expect(html).toContain('role="alert"');
    expect(html).toContain("Your note was not saved.");
    expect(html).not.toContain("Last edited");
    state.data = undefined;
  });
});
