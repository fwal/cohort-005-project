import { renderToStaticMarkup } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { CourseStatus } from "~/db/schema";
import { markdown } from "~/lib/text";
import Home, { type loader } from "./home";

type HomeData = Awaited<ReturnType<typeof loader>>;

const course: HomeData["featuredCourses"][number] = {
  id: 1,
  title: "Introduction to TypeScript",
  slug: "introduction-to-typescript",
  description: "Learn TypeScript at your own pace.",
  salesCopy: markdown("Learn TypeScript"),
  instructorId: 1,
  categoryId: 1,
  status: CourseStatus.Published,
  coverImageUrl: null,
  price: 1000,
  pppEnabled: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  instructorName: "Sarah Chen",
  instructorAvatarUrl: null,
  categoryName: "Programming",
  lessonCount: 9,
};

function renderHome(featuredCourses: HomeData["featuredCourses"]) {
  const loaderData: HomeData = {
    featuredCourses,
    totalCourses: featuredCourses.length,
    totalCategories: 5,
    users: [],
    currentUser: null,
    devCountry: null,
    countryTierInfo: { tier: 1, discount: 0, label: "Full Price" },
    countries: [],
  };
  const router = createMemoryRouter([
    {
      path: "/",
      Component: () => (
        <Home
          loaderData={loaderData}
          params={{}}
          matches={[
            {
              id: "root",
              params: {},
              pathname: "/",
              loaderData: undefined,
              handle: undefined,
            },
            {
              id: "routes/home",
              params: {},
              pathname: "/",
              loaderData,
              handle: undefined,
            },
          ]}
        />
      ),
    },
  ]);
  return renderToStaticMarkup(<RouterProvider router={router} />);
}

describe("Homepage sections", () => {
  it("places Featured Courses between the hero and the statistics badges", () => {
    const html = renderHome([course]);
    expect(html).toMatch(
      /Learn to code,[\s\S]*Featured Courses[\s\S]*Available Courses[\s\S]*Categories[\s\S]*Self-paced[\s\S]*<footer/
    );
    expect(html).toContain('href="/courses/introduction-to-typescript"');
    expect(html).toContain("Introduction to TypeScript");
    expect(html).toContain("Sarah Chen");
    expect(html).toContain("9 lessons");
  });

  it("keeps the badges after the hero when there are no featured courses", () => {
    const html = renderHome([]);
    expect(html).not.toContain("Featured Courses");
    expect(html).not.toContain("View all");
    expect(html).toMatch(
      /Learn to code,[\s\S]*Available Courses[\s\S]*Categories[\s\S]*Self-paced[\s\S]*<footer/
    );
    expect(html).toContain('class="text-2xl font-bold">0</p>');
    expect(html).toContain('class="text-2xl font-bold">5</p>');
  });
});
