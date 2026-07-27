import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VerifyEmailPage from "@/app/(auth)/verify-email/page";

const verificationMocks = vi.hoisted(() => ({
  replace: vi.fn(),
  resend: vi.fn(),
  refresh: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: verificationMocks.replace }),
}));

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    firebaseUser: {
      uid: "pending-user",
      email: "pending@example.com",
      emailVerified: false,
    },
    loading: false,
    resendVerificationEmail: verificationMocks.resend,
    refreshEmailVerification: verificationMocks.refresh,
    signOut: verificationMocks.signOut,
  }),
}));

beforeEach(() => {
  verificationMocks.replace.mockReset();
  verificationMocks.resend.mockReset();
  verificationMocks.refresh.mockReset();
  verificationMocks.signOut.mockReset();
  verificationMocks.refresh.mockResolvedValue(true);
});

describe("email verification page", () => {
  it("explains the cloud lock and resumes after verification", async () => {
    const user = userEvent.setup();
    render(<VerifyEmailPage />);

    expect(screen.getByText("pending@example.com")).toBeInTheDocument();
    expect(
      screen.getByText(/Cloud sync stays locked/i),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /I verified — check again/i }),
    );

    expect(verificationMocks.refresh).toHaveBeenCalledTimes(1);
    expect(verificationMocks.replace).toHaveBeenCalledWith("/dashboard");
  });
});
