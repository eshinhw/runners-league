export const metadata = {
  title: "Terms — Runners League",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Terms of Use</h1>
        <p className="mt-1 text-sm text-zinc-500">Last updated August 2026.</p>
      </div>

      <Section title="1. Acceptance">
        <p>
          By creating an account or using Runners League, you agree to these terms. Runners League is a small,
          independent community project — these terms are written in plain language on purpose, not as a
          substitute for professional legal advice.
        </p>
      </Section>

      <Section title="2. Your account">
        <p>
          You sign in with Google or a magic email link. You&apos;re responsible for keeping your account
          secure and for the accuracy of what you log — race results, gear, and profile details. Don&apos;t
          impersonate another runner or submit results that aren&apos;t yours.
        </p>
      </Section>

      <Section title="3. Your content">
        <p>
          You own what you post — race entries, gear, community posts, comments, and playlist shares. By
          posting it, you give Runners League a license to display it back to you and other runners as part of
          the normal operation of the site (leaderboards, profiles, the community feed, and so on). You&apos;re
          responsible for what you post, and it should be your own or something you have the right to share.
        </p>
      </Section>

      <Section title="4. Acceptable use">
        <p>
          Be a decent training partner. No harassment, hate speech, spam, or posting content you don&apos;t
          have rights to. Don&apos;t try to break, scrape, or overload the site. We can remove content or
          suspend accounts that don&apos;t follow this.
        </p>
      </Section>

      <Section title="5. Training plans aren&apos;t medical advice">
        <p>
          The training plans, pace suggestions, and calculators on Runners League are general guidance, not
          medical or coaching advice tailored to you. Talk to a doctor before starting a new training block,
          especially with any injury history, and use your own judgment about what your body can handle.
        </p>
      </Section>

      <Section title="6. Third-party names">
        <p>
          Runners League tracks results from the World Marathon Majors (Tokyo, Boston, London, Berlin, Chicago,
          New York City, and Sydney) for reference purposes only. Runners League is an independent project and
          isn&apos;t affiliated with, endorsed by, or sponsored by World Marathon Majors, Abbott, or any
          individual race organizer.
        </p>
      </Section>

      <Section title="7. No warranty">
        <p>
          Runners League is provided as-is. We do our best to keep it running and your data accurate, but we
          can&apos;t guarantee the service will be uninterrupted, error-free, or available forever — this is a
          community project, not a funded company with an SLA.
        </p>
      </Section>

      <Section title="8. Changes">
        <p>
          These terms may change as the site grows. If they do, we&apos;ll update the date at the top of this
          page. Continuing to use Runners League after a change means you accept the updated terms.
        </p>
      </Section>

      <Section title="9. Contact">
        <p>Questions about these terms? Reach out at hello@runnersleague.app.</p>
      </Section>
    </main>
  );
}
