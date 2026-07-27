import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    href,
    onClick,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </a>
  ),
}));

vi.mock("@/contexts/resolve-context", () => ({
  useResolve: () => ({
    tasks: [],
    goals: [
      {
        id: "goal-1",
        title: "Ship portfolio",
      },
    ],
    modules: [],
    events: [],
    preferences: {
      timeZone: "Asia/Kuala_Lumpur",
    },
    addTask: vi.fn(),
  }),
}));

import { CommandPalette } from "@/components/layout/command-palette";

describe("global command palette", () => {
  it("keeps both mode controls visible before hover", async () => {
    const user = userEvent.setup();
    render(<CommandPalette />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent("resolve:command", { detail: { mode: "search" } }),
      );
    });

    const search = await screen.findByRole("button", { name: "Search" });
    const capture = screen.getByRole("button", { name: "Quick capture" });
    expect(capture).toHaveClass("text-[#18121f]");

    await user.click(capture);
    expect(search).toHaveClass("text-[#18121f]");
  });

  it("keeps capture preview text visible on dark surfaces", async () => {
    const user = userEvent.setup();
    render(<CommandPalette />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent("resolve:command", { detail: { mode: "capture" } }),
      );
    });

    const input = await screen.findByRole("textbox", { name: "Describe a task" });
    await user.type(input, "Review calculus tomorrow 45m");

    expect(screen.getByDisplayValue("Review calculus")).toHaveClass(
      "text-foreground",
    );
    expect(screen.getByText("plan tomorrow · 45 minutes")).toHaveClass(
      "text-foreground",
    );
  });

  it("explains every capture step and lets users load a working example", async () => {
    const user = userEvent.setup();
    render(<CommandPalette />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent("resolve:command", { detail: { mode: "capture" } }),
      );
    });

    expect(
      await screen.findByText("Write one line. Preview it. Create it."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/With no cues, Resolve creates a medium-priority/),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Nothing is saved until you press Create this task."),
    ).toBeInTheDocument();

    const example =
      "Review calculus tomorrow 45m high priority #academics";
    await user.click(
      screen.getByRole("button", { name: `Use example: ${example}` }),
    );

    expect(
      screen.getByRole("textbox", { name: "Describe a task" }),
    ).toHaveValue(example);
    expect(screen.getByDisplayValue("Review calculus")).toBeInTheDocument();
    expect(
      screen.getByText(
        "plan tomorrow · 45 minutes · high priority · academics",
      ),
    ).toBeInTheDocument();
  });

  it("dispatches the exact deep link for a selected search record", async () => {
    const user = userEvent.setup();
    const opened = vi.fn();
    window.addEventListener("resolve:open-record", opened);
    render(<CommandPalette />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent("resolve:command", { detail: { mode: "search" } }),
      );
    });
    await user.type(
      await screen.findByRole("textbox", { name: "Search workspace" }),
      "portfolio",
    );
    const result = screen.getByRole("link", { name: /Ship portfolio/ });
    expect(result).toHaveAttribute("href", "/goals?goal=goal-1");

    await user.click(result);

    expect(opened).toHaveBeenCalled();
    expect(
      (opened.mock.calls[0][0] as CustomEvent<{ href: string }>).detail.href,
    ).toBe("/goals?goal=goal-1");
    window.removeEventListener("resolve:open-record", opened);
  });
});
