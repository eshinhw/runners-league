import type { Metadata } from "next";
import Link from "next/link";

const SUPPORT_EMAIL = "support@runnersleague.org";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach Runners League — support, bug reports, feature requests, and account questions.",
  alternates: { canonical: "/contact" },
};

function mailto(subject: string) {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{children}</div>
    </section>
  );
}

export default function ContactPage() {
  return (
    <main className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Contact Runners League</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Questions, bug reports, or just want to say hi — here&apos;s how to reach us.
        </p>
      </div>

      <Section title="General questions & feedback">
        <p>
          Runners League is a small, independent project, so support is a real person reading real email —
          not a ticket queue. Write to{" "}
          <a href={mailto("Hello")} className="font-medium text-orange-500 hover:underline">
            {SUPPORT_EMAIL}
          </a>{" "}
          any time. We read everything and try to reply within a few days.
        </p>
      </Section>

      <Section title="Bug reports">
        <p>
          Found something broken? Email{" "}
          <a href={mailto("Bug report")} className="font-medium text-orange-500 hover:underline">
            {SUPPORT_EMAIL}
          </a>{" "}
          with what you were doing, what you expected, and what happened instead. A screenshot and your
          browser or device help us track it down faster.
        </p>
      </Section>

      <Section title="Feature requests">
        <p>
          Have an idea for the Majors, Training, or Playlist? Post it in{" "}
          <Link href="/community" className="font-medium text-orange-500 hover:underline">
            Community
          </Link>{" "}
          so other runners can weigh in — the ideas that resonate are the ones we hear about most. Prefer to
          send it privately instead?{" "}
          <a href={mailto("Feature request")} className="font-medium text-orange-500 hover:underline">
            {SUPPORT_EMAIL}
          </a>{" "}
          works too.
        </p>
      </Section>

      <Section title="Account & data">
        <p>
          Need help with sign-in, want to correct a race result, or want your account and data deleted? Email{" "}
          <a href={mailto("Account request")} className="font-medium text-orange-500 hover:underline">
            {SUPPORT_EMAIL}
          </a>{" "}
          from the address on your account and let us know what you need.
        </p>
      </Section>
    </main>
  );
}
