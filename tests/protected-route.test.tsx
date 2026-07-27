import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "@/components/auth/protected-route";

const routeMocks = vi.hoisted(() => ({
  replace: vi.fn(),
  emailVerified: false,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routeMocks.replace }),
}));

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    firebaseUser: {
      uid: "user-1",
      emailVerified: routeMocks.emailVerified,
    },
    loading: false,
    isConfigured: true,
  }),
}));

beforeEach(() => {
  routeMocks.replace.mockReset();
  routeMocks.emailVerified = false;
});

describe("ProtectedRoute verification boundary", () => {
  it("redirects an unverified account without rendering private content", async () => {
    render(
      <ProtectedRoute>
        <p>Private workspace</p>
      </ProtectedRoute>,
    );

    expect(screen.queryByText("Private workspace")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(routeMocks.replace).toHaveBeenCalledWith("/verify-email");
    });
  });

  it("renders private content for a verified account", () => {
    routeMocks.emailVerified = true;
    render(
      <ProtectedRoute>
        <p>Private workspace</p>
      </ProtectedRoute>,
    );

    expect(screen.getByText("Private workspace")).toBeInTheDocument();
    expect(routeMocks.replace).not.toHaveBeenCalled();
  });
});
