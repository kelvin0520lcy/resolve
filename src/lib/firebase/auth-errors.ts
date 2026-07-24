import { FirebaseError } from "firebase/app";

export type AuthAction = "sign-in" | "google" | "sign-up" | "password-reset";

export function getFirebaseAuthErrorMessage(
  error: unknown,
  action: AuthAction,
): string {
  if (!(error instanceof FirebaseError)) {
    return "Firebase could not complete the request. Please try again.";
  }

  switch (error.code) {
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "An account already exists for this email.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Use a stronger password with at least eight characters.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    case "auth/network-request-failed":
      return "Could not reach Firebase. Check your connection and try again.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase Authentication.";
    case "auth/operation-not-allowed":
      if (action === "google") return "Google sign-in is not enabled in Firebase.";
      if (action === "sign-up" || action === "sign-in") {
        return "Email/password authentication is not enabled in Firebase.";
      }
      return "This authentication action is not enabled in Firebase.";
    case "auth/popup-blocked":
      return "The Google sign-in popup was blocked by the browser.";
    case "auth/popup-closed-by-user":
      return "The Google sign-in popup was closed before completing.";
    case "auth/account-exists-with-different-credential":
      return "This email already uses a different sign-in method.";
    case "auth/user-not-found":
      return action === "password-reset"
        ? "No account was found for that email."
        : "Invalid email or password.";
    default:
      return "Firebase rejected the request. Check the authentication provider settings.";
  }
}

