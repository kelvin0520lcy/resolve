import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GuitarStudioNav } from "@/features/guitar-learning/components/studio-nav";

describe("GuitarStudioNav", () => {
  it("exposes four accessible internal modes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<GuitarStudioNav mode="overview" onChange={onChange} />);
    expect(screen.getAllByRole("tab")).toHaveLength(4);
    expect(
      screen.getByRole("tab", { name: /Overview/ }),
    ).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("tab", { name: /Explore/ }));
    expect(onChange).toHaveBeenCalledWith("explore");
  });
});
