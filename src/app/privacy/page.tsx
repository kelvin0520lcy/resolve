import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy — Resolve!",
  description: "How Resolve! stores, uses, and lets you control your data.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl tracking-wide text-foreground">
        {title}
      </h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy policy"
      title="YOUR DATA, WITHOUT THE MYSTERY ARC."
      summary="This policy explains what Resolve! stores, why it is needed, and the controls available to you."
    >
      <Section title="What Resolve! collects">
        <p>
          When you create an account, Firebase Authentication processes your
          email address, display name, authentication provider, and account
          identifier. Google sign-in may also provide a profile photo.
        </p>
        <p>
          Resolve! stores the planning information you choose to enter,
          including resolutions, goals, tasks, schedules, habits, academic
          records, reflections, career activity, and Guitar Studio progress.
          The app also stores limited sync metadata such as revision numbers,
          timestamps, and client identifiers needed to prevent lost edits.
        </p>
      </Section>

      <Section title="Where data is stored">
        <p>
          Your active workspace is saved locally in your browser for immediate
          use and, when you are signed in, synchronised to Google Firebase
          Firestore. Local recovery snapshots may remain in browser storage
          until they expire or you remove them. The application is hosted by
          Render, whose infrastructure may process standard request and
          security logs.
        </p>
        <p>
          Resolve! does not currently use advertising trackers or sell personal
          information. Firebase and Render process data only as service
          providers needed to operate the application.
        </p>
      </Section>

      <Section title="How data is used">
        <p>
          Data is used to authenticate you, save and synchronise your
          workspace, calculate progress and recommendations, recover from
          failed migrations or imports, protect account deletion, diagnose
          failures, and keep the service secure.
        </p>
      </Section>

      <Section title="Retention and deletion">
        <p>
          Workspace data remains until you remove individual records, clear the
          workspace, archive a semester, or delete your account. Browser
          recovery copies follow the limits shown in Settings. Account deletion
          removes the Firebase user, profile, workspaces, and archives, while a
          small write-blocking deletion record may be retained for safety and
          abuse prevention.
        </p>
        <p>
          Infrastructure backups and logs may persist temporarily according to
          Firebase and Render retention practices. Data already exported to
          your device is controlled by you.
        </p>
      </Section>

      <Section title="Your controls">
        <p>
          Settings lets you export a JSON backup, export selected records,
          inspect or remove local recovery copies, clear your workspace, and
          permanently delete your account. You can also edit or delete the
          individual records you create.
        </p>
        <p>
          Account deletion requires a recent sign-in. Export anything you want
          to keep first, because deletion cannot be undone.
        </p>
      </Section>

      <Section title="Security and age">
        <p>
          Resolve! uses Firebase authentication and access rules, but no online
          service can guarantee absolute security. Use a unique password and do
          not enter secrets or highly sensitive information into free-text
          fields.
        </p>
        <p>
          Resolve! is intended for university-age users. If local law requires
          parental consent for your use of an online service, use Resolve! only
          with that consent.
        </p>
      </Section>

      <Section title="Changes and contact">
        <p>
          Material changes will be reflected by updating the effective date on
          this page. Questions, privacy requests, and security reports can be
          sent to the maintainer through the{" "}
          <a
            href="https://github.com/kelvin0520lcy/resolve/issues"
            className="font-bold text-accent underline underline-offset-4"
          >
            Resolve! issue tracker
          </a>
          . Do not post passwords, tokens, private reflections, or other
          sensitive data in a public issue.
        </p>
        <p>
          The rules for using the service are available in the{" "}
          <Link
            href="/terms"
            className="font-bold text-accent underline underline-offset-4"
          >
            Terms of Use
          </Link>
          .
        </p>
      </Section>
    </LegalPage>
  );
}
