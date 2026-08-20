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
    <article className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div>
        <h3 className="font-medium">{info.name}</h3>
        <p className="mt-0.5 text-xs text-zinc-500">
          {info.city}, {info.country}
        </p>
      </div>
      <div className="text-right">
        <div className="font-mono text-sm tabular-nums">{formatEventDate(edition.date)}</div>
        {!edition.confirmed && (
          <span className="mt-1 inline-block rounded-full border border-amber-300 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:border-amber-800 dark:text-amber-400">
            Estimated date
          </span>
        )}
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
          The World Marathon Majors — the 7 races every finisher chases for the Seven Star medal.
        </p>
      </div>

      {YEARS.map((year) => {
        const editions = getMajorsForYear(year);
        return (
          <section key={year} className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">{year} World&apos;s 7 Major Marathons</h2>
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
