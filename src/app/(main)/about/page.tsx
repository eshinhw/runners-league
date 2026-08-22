export const metadata = {
  title: "About — Runners League",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <main className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">About Runners League</h1>
        <p className="mt-1 text-sm text-zinc-500">A home base for chasing the World Marathon Majors.</p>
      </div>

      <Section title="What this is">
        <p>
          Runners League is a place to log your World Marathon Majors finishes, see how you stack up against
          other runners, and follow a training plan while you chase the next one. It started as a simple
          tracker and grew into a small community: gear, training, playlists, and race-day stories included.
        </p>
      </Section>

      <Section title="Majors &amp; Rankings">
        <p>
          Log your finishes from Tokyo, Boston, London, Berlin, Chicago, New York, and Sydney in My Races, and
          they automatically feed the Rankings page — both a majors-completed leaderboard and per-race results.
          Complete more majors and your tier badge grows with you, from your first finish all the way to Seven
          Star Finisher.
        </p>
      </Section>

      <Section title="Training">
        <p>
          Pick from Beginner, Sub-4, or Sub-3 plans, or build a custom one from your current mileage, pace, and
          race date. Every plan adapts to the units you prefer, metric or imperial.
        </p>
      </Section>

      <Section title="Gear &amp; Top Gears">
        <p>
          Keep a locker of what you run in — shoes, watch, apparel, headphones, nutrition — and mark a favorite
          per category. Top Gears aggregates everyone&apos;s favorites into a community leaderboard of what
          runners actually reach for.
        </p>
      </Section>

      <Section title="Community &amp; Playlist">
        <p>
          Swap advice and race reports in Community, and share the songs that get you through a long run in
          Runners Playlist — every track is verified against a real catalog before it hits the chart, and
          upvotes decide what rises to the top.
        </p>
      </Section>

      <Section title="Who&apos;s behind this">
        <p>
          Runners League is an independent, community-run project built by runners, for runners. It&apos;s not
          affiliated with World Marathon Majors, Abbott, or any of the six major marathons it tracks.
        </p>
      </Section>
    </main>
  );
}
