import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Use — Resolve!",
  description: "The terms that apply when you use Resolve!.",
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

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms of use"
      title="THE HOUSE RULES BEFORE THE ENCORE."
      summary="By creating an account or using Resolve!, you agree to these terms. If you do not agree, do not use the service."
    >
      <Section title="The service">
        <p>
          Resolve! is a personal planning, reflection, study, habit, career, and
          guitar-practice tool. It may change, pause, or be discontinued, and
          features may occasionally be unavailable while maintenance or fixes
          are in progress.
        </p>
        <p>
          Resolve! is not an official National University of Singapore service
          and is not endorsed by or operated on behalf of NUS.
        </p>
        <p>
          Resolve! provides organisational information, not medical, mental
          health, legal, financial, or academic advice. You remain responsible
          for your decisions, submissions, deadlines, and backups.
        </p>
      </Section>

      <Section title="Your account">
        <p>
          Provide accurate account information, keep your credentials secure,
          and use only an account you are authorised to access. You are
          responsible for activity performed through your account. Notify the
          maintainer if you believe it has been compromised.
        </p>
      </Section>

      <Section title="Your content">
        <p>
          You retain responsibility for the content you enter. You grant
          Resolve! only the limited permission needed to store, synchronise,
          process, display, export, and delete that content as part of operating
          the service.
        </p>
        <p>
          Keep your own export of important records. Account and workspace
          deletion are permanent once completed.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>
          Do not misuse the service, attempt unauthorised access, disrupt its
          infrastructure, evade security or quota controls, introduce malicious
          code, scrape other users&apos; data, impersonate another person, or
          use Resolve! in a way that violates applicable law or another
          person&apos;s rights.
        </p>
      </Section>

      <Section title="Fan-project status and intellectual property">
        <p>
          Resolve! is an unofficial, non-commercial fan project. It is not
          affiliated with, endorsed by, or sponsored by Bocchi the Rock!, its
          publishers, animation studios, licensors, or other rights holders.
          Names, characters, instruments, and referenced properties belong to
          their respective owners.
        </p>
        <p>
          The project&apos;s original software and interface remain subject to
          their applicable ownership and licence terms. These Terms do not
          grant permission to reuse third-party intellectual property.
        </p>
      </Section>

      <Section title="Third-party services">
        <p>
          Resolve! relies on services including Firebase and Render. Their
          availability and terms are outside Resolve!&apos;s control. Links to
          other sites are provided for convenience and do not imply
          endorsement.
        </p>
      </Section>

      <Section title="Availability and liability">
        <p>
          The service is provided on an “as available” basis without a promise
          that it will always be uninterrupted, error-free, or suitable for a
          particular purpose. To the extent permitted by law, the maintainer is
          not liable for indirect or consequential loss arising from use of, or
          inability to use, the service.
        </p>
        <p>
          Nothing in these Terms excludes rights or liability that cannot be
          excluded under applicable law.
        </p>
      </Section>

      <Section title="Suspension, changes, and contact">
        <p>
          Access may be limited or ended when necessary to protect users,
          infrastructure, legal rights, or the service. Updated Terms will show
          a new effective date; continued use after an update means you accept
          the revised Terms.
        </p>
        <p>
          Questions can be sent through the{" "}
          <a
            href="https://github.com/kelvin0520lcy/resolve/issues"
            className="font-bold text-accent underline underline-offset-4"
          >
            Resolve! issue tracker
          </a>
          . Do not include sensitive personal information in a public issue.
          Read the{" "}
          <Link
            href="/privacy"
            className="font-bold text-accent underline underline-offset-4"
          >
            Privacy Policy
          </Link>{" "}
          for details about data handling.
        </p>
      </Section>
    </LegalPage>
  );
}
