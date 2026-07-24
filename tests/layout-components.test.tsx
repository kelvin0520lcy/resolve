import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppHeader } from "@/components/layout/app-header";
import { CharacterArcBar } from "@/components/layout/character-arc-bar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { PAGE_THEMES } from "@/lib/page-themes";

const mocks = vi.hoisted(() => ({
  pathname: "/today",
  signOut: vi.fn(async () => {}),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
}));

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    user: {
      id: "user-1",
      displayName: "Test User",
      email: "test@example.com",
    },
    firebaseUser: null,
    loading: false,
    isConfigured: true,
    signOut: mocks.signOut,
  }),
}));

beforeEach(() => {
  mocks.pathname = "/today";
  mocks.signOut.mockClear();
});

describe("character arc navigation components", () => {
  it("does not add a redundant arc switcher to common pages", () => {
    const { container } = render(
      <CharacterArcBar pathname="/dashboard" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows only coherent sibling pages inside a character route", () => {
    render(<CharacterArcBar pathname="/today" />);
    expect(
      screen.getByRole("region", { name: "Nijika character arc" }),
    ).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Pages in this arc" });
    expect(nav).toHaveTextContent("Today");
    expect(nav).toHaveTextContent("Weekly Plan");
    expect(nav).toHaveTextContent("Habits");
    expect(nav).not.toHaveTextContent("Guitar");
  });

  it("groups the desktop sidebar under named character sections", () => {
    render(<Sidebar />);
    expect(
      screen.getByRole("region", { name: "Nijika’s Rhythm Desk" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Bocchi’s Practice Room" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Ryo’s Control Room" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Kita’s Spotlight" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      "/settings",
    );
  });

  it("keeps one mobile entry point for the band and each character", () => {
    render(<MobileNav />);
    const nav = screen.getByRole("navigation");
    expect(nav.querySelectorAll("a")).toHaveLength(6);
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("link", { name: "Guitar" })).toHaveAttribute(
      "href",
      "/guitar",
    );
    expect(screen.getByRole("link", { name: "Goals" })).toHaveAttribute(
      "href",
      "/goals",
    );
  });
});

describe("interactive anime header", () => {
  it("opens and closes the character reaction cut", async () => {
    const user = userEvent.setup();
    render(<AppHeader title="Today" theme={PAGE_THEMES.nijika} />);
    const trigger = screen.getByRole("button", {
      name: "Hear Nijika's reaction",
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("status")).toHaveTextContent(
      "your week has a tempo",
    );
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("calls the configured sign-out action", async () => {
    const user = userEvent.setup();
    render(<AppHeader title="Today" theme={PAGE_THEMES.nijika} />);
    await user.click(screen.getByRole("button", { name: "Log out" }));
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
  });
});
