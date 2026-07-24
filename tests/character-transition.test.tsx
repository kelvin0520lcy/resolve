import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CharacterTransition,
  CUT_IN_DURATION_MS,
} from "@/components/character/character-transition";

const mocks = vi.hoisted(() => ({
  pathname: "/today",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
}));

vi.mock("@/contexts/resolve-context", () => ({
  useResolve: () => ({
    tasks: [
      {
        id: "guitar-1",
        title: "Practise the solo",
        category: "guitar",
        scheduledDate: "2026-07-24",
        userId: "user-1",
        semesterId: "semester-1",
        priority: "medium",
        status: "planned",
        createdAt: "2026-07-24T00:00:00.000Z",
        updatedAt: "2026-07-24T00:00:00.000Z",
      },
    ],
  }),
}));

beforeEach(() => {
  vi.useFakeTimers();
  mocks.pathname = "/today";
});

afterEach(() => {
  vi.useRealTimers();
});

describe("character transition cut-in", () => {
  it("does not appear on first load or navigation within one member", () => {
    const view = render(<CharacterTransition />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    mocks.pathname = "/weekly";
    view.rerender(<CharacterTransition />);
    act(() => vi.runOnlyPendingTimers());
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("appears once when switching members and includes the illustration", () => {
    const view = render(<CharacterTransition />);
    mocks.pathname = "/guitar";
    view.rerender(<CharacterTransition />);
    act(() => vi.advanceTimersByTime(0));

    const cutIn = screen.getByRole("status", {
      name: "Bocchi character transition",
    });
    expect(cutIn).toHaveTextContent("Practise the solo");
    expect(
      screen.getByAltText(
        "Bocchi nervously enjoying a solo on her black Les Paul Custom",
      ),
    ).toHaveAttribute("src", expect.stringContaining("cut-in-bocchi-v2.webp"));
  });

  it("automatically closes after the cut-in duration", () => {
    const view = render(<CharacterTransition />);
    mocks.pathname = "/guitar";
    view.rerender(<CharacterTransition />);
    act(() => vi.advanceTimersByTime(0));
    expect(
      screen.getByRole("status", {
        name: "Bocchi character transition",
      }),
    ).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(CUT_IN_DURATION_MS));
    expect(
      screen.getByRole("status", {
        name: "Bocchi character transition",
      }),
    ).toHaveStyle({ opacity: "0" });
  });

  it("closes from the backdrop but not from clicks inside the cut-in card", () => {
    const view = render(<CharacterTransition />);
    mocks.pathname = "/guitar";
    view.rerender(<CharacterTransition />);
    act(() => vi.advanceTimersByTime(0));

    const cutIn = screen.getByRole("status", {
      name: "Bocchi character transition",
    });
    fireEvent.click(screen.getByText(/Practice room · scene start/i));
    expect(
      screen.getByRole("button", { name: "Close character introduction" }),
    ).toBeInTheDocument();

    fireEvent.click(cutIn);
    expect(cutIn).toHaveStyle({ opacity: "0" });
  });

  it("does not assign common settings to a band member", () => {
    const view = render(<CharacterTransition />);
    mocks.pathname = "/settings";
    view.rerender(<CharacterTransition />);
    act(() => vi.runOnlyPendingTimers());
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
