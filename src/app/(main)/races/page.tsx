import { MAJOR_INFO, getMajorsForYear, type MajorEdition } from "@/lib/majors";

export const dynamic = "force-dynamic";

const YEARS = [2027, 2026];

function formatEventDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function EditionCard({ edition }: { edition: MajorEdition }) {
  const info = MAJOR_INFO[edition.major];
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="font-medium">{info.name}</h3>
        <p className="mt-0.5 text-xs text-zinc-500">
          {info.city}, {info.country}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {info.distances.map((d) => (
            <span
              key={d}
              className="rounded-full border border-zinc-300 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
            >
              {d}
            </span>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
        <div className="text-left sm:text-right">
          <div className="font-mono text-sm tabular-nums">{formatEventDate(edition.date)}</div>
          {!edition.confirmed && (
            <span className="mt-1 inline-block rounded-full border border-amber-300 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:border-amber-800 dark:text-amber-400">
              Estimated date
            </span>
          )}
        </div>
        <a
          href={info.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600"
        >
          Register
        </a>
      </div>
    </article>
  );
}

export default function RacesPage() {
  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Races</h1>
        <p className="mt-1 text-sm text-zinc-500">
          The World Marathon Majors — the races every finisher chases around the world.
        </p>
      </div>

      {YEARS.map((year) => {
        const editions = getMajorsForYear(year);
        return (
          <section key={year} className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">{year} World Major Marathons</h2>
            <div className="flex flex-col gap-3">
              {editions.map((edition) => (
                <EditionCard key={`${edition.major}-${edition.year}`} edition={edition} />
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
