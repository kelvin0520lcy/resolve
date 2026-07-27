import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SignUpPage from "@/app/(auth)/signup/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    firebaseUser: null,
    signUp: vi.fn(),
    isConfigured: true,
    loading: false,
  }),
}));

describe("signup legal acknowledgement", () => {
  it("shows Terms and Privacy acknowledgement before account creation", () => {
    render(<SignUpPage />);

    expect(
      screen.getByText(/By creating an account, you agree/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Terms of Use" })).toHaveAttribute(
      "href",
      "/terms",
    );
    expect(
      screen.getByRole("link", { name: "Privacy Policy" }),
    ).toHaveAttribute("href", "/privacy");
  });
});
