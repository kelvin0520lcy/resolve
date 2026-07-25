import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";

describe("confirm delete button", () => {
  it("requires a second explicit action before removing an item", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ConfirmDeleteButton
        itemLabel="task Review chapter"
        onConfirm={onConfirm}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Remove task Review chapter" }),
    );
    expect(onConfirm).not.toHaveBeenCalled();
    expect(
      screen.getByRole("group", {
        name: "Confirm removal of task Review chapter",
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Cancel removing task Review chapter",
      }),
    );
    expect(
      screen.queryByRole("group", {
        name: "Confirm removal of task Review chapter",
      }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Remove task Review chapter" }),
    );
    await user.click(
      screen.getByRole("button", {
        name: "Confirm remove task Review chapter",
      }),
    );
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
