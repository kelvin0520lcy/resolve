import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const actions = vi.hoisted(() => ({
  addTask: vi.fn(),
  saveReflection: vi.fn(),
}));

vi.mock("@/contexts/resolve-context", () => ({
  offsetDate: (offset: number) => {
    if (offset === 0) return "2026-07-26";
    if (offset === 1) return "2026-07-27";
    return "2026-08-02";
  },
  useResolve: () => ({
    reflections: [],
    tasks: [],
    habits: [],
    habitLogs: [],
    goals: [],
    modules: [],
    preferences: {
      timeZone: "Asia/Kuala_Lumpur",
      dailyCapacityMinutes: 480,
      autoNextAction: true,
    },
    storageMode: "browser",
    syncStatus: "demo",
    addTask: actions.addTask,
    saveReflection: actions.saveReflection,
    removeReflection: vi.fn(),
  }),
}));

vi.mock("@/components/layout/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/reflections",
}));

vi.mock("@/components/character/character-companion", () => ({
  CharacterCompanion: () => <aside>Character support</aside>,
}));

import ReflectionsPage from "@/app/(dashboard)/reflections/page";

beforeEach(() => {
  actions.addTask.mockClear();
  actions.saveReflection.mockClear();
  window.localStorage.clear();
});

describe("reflection action loop", () => {
  it("requires confirmation before converting tomorrow's adjustment to a task", async () => {
    const user = userEvent.setup();
    render(<ReflectionsPage />);

    await user.type(
      screen.getByRole("textbox", { name: "What changes tomorrow?" }),
      "Break the report into two smaller sections",
    );

    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "Proposed task" })).toHaveValue(
        "Break the report into two smaller sections",
      ),
    );
    expect(actions.addTask).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: "Create for tomorrow" }),
    );

    expect(actions.addTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Break the report into two smaller sections",
        scheduledDate: "2026-07-27",
        estimatedMinutes: 30,
        origin: {
          kind: "reflection-action",
          reflectionDate: "2026-07-26",
        },
      }),
    );
  });
});
